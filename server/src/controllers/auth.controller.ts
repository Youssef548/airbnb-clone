import { Request, Response, NextFunction } from "express";
import { loginUserService, createUserService } from "../services/auth.service";
import {
  LoginRequestBody,
  CreateUserRequestBody,
} from "../interfaces/authInterfaces";
import { User as UserModel } from "../models/User.model";
import { errorHandler } from "../utils/error";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 1000, // 1 hour, matches JWT expiry
  path: "/",
};

export const loginUser = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUserService(email, password);

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Login successful",
      currentUser: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, username } = req.body;
    const { token, user } = await createUserService(email, password, username);

    res.cookie("token", token, COOKIE_OPTIONS);

    return res
      .status(201)
      .json({ message: "User created", currentUser: user });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(errorHandler(401, "User not authenticated"));
    }

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "Logged out" });
};
