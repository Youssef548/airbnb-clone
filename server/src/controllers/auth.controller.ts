// controllers/authController.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import { loginUserService, createUserService } from "../services/auth.service";
import {
  LoginRequestBody,
  CreateUserRequestBody,
} from "../interfaces/authInterfaces";

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
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unknown error occurred" });
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
    return res.status(400).json({ error: error.message });
  }
};
