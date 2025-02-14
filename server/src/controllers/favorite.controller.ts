import { Request, Response, NextFunction } from "express";
import {
  addFavoriteService,
  deleteFavoriteService,
  getFavoriteListingsService,
} from "../services/favorite.service";

interface CustomRequest extends Request {
  user: { userId: string };
}

export async function addFavorite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    const cusReq = req as CustomRequest;

    const updatedUser = await addFavoriteService(cusReq.user.userId, listingId);

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
    const cusReq = req as CustomRequest;

    const updatedUser = await deleteFavoriteService(
      cusReq.user.userId,
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
    const cusReq = req as CustomRequest;

    const favorites = await getFavoriteListingsService(cusReq.user.userId);

    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
}
