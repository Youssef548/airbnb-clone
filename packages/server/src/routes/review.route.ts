import { Router } from "express";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/review.controller";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import { createReviewSchema } from "@airbnb/database";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

/**
 * @swagger
 * /reviews/{listingId}:
 *   post:
 *     summary: Create a review for a listing
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string, minLength: 10, maxLength: 1000 }
 *     responses:
 *       201:
 *         description: Review created
 *       403:
 *         description: Must have a booking to review
 *   get:
 *     summary: Get reviews for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated reviews
 *
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete own review
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Review deleted
 *       403:
 *         description: Can only delete own reviews
 */
router.post(
  "/:listingId",
  isAuth,
  validateObjectId("listingId"),
  validateSchema(createReviewSchema),
  createReview
);
router.get("/:listingId", validateObjectId("listingId"), getReviews);
router.delete("/:reviewId", isAuth, validateObjectId("reviewId"), deleteReview);

export default router;
