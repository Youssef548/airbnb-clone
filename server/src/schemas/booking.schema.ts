import { z } from "zod";

export const createBookSchema = z.object({
  totalPrice: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  listingId: z.string(),
});
