import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";
import { LoginResponse, SanitizedUser } from "../interfaces/authInterfaces";
import dotenv from "dotenv";

dotenv.config();

// Ensure JWT_SECRET is loaded at startup
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Please set it in your .env file."
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

export const loginUserService = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id, favoriteListingsIds: user.favoriteListingsIds },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const sanitizedUser: SanitizedUser = {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    image: user.image || null,
    favoriteListingsIds: user.favoriteListingsIds,
    role: user.role,
  };

  return { token, user: sanitizedUser };
};

export const createUserService = async (
  email: string,
  password: string,
  username: string,
  role: string = "guest"
): Promise<SanitizedUser> => {
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
    role,
  });

  await user.save();

  const sanitizedUser: SanitizedUser = {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    image: user.image || null,
    role: user.role,
  };

  return sanitizedUser;
};
