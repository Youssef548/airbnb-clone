import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string({
      invalid_type_error: "Username must be a string",
    })
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username cannot exceed 50 characters" })
    .optional(),
  email: z
    .string({
      invalid_type_error: "Email must be a string",
    })
    .email({ message: "Invalid email format" })
    .optional(),
  image: z
    .string({
      invalid_type_error: "Image must be a string",
    })
    .url({ message: "Image must be a valid URL" })
    .optional()
    .nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({
    required_error: "Current password is required",
    invalid_type_error: "Current password must be a string",
  }),
  newPassword: z
    .string({
      required_error: "New password is required",
      invalid_type_error: "New password must be a string",
    })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*]/, { message: "Password must contain at least one special character (!@#$%^&*)" }),
});

export const deleteAccountSchema = z.object({
  password: z.string({
    required_error: "Password is required to delete account",
    invalid_type_error: "Password must be a string",
  }),
});

export const uploadAvatarSchema = z.object({
  imageUrl: z
    .string({
      required_error: "Image URL is required",
      invalid_type_error: "Image URL must be a string",
    })
    .url({ message: "Must be a valid URL" }),
});
