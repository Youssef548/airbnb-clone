import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error";

export interface UserJwtPayload {
  userId: string;
  role: "guest" | "host";
}

export const isAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(errorHandler(401, "Authentication required."));
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not defined.");
    return next(errorHandler(500, "Internal server error."));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as UserJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(errorHandler(401, "Invalid or expired authentication token."));
  }
};
