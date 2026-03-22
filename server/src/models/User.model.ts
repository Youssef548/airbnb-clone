import mongoose, { Model, Types } from "mongoose";


export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string; // Optional for OAuth users
  role: string;
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
    role: {
      type: String,
      enum: ['guest', 'host'],
      default: 'guest'
    },
    image: { type: String },
    password: { type: String, required: false }, // Optional for OAuth users
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
// Sparse indexes for OAuth provider IDs (only index documents that have the field)
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ githubId: 1 }, { sparse: true });

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export { UserModel as User };
