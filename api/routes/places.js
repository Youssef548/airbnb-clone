const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/upload-by-link", userController.uploadByLink);

module.exports = router;
