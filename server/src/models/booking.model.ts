import mongoose from "mongoose";
import { IListing } from "./listing.model";

export interface IBooking extends Document {
  startDate: Date;
  endDate: Date;
  guest: mongoose.Schema.Types.ObjectId;
  listing: IListing;
  listingId: IListing;
  totalPrice: Number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guest: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    listingId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Listing",
    },
    authorId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      required: true,
    },
  }
);

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export { BookingModel as Booking };
