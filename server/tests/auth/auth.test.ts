import { describe, it, beforeAll, beforeEach, afterAll, expect } from "vitest";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import connectDB from "../../src/config/database";
import { User } from "../../src/models/User.model"; // Adjust path if needed

beforeAll(async () => {
  await connectDB(process.env.TEST_DATABASE_URL); // Ensure connection to test DB
});

beforeEach(async () => {
  await User.deleteMany(); // Clear test users before each test
});
afterEach(async () => {
  await User.deleteMany(); // Clear test users before each test
});

afterAll(async () => {
  await mongoose.connection.close(); // Close connection after tests
});

describe("POST /api/auth/register", () => {
  it("should create a new user", async () => {
    const user = {
      username: "testuser",
      email: "test@example.com",
      password: "StrongPass123#",
    };

    const res = await supertest(app)
      .post("/api/auth/register")
      .send(user)
      .expect(201);

    expect(res.body).toHaveProperty("message", "User created");
  });
});
