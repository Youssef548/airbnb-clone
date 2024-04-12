// controllers/authController.js
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

// Configure Passport with Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // assuming email is used for login
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid password" });
        }

        // Password is valid, return user
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID:
        // "643592862216-io0i9oprku8l43hrgr16bt7n0f54f2qm.apps.googleusercontent.com",
      // clientSecret: "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",
      callbackURL: "http://localhost:3000/auth/google/callback",
      scope: ["profile", "email"], // Add the required scope parameter here
    },
    // function (accessToken, refreshToken, profile, cb) {
    //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //     return cb(err, user);
    //   });
    // }
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user is already registered
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          console.log("NO USER");

          // Create a new user if not registered
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configure Passport with GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      // clientID: "709d0284611e250ae014",
      // clientSecret: "709d0284611e250ae014",
      callbackURL: "http://localhost:3000/api/auth/github",
      scope: ["read:user", "user:email"], // Add the required scope parameter here
    },
    // /api/github/callback
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user is already registered
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          // Create a new user if not registered
          user = await User.create({
            githubId: profile.id,
            email: profile.emails[0].value,
          });
        }
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Failed to login" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to login" });
      }
      return res
        .status(200)
        .json({ message: "Login successful", IdleDeadline: user._id });
    });
  })(req, res, next);
};

const loginByGithub = (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) {
      console.error(err);
      return res.redirect("http://localhost:5173/");
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.redirect("http://localhost:5173/");
        // return res.status(500).json({ error: "Failed to login", msg: err });
      }
      return res
        .status(200)
        .json({ message: "Login successful", IdleDeadline: user._id });
    });
  })(req, res, next);
};

const loginByGoogle = (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Failed to login" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to login" });
      }
      return res
        .status(200)
        .json({ message: "Login successful", IdleDeadline: user._id });
    });
  })(req, res, next);
};

module.exports = { loginUser, loginByGithub, loginByGoogle };
