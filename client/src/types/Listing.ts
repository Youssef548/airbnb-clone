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
  location: string;
  user: UserType;
  reviews: string[];
  bookings: string[];
};

export type safeListingType = Omit<ListingType, "createdAt"> & {
  createdAt: string;
};
