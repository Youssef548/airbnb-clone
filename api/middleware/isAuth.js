const isAuthMiddleware = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ msg: "not Auth" });
  }
};

module.exports = isAuthMiddleware;
