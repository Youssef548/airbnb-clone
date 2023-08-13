const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const path = require("path");

router.get("/", userController.getPlaces);

module.exports = router;
