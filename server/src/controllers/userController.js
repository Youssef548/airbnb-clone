// controllers/userController.js
const passport = require("passport");
const { User } = require("../models");
const bcrypt = require("bcrypt");

async function createUser(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "please provide correct data" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isExist = await User.findOne({ email: email });
    if (isExist) {
      return res.status(400).json({ message: "The email already used" });
    }
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({
      id: newUser.id,
      msg: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}



module.exports = { createUser };
