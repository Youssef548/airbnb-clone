import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the review
export interface IReview extends Document {
  rating: number;
  comment: string;
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the review
const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    listing: {
      type: mongoose.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing is required"],
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      required: true,
    },
  }
);

// Index to ensure one review per user per listing
ReviewSchema.index({ user: 1, listing: 1 }, { unique: true });

// Define the model for the review
const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);

export { ReviewModel as Review };
