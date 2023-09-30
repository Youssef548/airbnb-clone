import mongoose from "mongoose";
import { Schema } from "mongoose";
import Joi from "joi";

const PlaceSchema = new Schema({
  title: Joi.string().required(),
  address: Joi.string().required(),
  photos: Joi.array().items(Joi.string()), // Adjust as needed
  description: Joi.string().required(),
  perks: Joi.array().items(Joi.string()), // Adjust as needed
  extraInfo: Joi.string(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date().required(),
  maxGuests: Joi.number().integer().required(),
  price: Joi.number().required(),
});

export default mongoose.model("Place", PlaceSchema);
