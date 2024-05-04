// controllers/authController.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require("../models");
const jwt = require("jsonwebtoken")
const loginUser = async (req, res, next) => {
  try {
    // Get the email and password from the request body
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Password is valid, create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
      expiresIn: '1h', // Token expiry time
    });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to login' });
  }
};const logOut = (req, res , next) => {
  
}



const loginByGithub = (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) {
      console.error(err);
      return res.redirect("http://localhost:5173/");
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.redirect("http://localhost:5173/");
        // return res.status(500).json({ error: "Failed to login", msg: err });
      }
      return res.status(200).json({
        message: "Login successful",
        IdleDeadline: user._id,
        redirectUrl: "http://localhost:5173/",
      });
    });
  })(req, res, next);
};

const loginByGoogle = (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Failed to login" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to login" });
      }
      return res
        .status(200)
        .json({ message: "Login successful", IdleDeadline: user._id });
    });
  })(req, res, next);
};

const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    res.json({id: user._id, email:user.email , username: user.username });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

module.exports = { loginUser, loginByGithub, loginByGoogle, getCurrentUser };
