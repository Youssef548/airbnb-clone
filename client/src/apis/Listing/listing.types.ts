import { CountrySelectValue } from "../../components/Inputs/CountrySelect";

export interface IListingParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathRoomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  page?: number;
  limit?: number;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListingsResponse {
  listings: unknown[];
  pagination: PaginationData;
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
}
