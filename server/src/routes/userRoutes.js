// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
} = require("../controllers/userController");

router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);

module.exports = router;
