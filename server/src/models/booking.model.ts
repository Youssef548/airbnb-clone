import mongoose, { Document, Types } from "mongoose";

export interface IBooking extends Document {
  startDate: Date;
  endDate: Date;
  guest: Types.ObjectId;
  listingId: Types.ObjectId;
  authorId: Types.ObjectId;
  totalPrice: number;
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

// Indexes for common queries
BookingSchema.index({ listingId: 1 });
BookingSchema.index({ guest: 1 });
BookingSchema.index({ authorId: 1 });
BookingSchema.index({ listingId: 1, startDate: 1, endDate: 1 });

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export { BookingModel as Booking };
