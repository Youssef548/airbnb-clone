import { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  getListingReviewsService,
  getReviewByIdService,
  updateReviewService,
  deleteReviewService,
  getUserReviewsService,
  getListingAverageRatingService,
} from "../services/review.service";

interface CustomRequest extends Request {
  user: { userId: string };
}

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *               - listingId
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               listingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input or already reviewed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const review = await createReviewService({
      ...req.body,
      userId: cusReq.user.userId,
    });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/reviews/listing/{listingId}:
 *   get:
 *     summary: Get all reviews for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: Listing not found
 */
export async function getListingReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const reviews = await getListingReviewsService(req.params.listingId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/reviews/listing/{listingId}/average:
 *   get:
 *     summary: Get average rating for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Average rating and total reviews
 */
export async function getListingAverageRating(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getListingAverageRatingService(req.params.listingId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   get:
 *     summary: Get a single review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
export async function getReviewById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const review = await getReviewByIdService(req.params.reviewId);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Forbidden - not the review owner
 *       404:
 *         description: Review not found
 */
export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const review = await updateReviewService(
      req.params.reviewId,
      cusReq.user.userId,
      req.body
    );
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: Forbidden - not the review owner
 *       404:
 *         description: Review not found
 */
export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const message = await deleteReviewService(
      req.params.reviewId,
      cusReq.user.userId
    );
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/reviews/user/my-reviews:
 *   get:
 *     summary: Get all reviews by the authenticated user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reviews
 *       401:
 *         description: Unauthorized
 */
export async function getUserReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const reviews = await getUserReviewsService(cusReq.user.userId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}
