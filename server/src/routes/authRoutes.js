// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const { loginUser } = require("../controllers/authController");

const router = express.Router();
// const { loginUser } = require("../controllers/authController");

router.post("/login", loginUser);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
