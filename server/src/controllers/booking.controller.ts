// controllers/bookingController.ts
import { Request, Response, NextFunction } from "express";
import {
  createBookingService,
  getBookingsService,
  cancelBookingService,
  getMyBookingsService,
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

// this should be for admins only in future not for guests or host
export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters: Record<string, any> = {};

    if (req.query.listingId) {
      filters.listingId = req.query.listingId;
    }
    if (req.query.userId) {
      filters.guest = req.query.userId;
    }
    if (req.query.authorId) {
      filters.authorId = req.query.authorId;
    }

    const bookings = await getBookingsService(filters);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const bookings = await getMyBookingsService(cusReq.user.userId);
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
