import { z } from "zod";

export const loginUserShema = z.object({
  email: z.string({ required_error: "email is required" }).email(),
  password: z
    .string({ required_error: "password is required" })
    .min(5, { message: "password should be greater than 5" }),
});

export const registerUserSchema = z.object({
  username: z
    .string({ required_error: "userName is required" })
    .min(3, { message: "userName should be greater than 3" })
    .max(20, { message: "userName should be less than 20" }),
  email: z.string({ required_error: "email is required" }).email(),
  password: z
    .string({ required_error: "password is required" })
    .min(5, { message: "password should be greater than 5" }),
});
