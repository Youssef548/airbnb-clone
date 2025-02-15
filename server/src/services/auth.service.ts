// services/authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

export const loginUserService = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign(
    { userId: user._id, favoriteListingsIds: user.favoriteListingsIds },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const { _id, ...userData } = user.toObject();
  const userObject = { ...userData, id: _id.toString() };
  delete userObject.password;

  return { token, user: userObject };
};

export const createUserService = async (
  email: string,
  password: string,
  username: string
) => {
  const isExist = await User.findOne({ email });
  if (isExist) {
    throw new Error("The email already used");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    username,
    image: null,
  });

  await user.save();
  return user;
};
