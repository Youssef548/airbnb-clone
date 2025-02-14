// controllers/bookingController.ts
import { Request, Response, NextFunction } from "express";
import {
  createBookingService,
  getBookingsService,
  cancelBookingService,
} from "../services/booking.service";

interface CustomRequest extends Request {
  user: { userId: string };
}

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const booking = await createBookingService({
      ...req.body,
      userId: cusReq.user.userId,
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters = {
      listingId: req.params.listingId,
      guest: req.params.userId,
      authorId: req.params.authorId,
    };
    const bookings = await getBookingsService(filters);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const message = await cancelBookingService(
      req.params.bookingId,
      cusReq.user.userId
    );
    res.status(204).json(message);
  } catch (error) {
    next(error);
  }
}
