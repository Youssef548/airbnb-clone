import { Listing, User } from "@airbnb/database";
import { errorHandler } from "../utils/error";
import { PAGINATION } from "../config/constants";

export const addFavoriteService = async (userId: string, listingId: string) => {
  if (!listingId) throw errorHandler(400, "Invalid listing ID");

  const listing = await Listing.findById(listingId).lean();
  if (!listing) throw errorHandler(404, "Listing not found");

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, favoriteListingsIds: { $ne: listingId } },
    { $addToSet: { favoriteListingsIds: listingId } },
    { new: true, lean: true }
  );

  if (!updatedUser)
    throw errorHandler(400, "Listing is already in user's favorites");

  return updatedUser;
};

export const deleteFavoriteService = async (
  userId: string,
  listingId: string
) => {
  if (!listingId) throw errorHandler(400, "Invalid listing ID");

  const listing = await Listing.findById(listingId).lean();
  if (!listing) throw errorHandler(404, "Listing not found");

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, favoriteListingsIds: listingId },
    { $pull: { favoriteListingsIds: listingId } },
    { new: true, lean: true }
  );

  if (!updatedUser)
    throw errorHandler(400, "Listing is not in user's favorites");

  return updatedUser;
};

export const getFavoriteListingsService = async (
  userId: string,
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT
) => {
  const user = await User.findById(userId).lean();
  if (!user) throw errorHandler(500, "Something went wrong");

  const favoriteListingIds = user.favoriteListingsIds || [];
  const totalCount = favoriteListingIds.length;
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;

  const favorites = await Listing.find({ _id: { $in: favoriteListingIds } })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    favorites,
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
