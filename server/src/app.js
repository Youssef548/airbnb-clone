// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Check if the origin is in the allowedOrigins array
      if (!origin || process.env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Deny the request
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;




// Connect to MongoDB
connectDB();

// Middleware setup
app.use(express.json());

// Routes setup
app.use("/api", userRoutes);
app.use("/api/auth/", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
