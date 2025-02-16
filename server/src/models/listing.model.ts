import mongoose, { Schema, Document } from "mongoose";
import { IBooking } from "./booking.model";

// Define the interface for the listing
export interface IListing extends Document {
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  roomCount: number;
  bathRoomCount: number;
  guestCount: number;
  price: number;
  location: string;
  user: mongoose.Types.ObjectId;
  reviews?: mongoose.Types.ObjectId[];
  bookings?: IBooking[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the listing
const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageSrc: { type: String, required: true },
    category: { type: String, required: true },
    roomCount: { type: Number, required: true },
    bathRoomCount: { type: Number, required: true },
    guestCount: { type: Number, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
    bookings: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      required: true,
    },
  }
);

// Define the model for the listing
const ListingModel = mongoose.model<IListing>("Listing", ListingSchema);

export { ListingModel as Listing };
