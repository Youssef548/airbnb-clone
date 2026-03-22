import mongoose from "mongoose";
import { Listing } from "../models/listing.model";
import { Booking } from "../models/booking.model";
import { User } from "../models/User.model";
import { errorHandler } from "../utils/error";

export const createListingService = async (
  userId: string,
  listingData: any
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

export const getListingsService = async (queryParams: any) => {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 12;
  const skip = (page - 1) * limit;

  // Build match stage
  const match: any = {};
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
      listings: [{ $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit }],
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
