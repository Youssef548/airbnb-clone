// controllers/bookingController.ts
import { Request, Response, NextFunction } from "express";
import {
  createBookingService,
  getBookingsService,
  cancelBookingService,
  getMyBookingsService,
} from "../services/booking.service";

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const booking = await createBookingService({
      ...req.body,
      userId: req.user!.userId,
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

// Reserved for future admin use — not currently wired to any route
export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters: Record<string, string> = {};

    if (req.query.listingId) {
      filters.listingId = req.query.listingId as string;
    }
    if (req.query.userId) {
      filters.guest = req.query.userId as string;
    }
    if (req.query.authorId) {
      filters.authorId = req.query.authorId as string;
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
    const listingId = req.query.listingId as string | undefined;
    const authorId = req.query.authorId as string | undefined;

    // When listingId is provided, return all bookings for that listing
    // (needed by listing detail page to show disabled dates from all guests)
    if (listingId) {
      const bookings = await getBookingsService({ listingId });
      return res.status(200).json(bookings);
    }

    // When authorId is provided, return bookings on that host's properties
    // (needed by reservations page to show guests' bookings on host's listings)
    if (authorId) {
      const bookings = await getBookingsService({ authorId });
      return res.status(200).json(bookings);
    }

    // Default: return the current user's bookings as a guest (trips page)
    const bookings = await getMyBookingsService(req.user!.userId!);
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
    await cancelBookingService(req.params.bookingId, req.user!.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
