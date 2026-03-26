import supertest from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";

const user = {
  username: "youssef",
  email: "testtest@example.com",
  password: "Strong3Pass123#",
};

const listing = {
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

describe("Favorites API", () => {
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
  });

  it("should create listing for use on test favorite", async () => {
    const listingRes = await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .send(listing);

    expect(listingRes.status).toBe(201);
    expect(listingRes.body).toHaveProperty("_id");
    expect(listingRes.body.title).toBe(listing.title);

    listingId = listingRes.body._id;
  });

  it("should add a favorite listing", async () => {
    const res = await supertest(app)
      .post(`/api/favorites/${listingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.data.favoriteListingsIds).toContain(listingId);
  });

  it("should not add duplicate favorite listing", async () => {
    // Add the listing once.
    await supertest(app).post(`/api/favorites/${listingId}`).send();
    // Attempt to add it again.
    const res = await supertest(app)
      .post(`/api/favorites/${listingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Listing is already in user's favorites");
  });

  it("should get favorite listings", async () => {
    const res = await supertest(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[res.body.length - 1]._id).toBe(listingId);
  });

  it("should delete a favorite listing", async () => {
    // Add the favorite.
    await supertest(app)
      .post(`/api/favorites/${listingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send();
    // Delete the favorite.
    const res = await supertest(app)
      .delete(`/api/favorites/${listingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.data.favoriteListingsIds).not.toContain(listingId);
  });

  it("should return error when deleting a non-favorite listing", async () => {
    // Ensure the listing is not in favorites.
    const res = await supertest(app)
      .delete(`/api/favorites/${listingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Listing is not in user's favorites");
  });
});
