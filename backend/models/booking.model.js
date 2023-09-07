import mongoose from "mongoose";
import { Schema } from "mongoose";

const BookingSchema = new Schema({
  place: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Place" },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  numberOfGuests: { type: Number, required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  price: Number,
});

export default mongoose.model("Booking", BookingSchema);
