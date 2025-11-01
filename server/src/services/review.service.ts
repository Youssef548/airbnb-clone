import { Review } from "../models/review.model";
import { Listing } from "../models/listing.model";
import { Booking } from "../models/booking.model";
import { errorHandler } from "../utils/error";

interface CreateReviewData {
  rating: number;
  comment: string;
  listingId: string;
  userId: string;
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

/**
 * Create a new review for a listing
 */
export const createReviewService = async (data: CreateReviewData) => {
  const { rating, comment, listingId, userId } = data;

  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw errorHandler(404, "Listing not found");
  }

  // Check if user is the listing owner (can't review own listing)
  if (listing.user.toString() === userId) {
    throw errorHandler(400, "You cannot review your own listing");
  }

  // Check if user has already reviewed this listing
  const existingReview = await Review.findOne({
    user: userId,
    listing: listingId,
  });

  if (existingReview) {
    throw errorHandler(400, "You have already reviewed this listing");
  }

  // Optional: Check if user has booked this listing (commented out for now)
  // const hasBooked = await Booking.findOne({
  //   guest: userId,
  //   listingId: listingId,
  // });
  // if (!hasBooked) {
  //   throw errorHandler(400, "You must book this listing before reviewing");
  // }

  // Create the review
  const review = new Review({
    rating,
    comment,
    user: userId,
    listing: listingId,
  });

  const savedReview = await review.save();

  // Add review to listing's reviews array
  await Listing.findByIdAndUpdate(listingId, {
    $push: { reviews: savedReview._id },
  });

  return savedReview.populate("user", "name email");
};

/**
 * Get all reviews for a listing
 */
export const getListingReviewsService = async (listingId: string) => {
  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw errorHandler(404, "Listing not found");
  }

  const reviews = await Review.find({ listing: listingId })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .exec();

  return reviews.map((review) => ({
    ...review.toObject(),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }));
};

/**
 * Get a single review by ID
 */
export const getReviewByIdService = async (reviewId: string) => {
  const review = await Review.findById(reviewId)
    .populate("user", "name email")
    .populate("listing", "title imageSrc");

  if (!review) {
    throw errorHandler(404, "Review not found");
  }

  return {
    ...review.toObject(),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
};

/**
 * Update a review
 */
export const updateReviewService = async (
  reviewId: string,
  userId: string,
  data: UpdateReviewData
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw errorHandler(404, "Review not found");
  }

  // Check if user is the review owner
  if (review.user.toString() !== userId) {
    throw errorHandler(403, "You can only update your own reviews");
  }

  // Update review fields
  if (data.rating !== undefined) {
    review.rating = data.rating;
  }
  if (data.comment !== undefined) {
    review.comment = data.comment;
  }

  const updatedReview = await review.save();

  return updatedReview.populate("user", "name email");
};

/**
 * Delete a review
 */
export const deleteReviewService = async (reviewId: string, userId: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw errorHandler(404, "Review not found");
  }

  // Check if user is the review owner
  if (review.user.toString() !== userId) {
    throw errorHandler(403, "You can only delete your own reviews");
  }

  // Remove review from listing's reviews array
  await Listing.findByIdAndUpdate(review.listing, {
    $pull: { reviews: reviewId },
  });

  await review.deleteOne();

  return "Review successfully deleted";
};

/**
 * Get all reviews by a user
 */
export const getUserReviewsService = async (userId: string) => {
  const reviews = await Review.find({ user: userId })
    .populate("listing", "title imageSrc price")
    .sort({ createdAt: -1 })
    .exec();

  return reviews.map((review) => ({
    ...review.toObject(),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }));
};

/**
 * Get average rating for a listing
 */
export const getListingAverageRatingService = async (listingId: string) => {
  const result = await Review.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: "$listing",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: result[0].totalReviews,
  };
};
