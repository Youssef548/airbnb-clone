import { Request, Response, NextFunction } from "express";
import { Listing } from "../models/listing.model";
import { IListing } from "../models/listing.model";
import { errorHandler } from "../utils/error";
interface CustomRequest extends Request {
  user: {
    userId: string;
  };
}

export async function createListing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const request = req as CustomRequest;
  try {
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
    } = req.body;
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
      user: request.user.userId,
    });
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    return next(errorHandler(401, "something went wrong"));
  }
}
export async function getListings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const queryParams = req.query; // Assuming query parameters are passed via request.query

  let where: any = {};

  if (queryParams.userId) {
    where.user = queryParams.userId;
  }
  if (queryParams.category) {
    where.category = queryParams.category;
  }
  if (queryParams.guestCount) {
    where.guestCount = { $gte: queryParams.guestCount };
  }
  if (queryParams.roomCount) {
    where.roomCount = { $gte: queryParams.roomCount };
  }
  if (queryParams.bathRoomCount) {
    where.bathRoomCount = { $gte: queryParams.bathRoomCount };
  }
  if (queryParams.locationValue) {
    where.location = queryParams.locationValue;
  }

  // Add date filtering to exclude listings with conflicting bookings

  try {
    const listings = await Listing.find(where)
      .populate({ path: "bookings", match: {} }) // Populate bookings without initial filters
      .sort({ id: -1 })
      .exec();

    if (queryParams?.startDate && queryParams?.endDate) {
      const queryStartDate = new Date(queryParams.startDate.toString());
      const queryEndDate = new Date(queryParams.endDate.toString());

      const filteredListings = listings.filter((listing) => {
        return (
          !listing.bookings ||
          listing.bookings.every((booking) => {
            if (booking?.startDate && booking?.endDate) {
              // Create Date objects and reset time to 00:00:00 for comparison
              const bookingStartDate = new Date(booking.startDate);
              bookingStartDate.setHours(0, 0, 0, 0);
              const bookingEndDate = new Date(booking.endDate);
              bookingEndDate.setHours(0, 0, 0, 0);

              // Assuming queryStartDate and queryEndDate are already Date objects
              // Reset their time to 00:00:00 for comparison
              const startOfQueryStartDate = new Date(queryStartDate);
              startOfQueryStartDate.setHours(0, 0, 0, 0);
              const startOfQueryEndDate = new Date(queryEndDate);
              startOfQueryEndDate.setHours(0, 0, 0, 0);

              // Check if booking is entirely outside the specified date range
              const outsideRange =
                bookingEndDate < startOfQueryStartDate ||
                bookingStartDate > startOfQueryEndDate;

              return outsideRange;
            }
            return true; // If no startDate or endDate, consider it as passing the filter
          })
        );
      });

      return res.status(200).json(filteredListings);
    }
    res.status(200).json(listings);
  } catch (error) {
    console.error(error);
    return next(errorHandler(401, "something went wrong"));
  }
}

export async function getListingById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    if (!listingId) {
      return next(errorHandler(400, "Missing listing id"));
    }

    const listing = await Listing.findById(listingId).populate("user").exec();

    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    const listingData: IListing = listing.toObject();

    res.status(200).json({
      ...listingData,
      createdAt: listingData.createdAt?.toISOString(),
      user: {
        ...listingData.user,
        password: null,
        createdAt: listingData.createdAt?.toISOString(),
        updatedAt: listingData.updatedAt?.toISOString(),
      },
    });
  } catch (err) {}
}

export async function deleteListing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    const request = req as CustomRequest;
    if (!listingId) {
      return next(errorHandler(400, "Missing listing id"));
    }
    await Listing.deleteMany({
      _id: listingId,
      user: request.user.userId,
    });
    res.status(204).json();
  } catch (err) {
    console.error(err);
    return next(errorHandler(500, "something went wrong"));
  }
}
