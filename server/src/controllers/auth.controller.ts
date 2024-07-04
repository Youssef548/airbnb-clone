// controllers/authController.js
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.model";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the email and password from the request body
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isPasswordValid = bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    const token = jwt.sign(
      { userId: user._id, favoriteListingsIds: user.favoriteListingsIds },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Token expiry time
      }
    );
    const { _id, ...userData } = user.toObject();
    const userObject = { ...userData, id: _id.toString() }; // Ensure _id is converted to string if needed
    delete userObject.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      currentUser: {
        ...userObject,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to login" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, username } = req.body;

    const isExist = await User.findOne({ email: email });

    if (isExist) {
      return res.status(400).json({ message: "The email already used" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      username,
      image: null,
    });

    await user.save();

    return res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};
