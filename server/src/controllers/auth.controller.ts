// controllers/authController.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import { loginUserService, createUserService } from "../services/auth.service";
import {
  LoginRequestBody,
  CreateUserRequestBody,
  User as UserInterface,
} from "../interfaces/authInterfaces";
import { User as UserModel } from "../models/User.model";
// Express Request type is extended globally in types/express/index.d.ts

dotenv.config();

export const loginUser = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUserService(email, password);

    return res.status(200).json({
      message: "Login successful",
      token,
      currentUser: user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(400).json({ message: "An unknown error occurred" });
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserRequestBody>,
  res: Response
) => {
  try {
    const { email, password, username } = req.body;

    const user = await createUserService(email, password, username);
    return res.status(201).json({ message: "User created", currentUser: user });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};


export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unknown error occurred" });
  }
}