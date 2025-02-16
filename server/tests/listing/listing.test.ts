import { describe, it, beforeAll, beforeEach, afterAll, expect } from "vitest";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import connectDB from "../../src/config/database";
import { Listing } from "../../src/models/listing.model";
import { User } from "../../src/models/User.model";

beforeAll(async () => {
  await connectDB(process.env.TEST_DATABASE_URL);
});

beforeEach(async () => {
  await Listing.deleteMany();
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

const user = {
  username: "testuser",
  email: "test@example.com",
  password: "StrongPass123#",
};

const listingData = {
  title: "Test Listing",
  description: "A wonderful place",
  imageSrc: "image.jpg",
  category: "apartment",
  roomCount: 3,
  bathRoomCount: 2,
  guestCount: 4,
  location: "Cairo",
  price: 50,
};

describe("Listings API", () => {
  let token: string;
  let userId: string;
  let listingId: string;

  beforeEach(async () => {
    // Register user
    const userRes = await supertest(app).post("/api/auth/register").send(user);
    userId = userRes.body.currentUser._id;

    // Login user
    const loginRes = await supertest(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    token = loginRes.body.token;
  });

  it("should create a listing", async () => {
    const res = await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .send(listingData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe(listingData.title);
    listingId = res.body._id;
  });

  it("should get all listings", async () => {
    // Create a listing first
    await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .send(listingData);

    const res = await supertest(app).get("/api/listings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get a listing by id", async () => {
    // Create a listing first
    const createRes = await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .send(listingData);
    listingId = createRes.body._id;

    const res = await supertest(app).get(`/api/listings/${listingId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", listingId);
    expect(res.body.title).toBe(listingData.title);
  });

  it("should delete a listing", async () => {
    // Create a listing first
    const createRes = await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .send(listingData);
    listingId = createRes.body._id;

    // Delete the listing
    const res = await supertest(app)
      .delete(`/api/listings/${listingId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("should not delete a listing if user is unauthorized", async () => {
    // Create a listing with the primary user
    const createRes = await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .send(listingData);
    listingId = createRes.body._id;

    // Register and log in a second user
    const anotherUser = {
      username: "user2",
      email: "user2@example.com",
      password: "StrongPass123#",
    };
    await supertest(app).post("/api/auth/register").send(anotherUser);
    const loginRes = await supertest(app)
      .post("/api/auth/login")
      .send({ email: anotherUser.email, password: anotherUser.password });
    const anotherToken = loginRes.body.token;

    // Attempt to delete the listing with the second user's token
    const res = await supertest(app)
      .delete(`/api/listings/${listingId}`)
      .set("Authorization", `Bearer ${anotherToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized to delete this listing"
    );
  });
});
