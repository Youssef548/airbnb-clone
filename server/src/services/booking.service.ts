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

const mapBookingWithListing = (reservation: any) => ({
  ...reservation,
  listing: reservation.listingId || null,
  listingId: reservation.listingId?._id || null,
});

export const getBookingsService = async (filters: Record<string, any>) => {
  const bookings = await Booking.find(filters)
    .populate("listingId")
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return bookings.map(mapBookingWithListing);
};

export const getMyBookingsService = async (userId: string) => {
  const bookings = await Booking.find({ guest: userId })
    .populate("listingId")
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return bookings.map(mapBookingWithListing);
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
  const populatedListing = booking.listingId as any;
  const isListingOwner =
    populatedListing && populatedListing.user?.toString() === userId;

  if (!isGuest && !isListingOwner) {
    throw errorHandler(403, "Unauthorized to cancel this booking");
  }

  // Authorized: proceed with cancellation (deletion)
  await booking.deleteOne();

  return "Reservation successfully canceled";
};
