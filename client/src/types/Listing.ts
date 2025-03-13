import { CountrySelectValue } from "../components/Inputs/CountrySelect";
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
  location: CountrySelectValue;
  user: UserType;
  reviews: string[];
  bookings: string[];
};

export type safeListingType = Omit<ListingType, "createdAt"> & {
  createdAt: string;
};
