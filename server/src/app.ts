// app.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
dotenv.config();

import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/booking.route";
import favoriteRoutes from "./routes/favorite.route";
import listingRoutes from "./routes/listing.route";

const app = express();

// Security: Helmet helps secure Express apps by setting HTTP response headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Security: CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? JSON.parse(process.env.ALLOWED_ORIGINS)
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void
    ) => {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if the origin is in the allowedOrigins array
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;

// Security: Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Security: Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all requests
app.use(limiter);

// Middleware setup
// Security: Request size limits to prevent DoS attacks
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security: Sanitize data to prevent NoSQL injection attacks
app.use(mongoSanitize());

// Routes setup
app.get("/", (req, res) => res.send("Express on Vercel"));
app.use("/api/auth/", authLimiter, authRoutes);
app.use("/api/listings/", listingRoutes);
app.use("/api/favorites/", favoriteRoutes);
app.use("/api/booking/", bookingRoutes);

app.use(errorHandler);

export default app;
