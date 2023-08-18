const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (err) {
    throw new Error("Error hashing password");
  }
};

const verifyPassword = async (password, hashPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashPassword);
    return isMatch;
  } catch (err) {
    throw new Error("Error comparing passwords");
  }
};

module.exports = { hashPassword, verifyPassword };
