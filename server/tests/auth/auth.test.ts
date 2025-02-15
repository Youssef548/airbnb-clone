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

afterAll(async () => {
  await mongoose.connection.close(); // Close connection after tests
});

const user = {
  username: "testuser",
  email: "test@example.com",
  password: "StrongPass123#",
};

describe("POST /api/auth/register", () => {
  it("should return 400 for missing fields", async () => {
    const res = await supertest(app).post("/api/auth/register").send({
      email: "test@example.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("status", "error");
  });

  it("should not allow duplicate email registration", async () => {
    await supertest(app).post("/api/auth/register").send(user);
    const res = await supertest(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "The email already used");
  });
});

describe("POST /api/auth/login", () => {
  it("should return 400 for invalid email format", async () => {
    const res = await supertest(app).post("/api/auth/login").send({
      email: "invalidemail",
      password: user.password,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("status", "error");
  });

  it("should return 400 for incorrect password", async () => {
    await supertest(app).post("/api/auth/register").send(user);
    const res = await supertest(app).post("/api/auth/login").send({
      email: user.email,
      password: "WrongPass123#",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });

  it("should return 400 for non-existent user", async () => {
    const res = await supertest(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: user.password,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });
});
