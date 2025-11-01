import { UserType } from "./user";
import { ListingType } from "./Listing";

export type ReviewType = {
  _id: string;
  rating: number;
  comment: string;
  user: UserType;
  listing: string | ListingType;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewData = {
  rating: number;
  comment: string;
  listingId: string;
};

export type UpdateReviewData = {
  rating?: number;
  comment?: string;
};
