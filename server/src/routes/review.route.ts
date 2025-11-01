import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema";
import {
  createReview,
  getListingReviews,
  getListingAverageRating,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
} from "../controllers/review.controller";

const router = Router();

// Create a new review (authenticated)
router.post("/", isAuth, validateSchema(createReviewSchema), createReview);

// Get all reviews by the authenticated user
router.get("/user/my-reviews", isAuth, getUserReviews);

// Get all reviews for a specific listing (public)
router.get("/listing/:listingId", getListingReviews);

// Get average rating for a specific listing (public)
router.get("/listing/:listingId/average", getListingAverageRating);

// Get a single review by ID (public)
router.get("/:reviewId", getReviewById);

// Update a review (authenticated, owner only)
router.patch(
  "/:reviewId",
  isAuth,
  validateSchema(updateReviewSchema),
  updateReview
);

// Delete a review (authenticated, owner only)
router.delete("/:reviewId", isAuth, deleteReview);

export default router;
