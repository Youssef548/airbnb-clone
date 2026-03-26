import { Request, Response, NextFunction } from "express";
import {
  addFavoriteService,
  deleteFavoriteService,
  getFavoriteListingsService,
} from "../services/favorite.service";
import { PAGINATION } from "../config/constants";

export async function addFavorite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;

    const updatedUser = await addFavoriteService(req.user!.userId!, listingId);

    res.status(200).json({ data: updatedUser, message: "Success" });
  } catch (error) {
    next(error);
  }
}

export async function deleteFavorite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;

    const updatedUser = await deleteFavoriteService(
      req.user!.userId!,
      listingId
    );

    res.status(200).json({ data: updatedUser, message: "Success" });
  } catch (error) {
    next(error);
  }
}

export async function getFavoriteListings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page =
      parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit =
      parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;

    const result = await getFavoriteListingsService(
      req.user!.userId!,
      page,
      limit
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
