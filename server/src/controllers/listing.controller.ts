import { Request, Response, NextFunction } from "express";
import { Listing } from "../models/listing.model";
import { errorHandler } from "../utils/error";
interface CustomRequest extends Request {
  user: {
    id: string;
  };
}

export async function createListing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const request = req as CustomRequest;
  try {
    console.log("createListing");
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
      userId: request.user.id,
    });
    await listing.save();
    res.status(201).send(listing);
  } catch (error) {
    console.error(error);
    return next(errorHandler(401, "something went wrong"));
  }
}
