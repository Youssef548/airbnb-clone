import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { errorHandler } from "../utils/error";

const validateSchema = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      let errorMessage = "Validation Error";
      if (err instanceof ZodError) {
        errorMessage = err.errors[0].message;
        return next(errorHandler(400, errorMessage));
      } else {
        return next(errorHandler(500, errorMessage));
      }
    }
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as Record<string, string>;
      next();
    } catch (err) {
      let errorMessage = "Query Validation Error";
      if (err instanceof ZodError) {
        errorMessage = err.errors[0].message;
        return next(errorHandler(400, errorMessage));
      } else {
        return next(errorHandler(500, errorMessage));
      }
    }
  };
};

export default validateSchema;
