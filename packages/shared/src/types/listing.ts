import { LocationValue } from "./location";
import { UserType } from "./user";

export type ListingType = {
  _id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  roomCount: number;
  bathRoomCount: number;
  guestCount: number;
  price: number;
  location: LocationValue;
  user: UserType;
  reviews: string[];
  bookings: string[];
  averageRating?: number;
  reviewCount?: number;
};

export type safeListingType = Omit<ListingType, "createdAt"> & {
  createdAt: string;
};
