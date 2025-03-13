import { z } from "zod";

const locationSchema = z.object({
  flag: z.string({
    required_error: "Flag is required",
    invalid_type_error: "Flag must be a string",
  }),
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Label must be a string",
  }),
  latlng: z
    .array(z.number({ invalid_type_error: "Each coordinate must be a number" }))
    .nonempty("Latitude and longitude are required"),
  region: z.string({
    required_error: "Region is required",
    invalid_type_error: "Region must be a string",
  }),
  value: z.string({
    required_error: "Value is required",
    invalid_type_error: "Value must be a string",
  }),
});


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

  location: locationSchema,
});
