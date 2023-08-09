const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const photosMiddleware = multer({ storage });

router.post("/upload-by-link", userController.uploadByLink);
router.post(
  "/upload",
  photosMiddleware.array("photos", 100),
  userController.upload
);

module.exports = router;
