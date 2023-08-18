const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");
const passport = require("passport");
const isAuthMiddleware = require("../middleware/isAuth");

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
router.post("/add", isAuthMiddleware, userController.addPlace);
router.put("/add/:id", isAuthMiddleware, userController.updatePlace);
router.get("/", isAuthMiddleware, userController.getUserPlaces);
router.get("/:id", isAuthMiddleware, userController.getPlaceById);

module.exports = router;
