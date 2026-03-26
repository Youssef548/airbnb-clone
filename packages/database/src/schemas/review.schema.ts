import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string({
      required_error: "Comment is required",
      invalid_type_error: "Comment must be a string",
    })
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must be at most 1000 characters"),
});
