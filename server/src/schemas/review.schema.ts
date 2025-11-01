import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number",
    })
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot be more than 5" }),
  comment: z
    .string({
      required_error: "Comment is required",
      invalid_type_error: "Comment must be a string",
    })
    .trim()
    .min(10, { message: "Comment must be at least 10 characters" })
    .max(500, { message: "Comment cannot exceed 500 characters" }),
  listingId: z.string({
    required_error: "Listing ID is required",
    invalid_type_error: "Listing ID must be a string",
  }),
});

export const updateReviewSchema = z.object({
  rating: z
    .number({
      invalid_type_error: "Rating must be a number",
    })
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot be more than 5" })
    .optional(),
  comment: z
    .string({
      invalid_type_error: "Comment must be a string",
    })
    .trim()
    .min(10, { message: "Comment must be at least 10 characters" })
    .max(500, { message: "Comment cannot exceed 500 characters" })
    .optional(),
});
