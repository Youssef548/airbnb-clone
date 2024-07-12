import { z } from "zod";

export const createBookSchema = z.object({
  totalPrice: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  listingId: z.string(),
});
