import mongoose from "mongoose";
import { afterAll, beforeAll } from "vitest";
import connectDB from "../src/config/database";

beforeAll(async () => {
  await connectDB(process.env.TEST_DATABASE_URL as string);
});

afterAll(async () => {
  await mongoose.connection.close();
});
