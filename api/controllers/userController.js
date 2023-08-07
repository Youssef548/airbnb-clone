const { hashPassword } = require("../utils/bcryptUtils");
const path = require("path");
const User = require("../db/schemas/user");
const passport = require("passport");
const imageDownloader = require("image-downloader");

const userController = {};

userController.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      // Throw a 400 Bad Request error if name, email, or password is missing
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ error: "this is email is already used" });

    // Hash the user's password using the hashPassword function from bcryptUtils.js
    const hashedPassword = await hashPassword(password);

    // Create a new user with the hashed password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Respond with the registered user's data and a 201 Created status
    res
      .status(201)
      .json({ message: "User registered successfully.", user: newUser });
  } catch (err) {
    // Handle any errors that occur during the registration process
    res
      .status(500)
      .json({ error: "An error occurred while registering the user." });
  }
};

userController.loginUser = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) return res.status(401).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Optionally, you can respond with the user data or a success message
      return res.status(200).json({ message: "Login successful.", user });
    });
  })(req, res, next);
};

userController.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while logging out." });
    }

    res.status(200).json({ message: "Logged out successfully." });
  });
};

userController.getUser = async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;

    console.log(user.name);

    res.json({ user });
  } else {
    res.send(404);
  }
};

userController.uploadByLink = async (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ error: "Image URL is required." });
  }

  try {
    // Construct the absolute path to the "uploads" directory
    const uploadsDir = path.join(__dirname, "..", "uploads");

    const newName = "photo" + Date.now() + ".jpg";

    const options = {
      url: link, // URL of the image to download
      dest: `${uploadsDir}/${newName}`, // Destination directory
    };

    const { filename } = await imageDownloader.image(options);

    // Respond with the filename of the downloaded image
    res.json({ message: "Image downloaded successfully.", filename: newName });
  } catch (error) {
    console.log("Error downloading image:", error);
    res
      .status(500)
      .json({ error: "An error occurred while downloading the image." });
  }
};

module.exports = userController;
