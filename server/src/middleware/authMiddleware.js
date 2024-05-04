const jwt = require('jsonwebtoken');
require("dotenv").config();

function isAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) return res.status(403).send('Forbidden');
    req.user = user;
    next();
  });
}

module.exports = isAuth;
