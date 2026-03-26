import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "@airbnb/database";
import { SanitizedUser } from "@airbnb/shared";

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Temporary store for OAuth code exchange
const pendingTokens = new Map<
  string,
  { token: string; user: SanitizedUser; expiresAt: number }
>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of pendingTokens) {
    if (entry.expiresAt < now) {
      pendingTokens.delete(code);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if OAuth providers are configured
 */
export const checkOAuthAvailability = (_req: Request, res: Response) => {
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
 * OAuth callback - generates a short-lived code and redirects to frontend
 */
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as IUser;

    if (!user) {
      return res.redirect(
        `${CLIENT_URL}/auth/error?message=Authentication failed`
      );
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
      favoriteListingsIds: user.favoriteListingsIds?.map((id) => id.toString()),
      role: user.role,
    };

    // Generate a short-lived code instead of putting token in URL
    const code = crypto.randomBytes(32).toString("hex");
    pendingTokens.set(code, {
      token,
      user: sanitizedUser,
      expiresAt: Date.now() + 60_000, // 1 minute
    });

    return res.redirect(`${CLIENT_URL}/auth/callback?code=${code}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.redirect(
      `${CLIENT_URL}/auth/error?message=Something went wrong`
    );
  }
};

/**
 * Exchange a short-lived code for an httpOnly cookie with JWT
 */
export const exchangeCode = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Code is required" });
  }

  const entry = pendingTokens.get(code);

  if (!entry || entry.expiresAt < Date.now()) {
    pendingTokens.delete(code);
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  pendingTokens.delete(code);

  // Set httpOnly cookie with the JWT
  res.cookie("token", entry.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({ currentUser: entry.user });
};

/**
 * OAuth failure handler
 */
export const oauthFailure = (_req: Request, res: Response) => {
  return res.redirect(
    `${CLIENT_URL}/auth/error?message=Authentication failed`
  );
};
