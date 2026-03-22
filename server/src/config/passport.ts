import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/User.model";
import dotenv from "dotenv";

dotenv.config();

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if user exists with this email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });

            if (user) {
              // User exists with email, link Google account
              user.googleId = profile.id;
              user.image = user.image || profile.photos?.[0]?.value;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const newUser = new User({
            googleId: profile.id,
            email: email || `${profile.id}@google.oauth`,
            username: profile.displayName || profile.emails?.[0]?.value.split('@')[0] || `user_${profile.id}`,
            image: profile.photos?.[0]?.value,
            password: crypto.randomBytes(32).toString("hex"), // Random password (won't be used for OAuth users)
            role: "guest",
            emailVerified: new Date(),
          });

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback",
        scope: ["user:email"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user already exists with this GitHub ID
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Get primary email from GitHub
          const email = profile.emails?.[0]?.value;

          if (email) {
            // Check if user exists with this email
            user = await User.findOne({ email });

            if (user) {
              // User exists with email, link GitHub account
              user.githubId = profile.id;
              user.image = user.image || profile.photos?.[0]?.value;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const newUser = new User({
            githubId: profile.id,
            email: email || `${profile.id}@github.oauth`,
            username: profile.username || profile.displayName || `user_${profile.id}`,
            image: profile.photos?.[0]?.value || profile._json.avatar_url,
            password: crypto.randomBytes(32).toString("hex"), // Random password (won't be used for OAuth users)
            role: "guest",
            emailVerified: email ? new Date() : undefined,
          });

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
