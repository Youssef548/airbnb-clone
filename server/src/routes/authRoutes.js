// routes/authRoutes.js
const express = require("express");
const passport = require("passport");

const router = express.Router();
// const { loginUser } = require("../controllers/authController");

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
