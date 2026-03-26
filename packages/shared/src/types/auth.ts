import { SanitizedUser } from "./user";

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
