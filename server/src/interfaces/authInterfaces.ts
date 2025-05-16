import mongoose from "mongoose";


export interface User {
  user: SanitizedUser;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface CreateUserRequestBody {
  email: string;
  password: string;
  username: string;
}

export interface LoginResponse {
  token: string;
  user: SanitizedUser;
}

export interface SanitizedUser {
  id: string;
  email: string;
  username: string;
  image?: string | null;
  favoriteListingsIds?: mongoose.Types.ObjectId[];
  role: string;
}
