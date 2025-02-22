import mongoose from "mongoose";
import supertest from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import connectDB from "../../src/config/database";

const user = {
  username: "youssef",
  email: "testtest@example.com",
  password: "Strong3Pass123#",
};

const listing = {
  title: "hello world",
  description: "this a just test",
  imageSrc:
    "https://res.cloudinary.com/dkyhsld8s/image/upload/v1739723844/IMG_0540_gnaqvk.jpg",
  price: 500,
  category: "stars",
  location: "Cairo",
  roomCount: 1,
  guestCount: 1,
  bathRoomCount: 1,
};
describe("Bookings API", () => {
  let token: string;
  let userId: string;
  let listingId: string;
  let bookingId: string;

  beforeEach(async () => {
    // Login user
    const loginRes = await supertest(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    token = loginRes.body.token;

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    userId = loginRes.body.currentUser.id;

    const listingRes = await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send(listing);

    expect(listingRes.status).toBe(201);
    expect(listingRes.body).toHaveProperty("_id");
    expect(listingRes.body.title).toBe(listing.title);

    listingId = listingRes.body._id;
  });

  it("should create a booking", async () => {
    const res = await supertest(app)
      .post("/api/booking")
      .set("Authorization", `Bearer ${token}`)
      .send({
        listingId,
        startDate: "2025-04-01",
        endDate: "2025-04-05",
        totalPrice: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("listingId", listingId);
    expect(res.body).toHaveProperty("authorId", userId);
    bookingId = res.body._id;
  });

  it("should get bookings with filters", async () => {
    const res = await supertest(app)
      .get(`/api/booking?listingId=${listingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should cancel a booking", async () => {
    // First, create a booking
    const bookingRes = await supertest(app)
      .post("/api/booking")
      .set("Authorization", `Bearer ${token}`)
      .send({
        listingId,
        startDate: "2025-03-10",
        endDate: "2025-03-15",
        totalPrice: 500,
      });

    bookingId = bookingRes.body._id;

    // Now, cancel the booking
    const res = await supertest(app)
      .delete(`/api/booking/${bookingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("should not cancel a booking that does not exist", async () => {
    const fakeBookingId = new mongoose.Types.ObjectId();
    const res = await supertest(app)
      .delete(`/api/booking/${fakeBookingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("status", "error");
    expect(res.body).toHaveProperty("message", "Booking not found");
  });

  it("should return 403 if user is unauthorized to cancel a booking", async () => {
    // Create a booking with the primary user
    const bookingRes = await supertest(app)
      .post("/api/booking")
      .set("Authorization", `Bearer ${token}`)
      .send({
        listingId,
        startDate: "2025-04-01",
        endDate: "2025-04-05",
        totalPrice: 500,
      });
    bookingId = bookingRes.body._id;

    // Register and login a second user
    await supertest(app).post("/api/auth/register").send({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    const loginRes = await supertest(app)
      .post("/api/auth/login")
      .send({ email: "user2@example.com", password: "Password123!" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    const anotherToken = loginRes.body.token;

    // Try to cancel the booking with the second user's token
    const res = await supertest(app)
      .delete(`/api/booking/${bookingId}`)
      .set("Authorization", `Bearer ${anotherToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "Unauthorized to cancel this booking"
    );
  });
});
