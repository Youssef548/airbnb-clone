const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const isAuthMiddleware = require("../middleware/isAuth");

router.post("/", isAuthMiddleware, userController.addBooking);
router.get("/", isAuthMiddleware, userController.getUserBooking);

module.exports = router;
