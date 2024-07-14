import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/error";
import { Booking } from "../models/booking.model";
import { Listing } from "../models/listing.model";

interface CustomRequest extends Request {
  user: {
    userId: string;
  };
}

interface WhereObject {
  listingId?: string;
  guest?: string;
  authorId?: string;
}

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const { totalPrice, startDate, endDate, listingId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return next(errorHandler(404, "sorry list not found!"));

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

    if (existingBooking) {
      return next(
        errorHandler(400, "Requested dates are not available for booking.")
      );
    }
    const authorId = listing.user;
    const booking = new Booking({
      totalPrice,
      startDate,
      endDate,
      guest: cusReq.user.userId,
      authorId,
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

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId, userId, authorId } = req.params;
    let whereObject: WhereObject = {};

    if (listingId) whereObject.listingId = listingId;
    if (userId) whereObject.guest = userId;
    if (authorId) whereObject.authorId = authorId;

    const booksReservation = await Booking.find({ ...whereObject })
      .populate("listingId")
      .sort({ createdAt: -1 })
      .exec();

    const booksSaveReservations = booksReservation.map((reservation) => ({
      ...reservation.toObject(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      endDate: reservation.endDate?.toDateString(),
      listingId: null,
      listing: reservation.listingId
        ? {
            ...reservation.listingId.toObject(),
            createdAt: reservation?.listingId
              .toObject()
              ?.createdAt?.toISOString(),
          }
        : undefined,
    }));

    return res.status(200).json(booksSaveReservations);
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Something went wrong!"));
  }
}

export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const { bookingId } = req.params;

    if (!bookingId)
      return next(errorHandler(400, "reservation id not provided"));
    const booking = await Booking.deleteMany({
      _id: bookingId,
      $or: [
        { guest: cusReq.user.userId },
        { listing: { user: cusReq.user.userId } },
      ],
    });

    if (!booking.deletedCount) {
      return next(errorHandler(404, "Booking not found"));
    }

    res.status(204).json("reservation successfully canceled");
  } catch (err) {
    console.error(err);
    next(errorHandler(500, "something went wrong!"));
  }
}
