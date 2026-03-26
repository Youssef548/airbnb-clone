import { ListingType } from "./listing";

export type ReservationType = {
  _id: string;
  listingId: string;
  userId: string;
  checkInDate: Date;
  checkOutDate: Date;
  startDate: Date;
  endDate: Date;
  status: "confirmed" | "pending" | "cancelled";
  totalPrice: number;
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
