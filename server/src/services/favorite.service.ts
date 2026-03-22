import { Listing } from "../models/listing.model";
import { User } from "../models/User.model";
import { errorHandler } from "../utils/error";

export const addFavoriteService = async (userId: string, listingId: string) => {
  if (!listingId) throw errorHandler(400, "Invalid listing ID");

  const listing = await Listing.findById(listingId).lean();
  if (!listing) throw errorHandler(404, "Listing not found");

  const user = await User.findById(userId).lean();
  if (!user) throw errorHandler(404, "User not found");

  let favoriteIds = new Set(
    (user.favoriteListingsIds || []).map((id) => id.toString())
  );
  if (favoriteIds.has(listingId))
    throw errorHandler(400, "Listing is already in user's favorites");

  favoriteIds.add(listingId);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { favoriteListingsIds: Array.from(favoriteIds) },
    { new: true, lean: true }
  );

  if (!updatedUser) throw errorHandler(500, "Failed to update user favorites");

  return updatedUser;
};

export const deleteFavoriteService = async (
  userId: string,
  listingId: string
) => {
  if (!listingId) throw errorHandler(400, "Invalid listing ID");

  const listing = await Listing.findById(listingId).lean();
  if (!listing) throw errorHandler(404, "Listing not found");

  const user = await User.findById(userId).lean();
  if (!user) throw errorHandler(404, "User not found");

  let favoriteIds = new Set(
    (user.favoriteListingsIds || []).map((id) => id.toString())
  );
  if (!favoriteIds.has(listingId))
    throw errorHandler(400, "Listing is not in user's favorites");

  favoriteIds.delete(listingId);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { favoriteListingsIds: Array.from(favoriteIds) },
    { new: true, lean: true }
  );

  if (!updatedUser) throw errorHandler(500, "Failed to update user favorites");

  return updatedUser;
};

export const getFavoriteListingsService = async (
  userId: string,
  page: number = 1,
  limit: number = 12
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
