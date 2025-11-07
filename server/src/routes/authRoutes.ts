// routes/authRoutes.js
import express, { Request, Response, NextFunction } from "express";
import { loginUser, createUser , getMe } from "../controllers/auth.controller";
import { oauthCallback, oauthFailure, checkOAuthAvailability } from "../controllers/oauth.controller";
import validateSchema from "../middleware/validationFactory.middleware";
import { loginUserShema, registerUserSchema } from "../schemas/userSchema";
import { isAuth } from "../middleware/auth.middleware";
import passport from "../config/passport";

const router = express.Router();

// Middleware to check if OAuth provider is configured
const checkOAuthConfig = (provider: 'google' | 'github') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

    if (provider === 'google') {
      if (!process.env.GOOGLE_CLIENT_ID ||
          !process.env.GOOGLE_CLIENT_SECRET ||
          process.env.GOOGLE_CLIENT_ID === "your_google_client_id_here") {
        return res.redirect(`${CLIENT_URL}/auth/error?message=${encodeURIComponent('Google OAuth is not configured. Please contact the administrator.')}`);
      }
    } else if (provider === 'github') {
      if (!process.env.GITHUB_CLIENT_ID ||
          !process.env.GITHUB_CLIENT_SECRET ||
          process.env.GITHUB_CLIENT_ID === "your_github_client_id_here") {
        return res.redirect(`${CLIENT_URL}/auth/error?message=${encodeURIComponent('GitHub OAuth is not configured. Please contact the administrator.')}`);
      }
    }

    next();
  };
};

// Traditional auth routes
router.post("/login", validateSchema(loginUserShema), loginUser);
router.post("/register",validateSchema(registerUserSchema), createUser);
router.get("/me" , isAuth, getMe);

// OAuth availability check (for frontend to hide/show buttons)
router.get("/oauth/availability", checkOAuthAvailability);

// Google OAuth routes
router.get(
  "/google",
  checkOAuthConfig('google'),
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  checkOAuthConfig('google'),
  passport.authenticate("google", {
    failureRedirect: "/api/auth/failure",
    session: false
  }),
  oauthCallback
);

// GitHub OAuth routes
router.get(
  "/github",
  checkOAuthConfig('github'),
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  checkOAuthConfig('github'),
  passport.authenticate("github", {
    failureRedirect: "/api/auth/failure",
    session: false
  }),
  oauthCallback
);

// OAuth failure route
router.get("/failure", oauthFailure);

export default router
