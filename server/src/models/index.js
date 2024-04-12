const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, unique: true },
  password: String,
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  createdAt: { type: Date, default: Date.now },
  googleId: { type: String },
  githubId: { type: String },
  facebookId: { type: String },
});

const ListingSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: String,
  imageUrl: String,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
});

const BookingSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  totalPrice: Number,
});

const ReviewSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
});

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", UserSchema);
const ListingModel = mongoose.model("Listing", ListingSchema);
const BookingModel = mongoose.model("Booking", BookingSchema);
const ReviewModel = mongoose.model("Review", ReviewSchema);
const SessionModel = mongoose.model("Session", SessionSchema);

module.exports = {
  User: UserModel,
  Listing: ListingModel,
  Booking: BookingModel,
  Review: ReviewModel,
  Session: SessionModel,
};
