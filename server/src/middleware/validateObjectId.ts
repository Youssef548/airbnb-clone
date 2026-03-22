import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { errorHandler } from "../utils/error";

/**
 * Middleware factory that validates route params are valid MongoDB ObjectIds.
 * @param paramNames - Route parameter names to validate
 */
export const validateObjectId = (...paramNames: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const param of paramNames) {
      const value = req.params[param];
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return next(errorHandler(400, `Invalid ${param} format`));
      }
    }
    next();
  };
};
