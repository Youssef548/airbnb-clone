// app.js
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport"); // Assuming passport configuration is in config/passport.js
const { PrismaClient } = require("@prisma/client");

const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: "dasmdlaldmasmldlams",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
// connectDB();

// Middleware setup
app.use(express.json());

// Routes setup
app.use("/api", userRoutes);
app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
