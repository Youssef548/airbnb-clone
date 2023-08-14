const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const path = require("path");

router.get("/", userController.getPlaces);
router.get("/:id", userController.getPlaceById);

module.exports = router;
