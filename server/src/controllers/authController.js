// controllers/authController.js
const passport = require("../config/passport.js");

const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to login" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to login" });
      }

      return res
        .status(200)
        .json({ message: "Login successful", IdleDeadline: user._id });
    });
  })(req, res, next);
};

const logOut = (req, res , next) => {
  
}



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
      return res.status(200).json({
        message: "Login successful",
        IdleDeadline: user._id,
        redirectUrl: "http://localhost:5173/",
      });
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

const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    res.json({id: user._id, email:user.email , username: user.username });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

module.exports = { loginUser, loginByGithub, loginByGoogle, getCurrentUser };
