import { Request, Response, NextFunction } from "express";
import { Listing } from "../models/listing.model";
import { errorHandler } from "../utils/error";
import { User } from "../models/User.model";
interface CustomRequest extends Request {
  user: {
    userId: string;
    favoriteListingsIds: string[];
  };
}

export async function addFavorite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const request = req as CustomRequest;
    const { listingId } = req.params;

    if (!listingId || typeof listingId !== "string") {
      return next(errorHandler(400, "Invalid listing ID"));
    }

    const listing = await Listing.findById(listingId).lean();
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    const currentUser = await User.findById(request.user.userId).lean();
    if (!currentUser) {
      return next(errorHandler(404, "User not found"));
    }

    // Convert ObjectId to string for comparison
    let favoriteIds = new Set(
      (currentUser.favoriteListingsIds || []).map((id) => id.toString())
    );
    if (favoriteIds.has(listingId)) {
      return next(errorHandler(400, "Listing is already in user's favorites"));
    }

    favoriteIds.add(listingId);

    const updatedUser = await User.findByIdAndUpdate(
      request.user.userId,
      { favoriteListingsIds: Array.from(favoriteIds) },
      { new: true, lean: true }
    );

    if (!updatedUser) {
      return next(errorHandler(500, "Failed to update user favorites"));
    }

    const userObject = { ...updatedUser, id: updatedUser._id };
    delete userObject.password;

    res.status(200).json({ data: userObject, message: "Success" });
  } catch (e) {
    console.error(e);
    next(errorHandler(500, "Internal server error"));
  }
}

export async function deleteFavorite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const request = req as CustomRequest;
    const { listingId } = req.params;

    if (!listingId || typeof listingId !== "string") {
      return next(errorHandler(400, "Invalid listing ID"));
    }

    const listing = await Listing.findById(listingId).lean();
    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    const currentUser = await User.findById(request.user.userId).lean();
    if (!currentUser) {
      return next(errorHandler(404, "User not found"));
    }

    // Convert ObjectId to string for comparison
    let favoriteIds = new Set(
      (currentUser.favoriteListingsIds || []).map((id) => id.toString())
    );
    if (!favoriteIds.has(listingId)) {
      return next(errorHandler(400, "Listing is not in user's favorites"));
    }

    favoriteIds.delete(listingId);

    const updatedUser = await User.findByIdAndUpdate(
      request.user.userId,
      { favoriteListingsIds: Array.from(favoriteIds) },
      { new: true, lean: true }
    );

    if (!updatedUser) {
      return next(errorHandler(500, "Failed to update user favorites"));
    }

    const userObject = { ...updatedUser, id: updatedUser._id };
    delete userObject.password;

    return res.status(200).json({ data: userObject, message: "Success" });
  } catch (e) {
    console.error(e);
    next(errorHandler(500, "Internal server error"));
  }
}

export async function getFavoriteListings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const request = req as CustomRequest;
    const user = await User.findOne({ _id: request.user.userId });
    if (!user) return next(errorHandler(500, "something went wrong"));
    const favoriteListingIds = user.favoriteListingsIds;
    console.log(favoriteListingIds);
    const favorites = await Listing.find({
      _id: { $in: [...(favoriteListingIds || [])] },
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite.toObject(),
      createdAt: favorite.createdAt?.toDateString(),
    }));

    res.status(200).json(safeFavorites);
  } catch (err) {
    console.error(err);
    next(errorHandler(500, "Internal server error"));
  }
}
