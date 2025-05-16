import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error";

// Import our custom JWT payload type
import { UserJwtPayload } from '../types/express';

interface AuthenticatedRequest extends Request {
  user: UserJwtPayload;
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const request = req as AuthenticatedRequest;
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authentication token is missing or invalid." });
   
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    // Handle missing JWT_SECRET environment variable
    console.error("JWT_SECRET is not defined.");
    return next(errorHandler(500, "Internal server error."));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    request.user = decoded as UserJwtPayload;
    next();
  } catch (error) {
    console.error(error);
    return next(errorHandler(401, "Invalid authentication token."));
  }
};
