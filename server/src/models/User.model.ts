import mongoose, { Model, Types } from "mongoose";


export interface IUser extends Document {
  username: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password: string;
  favoriteListingsIds: Types.ObjectId[];
  listings?: Types.ObjectId[];
  bookings?: Types.ObjectId[];
  reviews?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  githubId?: string;
  facebookId?: string;
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String, required: true },
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
const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);


export { UserModel as User };
