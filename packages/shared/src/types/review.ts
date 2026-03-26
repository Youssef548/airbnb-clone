import { UserType } from "./user";

export type ReviewType = {
  _id: string;
  listing: string;
  user: UserType;
  rating: number;
  comment: string;
  createdAt: string;
};
