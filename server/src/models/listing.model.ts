import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the listing
export interface IListing extends Document {
  title?: string;
  description?: string;
  imageSrc?: string;
  category?: string;
  roomCount?: number;
  bathRoomCount?: number;
  guestCount?: number;
  price?: number;
  location?: string;
  user: mongoose.Types.ObjectId;
  reviews?: mongoose.Types.ObjectId[];
  bookings?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema for the listing
const ListingSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    imageSrc: { type: String },
    category: { type: String },
    roomCount: { type: Number },
    bathRoomCount: { type: Number },
    guestCount: { type: Number },
    price: { type: Number },
    location: { type: String },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
    bookings: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Define the model for the listing
const ListingModel = mongoose.model<IListing>("Listing", ListingSchema);

export { ListingModel as Listing };
