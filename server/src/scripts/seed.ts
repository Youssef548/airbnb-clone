import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "../seeders";

dotenv.config();

async function runSeed() {
  try {
    // Connect to MongoDB
    const dbUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/airbnb";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUrl);
    console.log("✓ Connected to MongoDB");

    // Run seeders
    console.log("\nStarting to seed database...");
    await seedDatabase();

    console.log("\n✓ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✓ Database connection closed");
    process.exit(0);
  }
}

runSeed();
