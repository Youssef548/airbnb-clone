import { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
) => {
  const response: Record<string, unknown> = { data };
  if (message) response.message = message;
  return res.status(statusCode).json(response);
};
