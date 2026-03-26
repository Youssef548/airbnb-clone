import mongoose from "mongoose";
import { afterAll, beforeAll } from "vitest";
import { connectDatabase } from "@airbnb/database";

beforeAll(async () => {
  await connectDatabase(process.env.TEST_DATABASE_URL as string);
});

afterAll(async () => {
  await mongoose.connection.close();
});
