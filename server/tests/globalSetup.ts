import mongoose from "mongoose";
import connectDB from "../src/config/database";
import { User } from "../src/models/User.model";
import { createUserService } from "../src/services/auth.service";

const user = {
  username: "youssef",
  email: "testtest@example.com",
  password: "Strong3Pass123#",
};

async function main() {
  await connectDB(process.env.TEST_DATABASE_URL as string);

  // TODO: clearDatabase function
  await User.deleteMany();

  await createUserService(user.email, user.password, user.username);

  await mongoose.connection.close();
}

main();
