// app.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/booking.route";
import favoriteRoutes from "./routes/favorite.route";
import listingRoutes from "./routes/listing.route";

const app = express();

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void
    ) => {
      // Check if the origin is in the allowedOrigins array
      if (
        !origin ||
        (process.env.ALLOWED_ORIGINS &&
          process.env.ALLOWED_ORIGINS.includes(origin))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());

// Routes setup
app.get("/", (req, res) => res.send("Express on Vercel"));
app.use("/api/auth/", authRoutes);
app.use("/api/listings/", listingRoutes);
app.use("/api/favorites/", favoriteRoutes);
app.use("/api/booking/", bookingRoutes);

app.use(errorHandler);

export default app;
