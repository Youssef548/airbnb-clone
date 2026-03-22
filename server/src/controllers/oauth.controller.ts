import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User.model";
import { SanitizedUser } from "../interfaces/authInterfaces";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * Check if OAuth providers are configured
 * Returns which OAuth providers are available
 */
export const checkOAuthAvailability = (req: Request, res: Response) => {
  const googleAvailable = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here"
  );

  const githubAvailable = !!(
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET &&
    process.env.GITHUB_CLIENT_ID !== "your_github_client_id_here"
  );

  return res.json({
    google: googleAvailable,
    github: githubAvailable,
  });
};

/**
 * OAuth callback handler - generates JWT and redirects to frontend
 * This is called after successful OAuth authentication
 */
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (!user) {
      return res.redirect(`${CLIENT_URL}/auth/error?message=Authentication failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Create sanitized user object
    const sanitizedUser: SanitizedUser = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      image: user.image || null,
      favoriteListingsIds: user.favoriteListingsIds,
      role: user.role,
    };

    // Redirect to frontend with token and user data
    // Frontend will extract these from URL and store them
    const redirectUrl = `${CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(sanitizedUser))}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.redirect(`${CLIENT_URL}/auth/error?message=Something went wrong`);
  }
};

/**
 * OAuth failure handler
 */
export const oauthFailure = (req: Request, res: Response) => {
  return res.redirect(`${CLIENT_URL}/auth/error?message=Authentication failed`);
};
