import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  listing: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    listing: {
      type: mongoose.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ listing: 1, user: 1 }, { unique: true });
ReviewSchema.index({ listing: 1, createdAt: -1 });

const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);

export { ReviewModel as Review };
