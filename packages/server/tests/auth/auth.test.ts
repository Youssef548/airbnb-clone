import supertest from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";

const user = {
  username: "test2user",
  email: "test2@example.com",
  password: "Strong2Pass123#",
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
