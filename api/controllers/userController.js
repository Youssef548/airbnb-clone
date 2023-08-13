const { hashPassword } = require("../utils/bcryptUtils");
const path = require("path");
const User = require("../db/schemas/user");
const Place = require("../db/schemas/Place");
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

userController.upload = async (req, res) => {
  res.json(req.files);
};

userController.addPlace = async (req, res) => {
  // Check if req.user._id exists
  if (!req.user || !req.user._id) {
    return res.status(400).json({ error: "User not authorized" });
  }

  try {
    const {
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    } = req.body;

    // Create a new place document with owner as req.user._id
    const placeDoc = await Place.create({
      owner: req.user._id,
      price,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });

    res.json(placeDoc);
  } catch (err) {
    console.error("Error creating place:", err);
    res
      .status(500)
      .json({ error: "An error occurred while creating the place" });
  }
};

userController.getUserPlaces = async (req, res) => {
  try {
    const userId = req.user._id;
    const places = await Place.find({ owner: userId });

    res.json(places);
  } catch (err) {
    console.error("Error fetching places:", err);
    res.status(500).json({ err: "An error occurred while fetching places" });
  }
};

userController.updatePlace = async (req, res) => {
  const { id } = req.params;

  if (!req.user || !req.user._id) {
    return res.status(400).json({ error: "User not authorized" });
  }

  try {
    const userId = req.user._id;
    const updatedPlace = {
      owner: userId,
      ...req.body,
    };

    const place = await Place.findByIdAndUpdate(id, updatedPlace, {
      new: true,
    });

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.json(place);
  } catch (err) {
    console.error("Error fetching places:", err);
    res.status(500).json({ err: "An error occurred while fetching places" });
  }
};

userController.getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.json(place);
  } catch (err) {
    console.error(`Error getting place by ID ${id}:`, err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the place" });
  }
};

userController.getPlaces = async (req, res) => {
  res.json(await Place.find());
};

module.exports = userController;
