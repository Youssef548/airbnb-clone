import { describe, it, expect, beforeEach, afterEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  loginUserService,
  createUserService,
} from "../../../src/services/auth.service";
import { createTestUser, cleanupAllTestData } from "../../helpers/testUtils";
import {
  validUser,
  validRegistrationPayload,
  invalidUserPayloads,
} from "../../fixtures/testData";

describe("Auth Service - Unit Tests", () => {
  beforeEach(async () => {
    await cleanupAllTestData();
  });

  afterEach(async () => {
    await cleanupAllTestData();
  });

  describe("createUserService", () => {
    describe("Success Cases", () => {
      it("should create a new user with valid data", async () => {
        const user = await createUserService(
          validRegistrationPayload.email,
          validRegistrationPayload.password,
          validRegistrationPayload.username
        );

        expect(user).toBeDefined();
        expect(user.email).toBe(validRegistrationPayload.email);
        expect(user.username).toBe(validRegistrationPayload.username);
        expect(user.id).toBeDefined();
        expect(user.role).toBe("guest"); // Default role
      });

      it("should hash the password", async () => {
        const plainPassword = "testPassword123";
        const user = await createUserService(
          "test@example.com",
          plainPassword,
          "testuser"
        );

        // Verify user was created
        expect(user).toBeDefined();

        // Fetch the user from DB to check password
        const { User } = await import("../../../src/models/User.model.js");
        const dbUser = await User.findById(user.id);

        // Password should be hashed (not plain text)
        expect(dbUser!.password).not.toBe(plainPassword);
        expect(dbUser!.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern

        // Verify the hash is valid
        const isValid = await bcrypt.compare(plainPassword, dbUser!.password);
        expect(isValid).toBe(true);
      });

      it("should set default role to guest when not specified", async () => {
        const user = await createUserService(
          "guest@example.com",
          "password123",
          "guestuser"
        );

        expect(user.role).toBe("guest");
      });

      it("should allow creating a host when role is specified", async () => {
        const user = await createUserService(
          "host@example.com",
          "password123",
          "hostuser",
          "host"
        );

        expect(user.role).toBe("host");
      });

      it("should not return password in sanitized user", async () => {
        const user = await createUserService(
          "test@example.com",
          "password123",
          "testuser"
        );

        expect(user).not.toHaveProperty("password");
      });

      it("should set image to null by default", async () => {
        const user = await createUserService(
          "test@example.com",
          "password123",
          "testuser"
        );

        expect(user.image).toBeNull();
      });
    });

    describe("Validation and Error Cases", () => {
      it("should throw error when email already exists", async () => {
        // Create first user
        await createUserService(
          "duplicate@example.com",
          "password123",
          "user1"
        );

        // Try to create second user with same email
        await expect(
          createUserService("duplicate@example.com", "password123", "user2")
        ).rejects.toThrow("The email already used");
      });

      it("should allow same username but different email", async () => {
        await createUserService("user1@example.com", "password123", "johndoe");

        const user2 = await createUserService(
          "user2@example.com",
          "password456",
          "johndoe"
        );

        expect(user2).toBeDefined();
        expect(user2.username).toBe("johndoe");
      });
    });
  });

  describe("loginUserService", () => {
    describe("Success Cases", () => {
      it("should successfully login with valid credentials", async () => {
        // Create a user
        const password = "password123";
        await createUserService("user@example.com", password, "testuser");

        // Login
        const result = await loginUserService("user@example.com", password);

        expect(result).toBeDefined();
        expect(result.token).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user.email).toBe("user@example.com");
      });

      it("should generate a valid JWT token", async () => {
        const password = "password123";
        const createdUser = await createUserService(
          "user@example.com",
          password,
          "testuser"
        );

        const result = await loginUserService("user@example.com", password);

        // Verify token structure
        expect(result.token).toMatch(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
        );

        // Decode and verify token
        const decoded = jwt.verify(
          result.token,
          process.env.JWT_SECRET!
        ) as any;

        expect(decoded.userId).toBe(createdUser.id);
        expect(decoded.exp).toBeDefined(); // Should have expiration
      });

      it("should set token expiration to 1 hour", async () => {
        const password = "password123";
        await createUserService("user@example.com", password, "testuser");

        const result = await loginUserService("user@example.com", password);

        const decoded = jwt.verify(
          result.token,
          process.env.JWT_SECRET!
        ) as any;

        const now = Math.floor(Date.now() / 1000);
        const expiresIn = decoded.exp - now;

        // Should expire in approximately 1 hour (3600 seconds)
        // Allow 10 second variance for test execution time
        expect(expiresIn).toBeGreaterThan(3590);
        expect(expiresIn).toBeLessThan(3610);
      });

      it("should return sanitized user without password", async () => {
        const password = "password123";
        await createUserService("user@example.com", password, "testuser");

        const result = await loginUserService("user@example.com", password);

        expect(result.user).not.toHaveProperty("password");
        expect(result.user.email).toBe("user@example.com");
        expect(result.user.username).toBe("testuser");
        expect(result.user.id).toBeDefined();
      });

      it("should include user role in response", async () => {
        const password = "password123";
        await createUserService(
          "host@example.com",
          password,
          "hostuser",
          "host"
        );

        const result = await loginUserService("host@example.com", password);

        expect(result.user.role).toBe("host");
      });

      it("should include favoriteListingsIds in token payload", async () => {
        const password = "password123";
        await createUserService("user@example.com", password, "testuser");

        const result = await loginUserService("user@example.com", password);

        const decoded = jwt.verify(
          result.token,
          process.env.JWT_SECRET!
        ) as any;

        expect(decoded).toHaveProperty("favoriteListingsIds");
        expect(Array.isArray(decoded.favoriteListingsIds)).toBe(true);
      });
    });

    describe("Validation and Error Cases", () => {
      it("should throw error when user does not exist", async () => {
        await expect(
          loginUserService("nonexistent@example.com", "password123")
        ).rejects.toThrow("Invalid credentials");
      });

      it("should throw error when password is incorrect", async () => {
        await createUserService(
          "user@example.com",
          "correctpassword",
          "testuser"
        );

        await expect(
          loginUserService("user@example.com", "wrongpassword")
        ).rejects.toThrow("Invalid credentials");
      });

      it("should not reveal whether email or password is wrong", async () => {
        await createUserService("user@example.com", "password123", "testuser");

        // Both should throw the same error message
        // Wrong email
        await expect(
          loginUserService("wrong@example.com", "password123")
        ).rejects.toThrow("Invalid credentials");

        // Wrong password
        await expect(
          loginUserService("user@example.com", "wrongpassword")
        ).rejects.toThrow("Invalid credentials");
      });

      it("should be case-sensitive for email", async () => {
        await createUserService("user@example.com", "password123", "testuser");

        await expect(
          loginUserService("USER@EXAMPLE.COM", "password123")
        ).rejects.toThrow("Invalid credentials");
      });
    });

    describe("Security", () => {
      it("should not accept empty password", async () => {
        await createUserService("user@example.com", "password123", "testuser");

        await expect(loginUserService("user@example.com", "")).rejects.toThrow(
          "Invalid credentials"
        );
      });

      it("should verify password using bcrypt compare", async () => {
        const password = "mySecurePassword123!";
        await createUserService("user@example.com", password, "testuser");

        // This should work - correct password
        const result = await loginUserService("user@example.com", password);
        expect(result).toBeDefined();

        // This should fail - slightly different password
        await expect(
          loginUserService("user@example.com", "mySecurePassword123")
        ).rejects.toThrow("Invalid credentials");
      });

      it("should hash different passwords to different hashes", async () => {
        await createUserService("user1@example.com", "password1", "user1");
        await createUserService("user2@example.com", "password2", "user2");

        const { User } = await import("../../../src/models/User.model.js");
        const user1 = await User.findOne({ email: "user1@example.com" });
        const user2 = await User.findOne({ email: "user2@example.com" });

        expect(user1!.password).not.toBe(user2!.password);
      });

      it("should hash same password to different hashes (salt)", async () => {
        const samePassword = "identicalPassword123";

        await createUserService("user1@example.com", samePassword, "user1");
        await createUserService("user2@example.com", samePassword, "user2");

        const { User } = await import("../../../src/models/User.model.js");
        const user1 = await User.findOne({ email: "user1@example.com" });
        const user2 = await User.findOne({ email: "user2@example.com" });

        // Due to bcrypt salt, same passwords should have different hashes
        expect(user1!.password).not.toBe(user2!.password);

        // But both should verify correctly
        const isUser1Valid = await bcrypt.compare(
          samePassword,
          user1!.password
        );
        const isUser2Valid = await bcrypt.compare(
          samePassword,
          user2!.password
        );

        expect(isUser1Valid).toBe(true);
        expect(isUser2Valid).toBe(true);
      });
    });
  });
});
