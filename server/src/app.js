// app.js
const express = require("express");
const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(express.json());

// Routes setup
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
