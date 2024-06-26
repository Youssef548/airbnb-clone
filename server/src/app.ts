// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/database";
import authRoutes from "./routes/authRoutes";
import errorHandler from "./middleware/error.middleware";

const app = express();

app.use(
  cors({
    origin: (origin: string | undefined, callback: (arg0: Error | null, arg1: boolean | undefined) => void) => {
      // Check if the origin is in the allowedOrigins array
      if (!origin || (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.includes(origin))) {
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
app.use("/api/auth/", authRoutes);

app.use(errorHandler);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});