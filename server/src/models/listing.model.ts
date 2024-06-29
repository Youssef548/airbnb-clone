import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageSrc: String,
  category: String,
  roomCount: Number,
  bathRoomCount: Number,
  guestCount: Number,
  price: Number,
  location: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
});

const ListingModel = mongoose.model("Listing", ListingSchema);

export { ListingModel as Listing };
