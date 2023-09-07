const isAuthMiddleWare = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ message: "Not Auth" });
  }
};

export default isAuthMiddleWare;
