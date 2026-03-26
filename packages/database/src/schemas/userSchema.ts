import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.string({ required_error: "email is required" }).email(),
  password: z
    .string({ required_error: "password is required" })
    .min(1, { message: "password is required" }),
});

export const registerUserSchema = z.object({
  username: z
    .string({ required_error: "userName is required" })
    .min(3, { message: "userName should be greater than 3" })
    .max(20, { message: "userName should be less than 20" }),
  email: z.string({ required_error: "email is required" }).email(),
  password: z
    .string({ required_error: "password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    }),
});
