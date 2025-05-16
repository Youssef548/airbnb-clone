import * as express from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Define the structure of our JWT payload
interface UserJwtPayload extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}
