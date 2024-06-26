import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.DATABASE_URL as string,
      {} as ConnectOptions
    );
    console.log("Mongodb Connected...");
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
