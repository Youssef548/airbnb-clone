import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/error";
import { Booking } from "../models/booking.model";
import { Listing } from "../models/listing.model";

interface CustomRequest extends Request {
  user: {
    userId: string;
  };
}

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const { totalPrice, startDate, endDate, listingId } = req.body;

    const booking = new Booking({
      totalPrice,
      startDate,
      endDate,
      guest: cusReq.user.userId,
    });

    const savedBooking = await booking.save();
    const listing = await Listing.findById(listingId);
    listing?.bookings?.push(savedBooking._id);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    next(errorHandler(500, "Failed to create booking"));
  }
}
