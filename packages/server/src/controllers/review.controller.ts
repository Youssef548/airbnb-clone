import { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  getReviewsService,
  deleteReviewService,
} from "../services/review.service";

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    const review = await createReviewService(
      req.user!.userId!,
      listingId,
      req.body
    );
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

export async function getReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getReviewsService(listingId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewId } = req.params;
    await deleteReviewService(req.user!.userId!, reviewId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
