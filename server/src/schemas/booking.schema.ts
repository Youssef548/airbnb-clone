import { z } from "zod";

export const createBookSchema = z.object({
  totalPrice: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  listingId: z.string(),
});

export const cancelBookSchema = z.object({
  bookingId: z.string(),
});
