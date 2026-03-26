import mongoose from "mongoose";
import { Review, Booking, Listing } from "@airbnb/database";
import { errorHandler } from "../utils/error";

interface CreateReviewData {
  rating: number;
  comment: string;
}

export const createReviewService = async (
  userId: string,
  listingId: string,
  data: CreateReviewData
) => {
  // Verify user has a completed booking for this listing
  const booking = await Booking.findOne({
    guest: userId,
    listingId: listingId,
  });

  if (!booking) {
    throw errorHandler(
      403,
      "You must have a booking for this listing to leave a review"
    );
  }

  // Check if user already reviewed this listing (also enforced by unique index)
  const existingReview = await Review.findOne({
    listing: listingId,
    user: userId,
  });

  if (existingReview) {
    throw errorHandler(400, "You have already reviewed this listing");
  }

  const review = new Review({
    listing: listingId,
    user: userId,
    rating: data.rating,
    comment: data.comment,
  });

  await review.save();

  // Recalculate listing stats
  await recalculateListingStats(listingId);

  return review.populate("user", "username image");
};

export const getReviewsService = async (
  listingId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ listing: listingId })
      .populate("user", "username image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Review.countDocuments({ listing: listingId }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const deleteReviewService = async (userId: string, reviewId: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw errorHandler(404, "Review not found");
  }

  if (review.user.toString() !== userId) {
    throw errorHandler(403, "You can only delete your own reviews");
  }

  const listingId = review.listing.toString();
  await review.deleteOne();

  // Recalculate listing stats
  await recalculateListingStats(listingId);
};

async function recalculateListingStats(listingId: string) {
  const stats = await Review.aggregate([
    {
      $match: {
        listing: new mongoose.Types.ObjectId(listingId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.averageRating
    ? Math.round(stats[0].averageRating * 10) / 10
    : 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  await Listing.findByIdAndUpdate(listingId, { averageRating, reviewCount });
}
