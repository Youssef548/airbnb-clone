import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  }),
  imageSrc: z.string({
    required_error: "Image is required",
    invalid_type_error: "Image must be a string",
  }),

  price: z.number({
    required_error: "price is required",
    invalid_type_error: "price must be a number",
  }),
  category: z.string({
    required_error: "Category is required",
    invalid_type_error: "Category must be a string",
  }),
  roomCount: z.number({
    required_error: "Room count is required",
    invalid_type_error: "Room count must be a number",
  }),
  guestCount: z.number({
    required_error: "guestCount count is required",
    invalid_type_error: "guest count must be a number",
  }),
  bathRoomCount: z.number({
    required_error: "bathRoom count is required",
    invalid_type_error: "bathroom count must be a number",
  }),

  location: z.string({
    required_error: "Location is required",
    invalid_type_error: "Location must be a string",
  }),
});
