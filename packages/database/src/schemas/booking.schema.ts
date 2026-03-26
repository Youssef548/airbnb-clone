import { z } from "zod";

export const createBookSchema = z.object({
  totalPrice: z.number({
    required_error: "Total price is required",
    invalid_type_error: "Total price must be a number",
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Start date must be in the format YYYY-MM-DD",
  }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "End date must be in the format YYYY-MM-DD",
  }),
  listingId: z.string({
    required_error: "Listing ID is required",
    invalid_type_error: "Listing ID must be a string",
  }),
});

export const cancelBookSchema = z.object({
  bookingId: z.string(),
});
