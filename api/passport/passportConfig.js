const passport = require("passport");
const { Strategy } = require("passport-local");
const User = require("../db/schemas/user");

passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    
    try {
      const user = await User.findOne({ email });

      if (!user) return done(null, false, { message: "User not found" });

      const validPassword = await user.isValidPassword(password);

      if (!validPassword) return done(null, false, { message: "Auth failed" });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id); // Use user.id instead of user._id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
