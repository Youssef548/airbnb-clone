import mongoose from "mongoose";
import connectDB from "../src/config/database";
import { User } from "../src/models/User.model";
import { Booking } from "../src/models/booking.model";
import { Listing } from "../src/models/listing.model";
import { clearDatabase } from "./db-helpers/clearDatabase";

async function main() {
  await connectDB(process.env.TEST_DATABASE_URL as string);

  await clearDatabase();

  await mongoose.connection.close();
}

main().catch((err) => console.error(err));
