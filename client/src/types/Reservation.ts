import { ListingType } from "./Listing";

export type ReservationType = {
  _id: string;
  listingId: string; // Assuming listingId is represented as a string
  userId: string; // Assuming userId is represented as a string
  checkInDate: Date;
  checkOutDate: Date;
  startDate: Date;
  endDate: Date;
  status: "confirmed" | "pending" | "cancelled";
  totalPrice: Number;
};

export type ReservationSafeType = Omit<
  ReservationType,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: ListingType;
};
