// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userController");
router.post("/register", createUser);
// router.get("/get-user", getCurrentUser);

module.exports = router;
