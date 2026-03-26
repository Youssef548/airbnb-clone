import supertest from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";

const user = {
  username: "youssef",
  email: "testtest@example.com",
  password: "Strong3Pass123#",
};

const listingData = {
  title: "Test Listing",
  description: "A wonderful place",
  imageSrc: "image.jpg",
  category: "apartment",
  roomCount: 3,
  bathRoomCount: 2,
  guestCount: 4,
  price: 50,
  location: {
    flag: "EG",
    label: "Cairo",
    latlng: [30.0444, 31.2357],
    region: "Egypt",
    value: "Cairo",
  },
};

describe("Listings API", () => {
  let token: string;
  let listingId: string;

  beforeEach(async () => {
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

  it("should get all listings with pagination", async () => {
    // Create a listing first
    await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .send(listingData);

    const res = await supertest(app).get("/api/listings");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("listings");
    expect(res.body).toHaveProperty("pagination");
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(res.body.listings.length).toBeGreaterThan(0);
    expect(res.body.pagination).toHaveProperty("currentPage");
    expect(res.body.pagination).toHaveProperty("totalPages");
    expect(res.body.pagination).toHaveProperty("totalCount");
    expect(res.body.pagination).toHaveProperty("limit");
    expect(res.body.pagination).toHaveProperty("hasNextPage");
    expect(res.body.pagination).toHaveProperty("hasPreviousPage");
  });

  it("should support pagination query parameters", async () => {
    const res = await supertest(app).get("/api/listings?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("listings");
    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination.currentPage).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.listings.length).toBeLessThanOrEqual(5);
  });

  it("should support pagination with category filter", async () => {
    const res = await supertest(app).get("/api/listings?category=apartment&page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("listings");
    expect(res.body).toHaveProperty("pagination");

    // All returned listings should have the 'apartment' category
    res.body.listings.forEach((listing: any) => {
      expect(listing.category).toBe("apartment");
    });

    // Pagination metadata should reflect filtered count, not total count
    expect(res.body.pagination.currentPage).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.listings.length).toBeLessThanOrEqual(5);
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
      email: "user3@example.com",
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
