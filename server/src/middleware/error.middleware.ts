// errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/error'; // Adjust the path to your CustomError class

// Error handling middleware function
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  });
};

export default errorHandler;
