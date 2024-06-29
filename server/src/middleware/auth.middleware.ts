import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error";

interface AuthenticatedRequest extends Request {
  user: jwt.JwtPayload | string; // Assuming JWT payload is an object or a string
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
    request.user = decoded;
    next();
  } catch (error) {
    // Optionally, differentiate error messages based on the error type
    console.error(error);
    return next(errorHandler(401, "Invalid authentication token."));
  }
};
