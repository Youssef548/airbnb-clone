import Joi from "joi";

const placeSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  address: Joi.string().required(),
  photos: Joi.array().items(Joi.string()), // Adjust as needed
  description: Joi.string().required(),
  perks: Joi.array().items(Joi.string()), // Adjust as needed
  extraInfo: Joi.string(),
  checkIn: Joi.number().required(),
  checkOut: Joi.number().required(),
  maxGuests: Joi.number().integer().required(),
  price: Joi.number().required(),
});

// Validate the place data against the schema
export function validatePlace(data) {
  return placeSchema.validate(data);
}
