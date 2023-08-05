const { hashPassword } = require("../utils/bcryptUtils");
const User = require("../db/schemas/user");
const passport = require("passport");

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
  console.log("TESTING");
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

module.exports = userController;
