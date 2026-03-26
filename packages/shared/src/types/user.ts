export type UserType = {
  _id: string;
  username: string;
  image: string;
  email: string;
  name?: string;
  age?: number;
  favoriteListingsIds?: string[];
  role: string;
};

export interface SanitizedUser {
  id: string;
  email: string;
  username: string;
  image?: string | null;
  favoriteListingsIds?: string[];
  role: string;
}
