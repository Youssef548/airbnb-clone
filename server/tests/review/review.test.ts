import mongoose from "mongoose";
import supertest from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";

const user = {
  username: "reviewer",
  email: "reviewer@example.com",
  password: "Strong3Pass123#",
};

const listing = {
  title: "Beachfront Villa",
  description: "A beautiful villa by the beach",
  imageSrc: "beach-villa.jpg",
  category: "villa",
  roomCount: 4,
  bathRoomCount: 3,
  guestCount: 6,
  price: 200,
  location: {
    flag: "US",
    label: "Miami",
    latlng: [25.7617, -80.1918],
    region: "Florida",
    value: "Miami",
  },
};

describe("Reviews API", () => {
  let token: string;
  let userId: string;
  let listingId: string;
  let reviewId: string;

  beforeEach(async () => {
    // Register a new user
    await supertest(app).post("/api/auth/register").send(user);

    // Login user
    const loginRes = await supertest(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    token = loginRes.body.token;
    userId = loginRes.body.currentUser.id;

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    // Create a listing with a different user
    const ownerUser = {
      username: "owner",
      email: "owner@example.com",
      password: "Strong3Pass123#",
    };

    await supertest(app).post("/api/auth/register").send(ownerUser);

    const ownerLoginRes = await supertest(app)
      .post("/api/auth/login")
      .send({ email: ownerUser.email, password: ownerUser.password });

    const ownerToken = ownerLoginRes.body.token;

    const listingRes = await supertest(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(listing);

    expect(listingRes.status).toBe(201);
    listingId = listingRes.body._id;
  });

  describe("POST /api/reviews", () => {
    it("should create a review successfully", async () => {
      const res = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "Amazing place! Highly recommended for families.",
          listingId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.rating).toBe(5);
      expect(res.body.comment).toBe("Amazing place! Highly recommended for families.");
      expect(res.body.listing.toString()).toBe(listingId);
      reviewId = res.body._id;
    });

    it("should not create review without authentication", async () => {
      const res = await supertest(app)
        .post("/api/reviews")
        .send({
          rating: 5,
          comment: "Great place to stay!",
          listingId,
        });

      expect(res.status).toBe(401);
    });

    it("should not create review with invalid rating (below 1)", async () => {
      const res = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 0,
          comment: "This is a test review.",
          listingId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not create review with invalid rating (above 5)", async () => {
      const res = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 6,
          comment: "This is a test review.",
          listingId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not create review with comment too short", async () => {
      const res = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 4,
          comment: "Short",
          listingId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not create duplicate review for same listing", async () => {
      // Create first review
      await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "First review for this listing.",
          listingId,
        });

      // Try to create second review
      const res = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 4,
          comment: "Trying to review again, which should fail.",
          listingId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "You have already reviewed this listing");
    });

    it("should not create review for non-existent listing", async () => {
      const fakeListingId = new mongoose.Types.ObjectId();
      const res = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "Review for non-existent listing.",
          listingId: fakeListingId.toString(),
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Listing not found");
    });

    it("should not allow owner to review their own listing", async () => {
      // Login as listing owner
      const ownerLoginRes = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "owner@example.com", password: "Strong3Pass123#" });

      const ownerToken = ownerLoginRes.body.token;

      const res = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          rating: 5,
          comment: "Trying to review my own listing.",
          listingId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "You cannot review your own listing");
    });
  });

  describe("GET /api/reviews/listing/:listingId", () => {
    it("should get all reviews for a listing", async () => {
      // Create a review first
      await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "Wonderful experience at this place!",
          listingId,
        });

      const res = await supertest(app)
        .get(`/api/reviews/listing/${listingId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("rating");
      expect(res.body[0]).toHaveProperty("comment");
      expect(res.body[0]).toHaveProperty("user");
    });

    it("should return empty array for listing with no reviews", async () => {
      // Create a new listing without reviews
      const ownerLoginRes = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "owner@example.com", password: "Strong3Pass123#" });

      const newListingRes = await supertest(app)
        .post("/api/listings")
        .set("Authorization", `Bearer ${ownerLoginRes.body.token}`)
        .send({
          ...listing,
          title: "New Listing Without Reviews",
        });

      const res = await supertest(app)
        .get(`/api/reviews/listing/${newListingRes.body._id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it("should return 404 for non-existent listing", async () => {
      const fakeListingId = new mongoose.Types.ObjectId();
      const res = await supertest(app)
        .get(`/api/reviews/listing/${fakeListingId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Listing not found");
    });
  });

  describe("GET /api/reviews/listing/:listingId/average", () => {
    it("should get average rating for a listing", async () => {
      // Create multiple reviews
      await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "Excellent place to stay!",
          listingId,
        });

      const res = await supertest(app)
        .get(`/api/reviews/listing/${listingId}/average`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("averageRating");
      expect(res.body).toHaveProperty("totalReviews");
      expect(res.body.averageRating).toBe(5);
      expect(res.body.totalReviews).toBe(1);
    });

    it("should return zero average for listing with no reviews", async () => {
      // Create a new listing without reviews
      const ownerLoginRes = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "owner@example.com", password: "Strong3Pass123#" });

      const newListingRes = await supertest(app)
        .post("/api/listings")
        .set("Authorization", `Bearer ${ownerLoginRes.body.token}`)
        .send({
          ...listing,
          title: "No Reviews Listing",
        });

      const res = await supertest(app)
        .get(`/api/reviews/listing/${newListingRes.body._id}/average`);

      expect(res.status).toBe(200);
      expect(res.body.averageRating).toBe(0);
      expect(res.body.totalReviews).toBe(0);
    });
  });

  describe("GET /api/reviews/:reviewId", () => {
    it("should get a single review by ID", async () => {
      // Create a review
      const createRes = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 4,
          comment: "Very nice place, would visit again!",
          listingId,
        });

      reviewId = createRes.body._id;

      const res = await supertest(app).get(`/api/reviews/${reviewId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", reviewId);
      expect(res.body).toHaveProperty("rating", 4);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("listing");
    });

    it("should return 404 for non-existent review", async () => {
      const fakeReviewId = new mongoose.Types.ObjectId();
      const res = await supertest(app).get(`/api/reviews/${fakeReviewId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Review not found");
    });
  });

  describe("PATCH /api/reviews/:reviewId", () => {
    it("should update a review successfully", async () => {
      // Create a review
      const createRes = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 4,
          comment: "Good place but could be better.",
          listingId,
        });

      reviewId = createRes.body._id;

      // Update the review
      const res = await supertest(app)
        .patch(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "Actually, this place is amazing! Updated my review.",
        });

      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(5);
      expect(res.body.comment).toBe("Actually, this place is amazing! Updated my review.");
    });

    it("should not update review without authentication", async () => {
      // Create a review
      const createRes = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 4,
          comment: "Nice place overall.",
          listingId,
        });

      reviewId = createRes.body._id;

      const res = await supertest(app)
        .patch(`/api/reviews/${reviewId}`)
        .send({
          rating: 5,
        });

      expect(res.status).toBe(401);
    });

    it("should not update another user's review", async () => {
      // Create a review
      const createRes = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 4,
          comment: "Decent place to stay.",
          listingId,
        });

      reviewId = createRes.body._id;

      // Login as different user
      await supertest(app).post("/api/auth/register").send({
        username: "otheruser",
        email: "other@example.com",
        password: "Password123!",
      });

      const otherLoginRes = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "other@example.com", password: "Password123!" });

      const otherToken = otherLoginRes.body.token;

      const res = await supertest(app)
        .patch(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({
          rating: 1,
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message", "You can only update your own reviews");
    });
  });

  describe("DELETE /api/reviews/:reviewId", () => {
    it("should delete a review successfully", async () => {
      // Create a review
      const createRes = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 3,
          comment: "Changed my mind, deleting this review.",
          listingId,
        });

      reviewId = createRes.body._id;

      // Delete the review
      const res = await supertest(app)
        .delete(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Review successfully deleted");

      // Verify review is deleted
      const getRes = await supertest(app).get(`/api/reviews/${reviewId}`);
      expect(getRes.status).toBe(404);
    });

    it("should not delete review without authentication", async () => {
      // Create a review
      const createRes = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 4,
          comment: "This review should not be deleted without auth.",
          listingId,
        });

      reviewId = createRes.body._id;

      const res = await supertest(app).delete(`/api/reviews/${reviewId}`);

      expect(res.status).toBe(401);
    });

    it("should not delete another user's review", async () => {
      // Create a review
      const createRes = await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "My review that others cannot delete.",
          listingId,
        });

      reviewId = createRes.body._id;

      // Login as different user
      await supertest(app).post("/api/auth/register").send({
        username: "hacker",
        email: "hacker@example.com",
        password: "Password123!",
      });

      const hackerLoginRes = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "hacker@example.com", password: "Password123!" });

      const hackerToken = hackerLoginRes.body.token;

      const res = await supertest(app)
        .delete(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${hackerToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message", "You can only delete your own reviews");
    });
  });

  describe("GET /api/reviews/user/my-reviews", () => {
    it("should get all reviews by authenticated user", async () => {
      // Create a review
      await supertest(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          rating: 5,
          comment: "Great place, loved every minute!",
          listingId,
        });

      const res = await supertest(app)
        .get("/api/reviews/user/my-reviews")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("listing");
    });

    it("should not get user reviews without authentication", async () => {
      const res = await supertest(app).get("/api/reviews/user/my-reviews");

      expect(res.status).toBe(401);
    });
  });
});
