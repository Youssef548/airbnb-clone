import mongoose from "mongoose";
const { Schema } = mongoose;

import { verifyPassword } from "../utils/bcryptUtils.js";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Number, default: Date.now() },
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    const isvalid = await verifyPassword(password, this.password);
    return isvalid;
  } catch (err) {
    throw new Error(err);
  }
};

export default mongoose.model("User", userSchema);
