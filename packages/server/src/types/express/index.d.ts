import { JwtPayload } from "jsonwebtoken";

export interface UserJwtPayload extends JwtPayload {
  userId: string;
  role: "guest" | "host";
}

declare global {
  namespace Express {
    // Augment Passport's User interface with our JWT fields (optional to allow Passport docs)
    interface User {
      userId?: string;
      role?: string;
      _id?: any;
      email?: string;
      username?: string;
      image?: string | null;
      favoriteListingsIds?: any[];
      password?: string | null;
    }
  }
}
