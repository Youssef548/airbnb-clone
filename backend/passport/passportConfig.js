import passport from "passport";
import { Strategy } from "passport-local";
import userModel from "../models/user.model.js";

passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const isValidPassword = await user.isValidPassword(password);

      if (!isValidPassword) {
        return done(null, false, {
          message: "Auth failed",
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    if (!user) throw new Error("User not found");
    done(null, user); // Pass 'user' as the second argument
  } catch (err) {
    done(err);
  }
});

export default passport;
