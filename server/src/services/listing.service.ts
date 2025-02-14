import { Listing } from "../models/listing.model";
import { IListing } from "../models/listing.model";
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
    location: location.value,
    price,
    user: userId,
  });

  await listing.save();
  return listing;
};

export const getListingsService = async (queryParams: any) => {
  let where: any = {};

  if (queryParams.userId) where.user = queryParams.userId;
  if (queryParams.category) where.category = queryParams.category;
  if (queryParams.guestCount)
    where.guestCount = { $gte: queryParams.guestCount };
  if (queryParams.roomCount) where.roomCount = { $gte: queryParams.roomCount };
  if (queryParams.bathRoomCount)
    where.bathRoomCount = { $gte: queryParams.bathRoomCount };
  if (queryParams.locationValue) where.location = queryParams.locationValue;

  let listings = await Listing.find(where)
    .populate("bookings")
    .sort({ id: -1 })
    .exec();

  if (queryParams?.startDate && queryParams?.endDate) {
    const queryStartDate = new Date(queryParams.startDate.toString());
    const queryEndDate = new Date(queryParams.endDate.toString());

    listings = listings.filter((listing) => {
      return (
        !listing.bookings ||
        listing.bookings.every((booking) => {
          if (booking?.startDate && booking?.endDate) {
            const bookingStartDate = new Date(booking.startDate);
            const bookingEndDate = new Date(booking.endDate);

            return (
              bookingEndDate < queryStartDate || bookingStartDate > queryEndDate
            );
          }
          return true;
        })
      );
    });
  }

  return listings;
};

export const getListingByIdService = async (listingId: string) => {
  if (!listingId) throw errorHandler(400, "Missing listing id");

  const listing = await Listing.findById(listingId).populate("user").exec();
  if (!listing) throw errorHandler(404, "Listing not found");

  const listingData: IListing = listing.toObject();
  return {
    ...listingData,
    createdAt: listingData.createdAt?.toISOString(),
    user: {
      ...listingData.user,
      password: null,
      createdAt: listingData.createdAt?.toISOString(),
      updatedAt: listingData.updatedAt?.toISOString(),
    },
  };
};

export const deleteListingService = async (
  userId: string,
  listingId: string
) => {
  if (!listingId) throw errorHandler(400, "Missing listing id");

  await Listing.deleteMany({ _id: listingId, user: userId });
};
