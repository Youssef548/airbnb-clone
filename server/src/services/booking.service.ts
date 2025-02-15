// services/bookingService.ts
import { Booking } from "../models/booking.model";
import { Listing } from "../models/listing.model";
import { errorHandler } from "../utils/error";

interface CreateBookingData {
  totalPrice: number;
  startDate: Date;
  endDate: Date;
  listingId: string;
  userId: string;
}

export const createBookingService = async (data: CreateBookingData) => {
  const { totalPrice, startDate, endDate, listingId, userId } = data;

  const listing = await Listing.findById(listingId);
  if (!listing) throw errorHandler(404, "Sorry, listing not found!");

  const existingBooking = await Booking.findOne({
    listingId: listingId,
    $or: [
      { startDate: { $lt: startDate }, endDate: { $gt: endDate } },
      { startDate: { $gte: startDate, $lt: endDate } },
      { endDate: { $gt: startDate, $lt: endDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
    ],
  });

  if (existingBooking) {
    throw errorHandler(400, "Requested dates are not available for booking.");
  }

  const authorId = listing.user;
  const booking = new Booking({
    totalPrice,
    startDate,
    endDate,
    guest: userId,
    authorId,
    listingId,
  });

  const savedBooking = await booking.save();
  await Listing.findByIdAndUpdate(listingId, {
    $push: { bookings: savedBooking._id },
  });

  return savedBooking;
};

export const getBookingsService = async (filters: Record<string, any>) => {
  const booksReservation = await Booking.find(filters)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .exec();

  return booksReservation.map((reservation) => ({
    ...reservation.toObject(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    endDate: reservation.endDate?.toDateString(),
    listingId: null,
    listing: reservation.listingId
      ? {
          ...reservation.listingId.toObject(),
          createdAt: reservation.listingId?.createdAt?.toISOString(),
        }
      : undefined,
  }));
};

export const cancelBookingService = async (
  bookingId: string,
  userId: string
) => {
  if (!bookingId) throw errorHandler(400, "Reservation ID not provided");

  // Retrieve the booking and populate listing details to check listing owner
  const booking = await Booking.findById(bookingId).populate("listingId");

  if (!booking) {
    throw errorHandler(400, "Booking not found");
  }

  const isGuest = booking.guest.toString() === userId;
  const isListingOwner =
    booking.listingId && booking.listingId.user.toString() === userId;

  if (!isGuest && !isListingOwner) {
    throw errorHandler(403, "Unauthorized to cancel this booking");
  }

  // Authorized: proceed with cancellation (deletion)
  await booking.deleteOne();

  return "Reservation successfully canceled";
};
