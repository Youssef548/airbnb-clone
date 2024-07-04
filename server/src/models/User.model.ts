import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: String,
    favoriteListingsIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    ],
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    createdAt: { type: Date, default: Date.now },
    googleId: { type: String },
    githubId: { type: String },
    facebookId: { type: String },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      required: true,
    },
  }
);

const UserModel = mongoose.model("User", UserSchema);

export { UserModel as User };
