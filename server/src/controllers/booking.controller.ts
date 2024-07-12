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

    const existingBooking = await Booking.findOne({
      listingId: listingId,
      $or: [
        {
          // Case 1: Existing reservation overlaps with the requested startDate and endDate
          startDate: { $lt: startDate },
          endDate: { $gt: endDate },
        },
        {
          // Case 2: Existing reservation starts within the requested startDate and endDate range
          startDate: { $gte: startDate, $lt: endDate },
        },
        {
          // Corrected Case 3: Existing reservation ends within the requested startDate and endDate range
          endDate: { $gt: startDate, $lt: endDate }, // Changed $lte to $lt
        },
        {
          // Added case: Existing reservation exactly matches the requested startDate and endDate
          startDate: { $gte: startDate, $lte: endDate },
        },
      ],
    });

    console.log(existingBooking);
    if (existingBooking) {
      return next(
        errorHandler(400, "Requested dates are not available for booking.")
      );
    }
    const booking = new Booking({
      totalPrice,
      startDate,
      endDate,
      guest: cusReq.user.userId,
      listingId,
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
