import mongoose from "mongoose";

export interface IBooking extends Document {
  startDate?: Date;
  endDate?: Date;
  guest?: mongoose.Schema.Types.ObjectId;
  listing?: mongoose.Schema.Types.ObjectId;
  totalPrice: Number;
}

const BookingSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  guest: { type: mongoose.Types.ObjectId, ref: "User" },
  listingId: { type: mongoose.Types.ObjectId, ref: "Listing" },
  totalPrice: Number,
});

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export { BookingModel as Booking };
