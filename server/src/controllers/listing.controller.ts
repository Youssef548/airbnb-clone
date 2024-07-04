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
  try {
    const listings = await Listing.find().sort({ id: -1 }); // Sorting by id in descending order
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
