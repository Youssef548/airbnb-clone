import { timeStamp } from "console";
import mongoose from "mongoose";
import { IListing } from "./listing.model";

export interface IBooking extends Document {
  startDate?: Date;
  endDate?: Date;
  guest?: mongoose.Schema.Types.ObjectId;
  listing?: IListing;
  listingId?: IListing;
  totalPrice: Number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new mongoose.Schema(
  {
    startDate: Date,
    endDate: Date,
    guest: { type: mongoose.Types.ObjectId, ref: "User" },
    listingId: { type: mongoose.Types.ObjectId, ref: "Listing" },
    authorId: { type: mongoose.Types.ObjectId, ref: "User" },
    totalPrice: Number,
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
