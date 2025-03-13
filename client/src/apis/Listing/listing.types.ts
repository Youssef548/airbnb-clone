import { CountrySelectValue } from "../../components/Inputs/CountrySelect";

export interface IListingParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathRoomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
}


export interface ListingRequestBody  {
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  roomCount: number;
  bathRoomCount: number;
  guestCount: number;
  price: number;
  location: CountrySelectValue;
  reviews?: string[]; // array of ObjectId strings (optional)
  bookings?: string[]; // array of ObjectId strings (optional)
};
