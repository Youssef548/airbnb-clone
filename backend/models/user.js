const mongoose = require("mongoose");
const { verifyPassword } = require("../utils/bcryptUtils");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    return await verifyPassword(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
