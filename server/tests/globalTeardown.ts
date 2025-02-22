// tests/globalSetup.ts
import mongoose from "mongoose";
import connectDB from "../src/config/database";
import { User } from "../src/models/User.model";
import { Booking } from "../src/models/booking.model";
import { Listing } from "../src/models/listing.model";

const user = {
  username: "youssef",
  email: "testtest@example.com",
  password: "Strong3Pass123#",
};

async function main() {
  await connectDB(process.env.TEST_DATABASE_URL as string);

  // TODO: clearDatabase function
  await User.deleteMany();
  await Listing.deleteMany();
  await Booking.deleteMany();

  console.log("GLOBAL DELETE ALL DONE");

  await mongoose.connection.close();
}

main();
