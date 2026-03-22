import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

dotenv.config();

import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/booking.route";
import favoriteRoutes from "./routes/favorite.route";
import listingRoutes from "./routes/listing.route";
import passport from "./config/passport";

const app = express();

// Security headers
app.use(helmet());

// Initialize Passport
app.use(passport.initialize());

// Parse ALLOWED_ORIGINS as JSON array
const allowedOrigins: string[] = (() => {
  try {
    return process.env.ALLOWED_ORIGINS
      ? JSON.parse(process.env.ALLOWED_ORIGINS)
      : [];
  } catch {
    return [];
  }
})();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware setup
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Sanitize request data against NoSQL injection
app.use(mongoSanitize());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

// Routes setup
app.get("/", (req, res) => res.send("Express on Vercel"));
app.use("/api/auth/", authRoutes);
app.use("/api/listings/", listingRoutes);
app.use("/api/favorites/", favoriteRoutes);
app.use("/api/booking/", bookingRoutes);

app.use(errorHandler);

export default app;
