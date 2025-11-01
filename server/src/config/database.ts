import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const connectDB = async (url?: string) => {
  const dbUrl =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL;

  try {
    await mongoose.connect(url || (dbUrl as string));
    logger.info("MongoDB Connected...");
  } catch (err) {
    const error = err as Error;
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
