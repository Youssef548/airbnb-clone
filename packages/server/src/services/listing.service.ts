import mongoose from "mongoose";
import { z } from "zod";
import { Listing, Booking, User, createListingSchema } from "@airbnb/database";
import { errorHandler } from "../utils/error";
import { PAGINATION } from "../config/constants";

type CreateListingData = z.infer<typeof createListingSchema>;

function getSortStage(sortBy?: string): Record<string, 1 | -1> {
  switch (sortBy) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "rating":
      return { averageRating: -1 };
    case "newest":
    default:
      return { _id: -1 };
  }
}

export const createListingService = async (
  userId: string,
  listingData: CreateListingData
) => {
  const {
    title,
    description,
    imageSrc,
    category,
    roomCount,
    bathRoomCount,
    guestCount,
    location,
    price,
  } = listingData;

  const listing = new Listing({
    title,
    description,
    imageSrc,
    category,
    roomCount,
    bathRoomCount,
    guestCount,
    location,
    price,
    user: userId,
  });

  await listing.save();
  return listing;
};

export const getListingsService = async (
  queryParams: Record<string, string | undefined>
) => {
  const page = parseInt(queryParams.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(
    parseInt(queryParams.limit as string) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  // Build match stage
  const match: Record<string, unknown> = {};
  if (queryParams.userId)
    match.user = new mongoose.Types.ObjectId(queryParams.userId);
  if (queryParams.category) match.category = queryParams.category;
  if (queryParams.guestCount)
    match.guestCount = { $gte: parseInt(queryParams.guestCount) };
  if (queryParams.roomCount)
    match.roomCount = { $gte: parseInt(queryParams.roomCount) };
  if (queryParams.bathRoomCount)
    match.bathRoomCount = { $gte: parseInt(queryParams.bathRoomCount) };
  if (queryParams.locationValue)
    match["location.value"] = queryParams.locationValue;
  if (queryParams.minPrice)
    match.price = {
      ...(match.price as object),
      $gte: parseInt(queryParams.minPrice as string),
    };
  if (queryParams.maxPrice)
    match.price = {
      ...(match.price as object),
      $lte: parseInt(queryParams.maxPrice as string),
    };

  const pipeline: mongoose.PipelineStage[] = [{ $match: match }];

  // Date filtering: exclude listings with overlapping bookings
  if (queryParams?.startDate && queryParams?.endDate) {
    const queryStartDate = new Date(queryParams.startDate.toString());
    const queryEndDate = new Date(queryParams.endDate.toString());

    pipeline.push(
      {
        $lookup: {
          from: "bookings",
          localField: "bookings",
          foreignField: "_id",
          as: "populatedBookings",
        },
      },
      {
        $match: {
          populatedBookings: {
            $not: {
              $elemMatch: {
                startDate: { $lt: queryEndDate },
                endDate: { $gt: queryStartDate },
              },
            },
          },
        },
      },
      { $project: { populatedBookings: 0 } }
    );
  }

  // Use $facet for count + paginated results in a single query
  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalCount" }],
      listings: [
        { $sort: getSortStage(queryParams.sortBy as string) },
        { $skip: skip },
        { $limit: limit },
      ],
    },
  });

  const [result] = await Listing.aggregate(pipeline);

  const totalCount = result.metadata[0]?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    listings: result.listings,
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

export const getListingByIdService = async (listingId: string) => {
  if (!listingId) throw errorHandler(400, "Missing listing id");

  const listing = await Listing.findById(listingId)
    .populate("user", "-password")
    .lean()
    .exec();

  if (!listing) throw errorHandler(404, "Listing not found");

  return listing;
};

export const deleteListingService = async (
  userId: string,
  listingId: string
) => {
  if (!listingId) throw errorHandler(400, "Missing listing id");

  const listing = await Listing.findById(listingId);

  if (!listing) throw errorHandler(400, "Listing not found");

  if (listing.user.toString() !== userId)
    throw errorHandler(403, "You are not authorized to delete this listing");

  // Cascading cleanup: remove related bookings and favorite refs
  await Booking.deleteMany({ listingId: listing._id });
  await User.updateMany(
    { favoriteListingsIds: listing._id },
    { $pull: { favoriteListingsIds: listing._id } }
  );

  await listing.deleteOne();
};
