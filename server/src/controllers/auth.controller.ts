// controllers/authController.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import { loginUserService, createUserService } from "../services/auth.service";

dotenv.config();

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUserService(email, password);

    return res.status(200).json({
      message: "Login successful",
      token,
      currentUser: user,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    await createUserService(email, password, username);
    return res.status(201).json({ message: "User created" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
