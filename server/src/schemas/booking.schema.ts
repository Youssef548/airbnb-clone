import { z } from "zod";

export const createBookSchema = z.object({
  totalPrice: z.number({
    required_error: "Total price is required",
    invalid_type_error: "Total price must be a number",
  }),
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "End date must be a date",
  }),
  listingId: z.string({
    required_error: "Listing ID is required",
    invalid_type_error: "Listing ID must be a string",
  }),
});

export const cancelBookSchema = z.object({
  bookingId: z.string(),
});
