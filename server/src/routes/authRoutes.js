// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const {
  loginUser,
  loginByGoogle,
  loginByGithub,
  getCurrentUser,
} = require("../controllers/authController");
const validateSchema = require("../middleware/validationFactory");
const {loginUserShema} = require("../schemas/userSchema");

const router = express.Router();
// const { loginUser } = require("../controllers/authController");

router.post("/login", validateSchema(loginUserShema), loginUser);
router.get("/github", loginByGithub);
router.get("/google", loginByGoogle);
router.get("/get-user", getCurrentUser);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
