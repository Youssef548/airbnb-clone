import mongoose from "mongoose";
import { connectDatabase, seedDatabase } from "@airbnb/database";
import { clearDatabase } from "./db-helpers/clearDatabase";


async function main() {
  await connectDatabase(process.env.TEST_DATABASE_URL as string);

  await clearDatabase();

  await seedDatabase();

  await mongoose.connection.close();
}

main().catch((err) => console.error(err));
