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

    // Use findByIdAndUpdate with $push operator to add the booking's ID to the listing's bookings array
    await Listing.findByIdAndUpdate(listingId, {
      $push: { bookings: savedBooking._id },
    });

    // No need to load and save the listing separately
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Failed to create booking"));
  }
}
