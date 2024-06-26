import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { errorHandler } from "../utils/error";

const validateSchema = (schema: ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      let errorMessage = "Validation Error";
      if (err instanceof ZodError) {
        errorMessage = err.errors[0].message; // Use Zod error message
        return next(errorHandler(400, errorMessage));
      } else {
        console.error("Validation Middleware Error:", err);
        return next(errorHandler(500, errorMessage)); 
      }
    }
  };
};

export default validateSchema;
