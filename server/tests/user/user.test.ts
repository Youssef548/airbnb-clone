import supertest from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";

const testUser = {
  username: "profiletester",
  email: "profiletest@example.com",
  password: "StrongPass123!",
};

describe("User Profile API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Register a new user
    await supertest(app).post("/api/auth/register").send(testUser);

    // Login user
    const loginRes = await supertest(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    token = loginRes.body.token;
    userId = loginRes.body.currentUser.id;

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  describe("GET /api/users/profile", () => {
    it("should get authenticated user's profile", async () => {
      const res = await supertest(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", userId);
      expect(res.body).toHaveProperty("username", testUser.username);
      expect(res.body).toHaveProperty("email", testUser.email);
      expect(res.body).not.toHaveProperty("password");
    });

    it("should not get profile without authentication", async () => {
      const res = await supertest(app).get("/api/users/profile");

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/users/profile", () => {
    it("should update username successfully", async () => {
      const res = await supertest(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          username: "newusername",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username", "newusername");
    });

    it("should update email successfully", async () => {
      const res = await supertest(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "newemail@example.com",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("email", "newemail@example.com");
      expect(res.body.emailVerified).toBeUndefined();
    });

    it("should update image successfully", async () => {
      const res = await supertest(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          image: "https://example.com/avatar.jpg",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("image", "https://example.com/avatar.jpg");
    });

    it("should not update with invalid email format", async () => {
      const res = await supertest(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "invalid-email",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not update with invalid image URL", async () => {
      const res = await supertest(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          image: "not-a-url",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not update username that's too short", async () => {
      const res = await supertest(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          username: "ab",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not update to email already in use", async () => {
      // Create another user
      await supertest(app).post("/api/auth/register").send({
        username: "otheruser",
        email: "other@example.com",
        password: "StrongPass123!",
      });

      // Try to update to existing email
      const res = await supertest(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "other@example.com",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Email already in use");
    });

    it("should not update profile without authentication", async () => {
      const res = await supertest(app).patch("/api/users/profile").send({
        username: "hacker",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/users/change-password", () => {
    it("should change password successfully", async () => {
      const res = await supertest(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "NewStrongPass123!",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Password changed successfully");

      // Verify can login with new password
      const loginRes = await supertest(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "NewStrongPass123!" });

      expect(loginRes.status).toBe(200);
    });

    it("should not change password with incorrect current password", async () => {
      const res = await supertest(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "WrongPassword123!",
          newPassword: "NewStrongPass123!",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Current password is incorrect");
    });

    it("should not change to same password", async () => {
      const res = await supertest(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: testUser.password,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "New password must be different from current password"
      );
    });

    it("should not change to weak password", async () => {
      const res = await supertest(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "weak",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not change password without authentication", async () => {
      const res = await supertest(app)
        .post("/api/users/change-password")
        .send({
          currentPassword: testUser.password,
          newPassword: "NewStrongPass123!",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/users/avatar", () => {
    it("should upload avatar successfully", async () => {
      const res = await supertest(app)
        .post("/api/users/avatar")
        .set("Authorization", `Bearer ${token}`)
        .send({
          imageUrl: "https://example.com/new-avatar.jpg",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("image", "https://example.com/new-avatar.jpg");
      expect(res.body).toHaveProperty("message", "Avatar uploaded successfully");
    });

    it("should not upload with invalid URL", async () => {
      const res = await supertest(app)
        .post("/api/users/avatar")
        .set("Authorization", `Bearer ${token}`)
        .send({
          imageUrl: "not-a-url",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });

    it("should not upload avatar without authentication", async () => {
      const res = await supertest(app)
        .post("/api/users/avatar")
        .send({
          imageUrl: "https://example.com/avatar.jpg",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/users/account", () => {
    it("should delete account successfully", async () => {
      const res = await supertest(app)
        .delete("/api/users/account")
        .set("Authorization", `Bearer ${token}`)
        .send({
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Account deleted successfully");

      // Verify can't login anymore
      const loginRes = await supertest(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(loginRes.status).toBe(400);
    });

    it("should not delete account with incorrect password", async () => {
      const res = await supertest(app)
        .delete("/api/users/account")
        .set("Authorization", `Bearer ${token}`)
        .send({
          password: "WrongPassword123!",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Password is incorrect");
    });

    it("should not delete account without authentication", async () => {
      const res = await supertest(app)
        .delete("/api/users/account")
        .send({
          password: testUser.password,
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/users/stats", () => {
    it("should get user statistics", async () => {
      const res = await supertest(app)
        .get("/api/users/stats")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalListings");
      expect(res.body).toHaveProperty("totalBookings");
      expect(res.body).toHaveProperty("totalReviews");
      expect(res.body).toHaveProperty("totalFavorites");
      expect(res.body).toHaveProperty("memberSince");
    });

    it("should not get stats without authentication", async () => {
      const res = await supertest(app).get("/api/users/stats");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/users/:userId", () => {
    it("should get public user profile", async () => {
      const res = await supertest(app).get(`/api/users/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", userId);
      expect(res.body).toHaveProperty("username");
      expect(res.body).toHaveProperty("image");
      expect(res.body).toHaveProperty("role");
      expect(res.body).toHaveProperty("createdAt");
      // Should not include private information
      expect(res.body).not.toHaveProperty("email");
      expect(res.body).not.toHaveProperty("password");
      expect(res.body).not.toHaveProperty("favoriteListingsIds");
    });

    it("should return 404 for non-existent user", async () => {
      const res = await supertest(app).get("/api/users/507f1f77bcf86cd799439011");

      expect(res.status).toBe(404);
    });
  });
});
