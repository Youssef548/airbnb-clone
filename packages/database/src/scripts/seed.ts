import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { seedDatabase } from "../seeders";

// Load .env from the server package (where env vars are defined)
dotenv.config({ path: path.resolve(__dirname, "../../../server/.env") });

async function runSeed() {
  try {
    const dbUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/airbnb";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");

    console.log("\nStarting to seed database...");
    await seedDatabase();

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  }
}

runSeed();
