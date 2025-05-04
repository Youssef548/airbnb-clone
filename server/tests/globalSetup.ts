import mongoose from "mongoose";
import connectDB from "../src/config/database";
import { clearDatabase } from "./db-helpers/clearDatabase";
import { seedDatabase } from "../src/seeders";


async function main() {
  await connectDB(process.env.TEST_DATABASE_URL as string);

  await clearDatabase();

  await seedDatabase();

  await mongoose.connection.close();
}

main().catch((err) => console.error(err));
