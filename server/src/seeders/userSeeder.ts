import { User } from "../models/User.model";
import bcrypt from "bcryptjs";

export async function seedUsers() {
  const user = {
    username: "youssef",
    email: "testtest@example.com",
    password: "Strong3Pass123#",
    role: "host",
  };

  // Check if user already exists
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    console.log(`User with email ${user.email} already exists. Skipping user seed.`);
    return;
  }

  // Create new user
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = new User({
    email: user.email,
    password: hashedPassword,
    username: user.username,
    role: user.role,
    image: null,
  });

  await newUser.save();
  console.log(`Successfully created user: ${user.email}`);
}
