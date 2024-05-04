// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userController");
const validateSchema = require("../middleware/validationFactory");
const {userSchema} = require("../schemas/userSchema");

router.post("/register",validateSchema(userSchema), createUser);
// router.get("/get-user", getCurrentUser);

module.exports = router;
