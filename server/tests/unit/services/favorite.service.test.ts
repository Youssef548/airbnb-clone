import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  addFavoriteService,
  deleteFavoriteService,
  getFavoriteListingsService,
} from "../../../src/services/favorite.service";
import {
  createTestUser,
  createTestListing,
  cleanupAllTestData,
} from "../../helpers/testUtils";

describe("Favorite Service - Unit Tests", () => {
  let guestUser: any;
  let hostUser: any;
  let listing1: any;
  let listing2: any;
  let listing3: any;

  beforeEach(async () => {
    await cleanupAllTestData();

    // Create test users
    guestUser = await createTestUser("guest");
    hostUser = await createTestUser("host");

    // Create test listings
    listing1 = await createTestListing(hostUser._id, {
      title: "Beach House",
      category: "Beach",
    });

    listing2 = await createTestListing(hostUser._id, {
      title: "Mountain Cabin",
      category: "Countryside",
    });

    listing3 = await createTestListing(hostUser._id, {
      title: "City Apartment",
      category: "Modern",
    });
  });

  afterEach(async () => {
    await cleanupAllTestData();
  });

  describe("addFavoriteService", () => {
    describe("Success Cases", () => {
      it("should add a listing to user favorites", async () => {
        const result = await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        expect(result).toBeDefined();
        expect(result.favoriteListingsIds).toBeDefined();
        expect(result.favoriteListingsIds.length).toBe(1);
        expect(result.favoriteListingsIds[0].toString()).toBe(
          listing1._id.toString()
        );
      });

      it("should add multiple listings to favorites", async () => {
        // Add first listing
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        // Add second listing
        const result = await addFavoriteService(
          guestUser._id.toString(),
          listing2._id.toString()
        );

        expect(result.favoriteListingsIds.length).toBe(2);
        const favoriteIds = result.favoriteListingsIds.map((id) =>
          id.toString()
        );
        expect(favoriteIds).toContain(listing1._id.toString());
        expect(favoriteIds).toContain(listing2._id.toString());
      });

      it("should maintain existing favorites when adding new one", async () => {
        // Add two listings
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );
        await addFavoriteService(
          guestUser._id.toString(),
          listing2._id.toString()
        );

        // Add third listing
        const result = await addFavoriteService(
          guestUser._id.toString(),
          listing3._id.toString()
        );

        expect(result.favoriteListingsIds.length).toBe(3);
      });

      it("should handle users with no existing favorites", async () => {
        // User has no favorites initially
        const result = await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        expect(result.favoriteListingsIds).toBeDefined();
        expect(result.favoriteListingsIds.length).toBe(1);
      });
    });

    describe("Validation and Error Cases", () => {
      it("should throw error when listing ID is empty", async () => {
        await expect(
          addFavoriteService(guestUser._id.toString(), "")
        ).rejects.toThrow("Invalid listing ID");
      });

      it("should throw error when listing does not exist", async () => {
        await expect(
          addFavoriteService(
            guestUser._id.toString(),
            "507f1f77bcf86cd799439011"
          )
        ).rejects.toThrow("Listing not found");
      });

      it("should throw error when user does not exist", async () => {
        await expect(
          addFavoriteService(
            "507f1f77bcf86cd799439011",
            listing1._id.toString()
          )
        ).rejects.toThrow("User not found");
      });

      it("should throw error when adding duplicate favorite", async () => {
        // Add listing to favorites
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        // Try to add same listing again
        await expect(
          addFavoriteService(guestUser._id.toString(), listing1._id.toString())
        ).rejects.toThrow("Listing is already in user's favorites");
      });
    });

    describe("Data Integrity", () => {
      it("should use Set to prevent duplicate IDs in array", async () => {
        const result = await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        // Verify no duplicates in the array
        const favoriteIds = result.favoriteListingsIds.map((id) =>
          id.toString()
        );
        const uniqueIds = new Set(favoriteIds);
        expect(favoriteIds.length).toBe(uniqueIds.size);
      });
    });
  });

  describe("deleteFavoriteService", () => {
    beforeEach(async () => {
      // Pre-populate favorites for delete tests
      await addFavoriteService(
        guestUser._id.toString(),
        listing1._id.toString()
      );
      await addFavoriteService(
        guestUser._id.toString(),
        listing2._id.toString()
      );
      await addFavoriteService(
        guestUser._id.toString(),
        listing3._id.toString()
      );
    });

    describe("Success Cases", () => {
      it("should remove a listing from user favorites", async () => {
        const result = await deleteFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        expect(result.favoriteListingsIds.length).toBe(2);
        const favoriteIds = result.favoriteListingsIds.map((id) =>
          id.toString()
        );
        expect(favoriteIds).not.toContain(listing1._id.toString());
        expect(favoriteIds).toContain(listing2._id.toString());
        expect(favoriteIds).toContain(listing3._id.toString());
      });

      it("should handle removing the last favorite", async () => {
        // Remove all but one
        await deleteFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );
        await deleteFavoriteService(
          guestUser._id.toString(),
          listing2._id.toString()
        );

        // Remove the last one
        const result = await deleteFavoriteService(
          guestUser._id.toString(),
          listing3._id.toString()
        );

        expect(result.favoriteListingsIds.length).toBe(0);
      });

      it("should maintain other favorites when removing one", async () => {
        const result = await deleteFavoriteService(
          guestUser._id.toString(),
          listing2._id.toString()
        );

        expect(result.favoriteListingsIds.length).toBe(2);
        const favoriteIds = result.favoriteListingsIds.map((id) =>
          id.toString()
        );
        expect(favoriteIds).toContain(listing1._id.toString());
        expect(favoriteIds).toContain(listing3._id.toString());
      });
    });

    describe("Validation and Error Cases", () => {
      it("should throw error when listing ID is empty", async () => {
        await expect(
          deleteFavoriteService(guestUser._id.toString(), "")
        ).rejects.toThrow("Invalid listing ID");
      });

      it("should throw error when listing does not exist", async () => {
        await expect(
          deleteFavoriteService(
            guestUser._id.toString(),
            "507f1f77bcf86cd799439011"
          )
        ).rejects.toThrow("Listing not found");
      });

      it("should throw error when user does not exist", async () => {
        await expect(
          deleteFavoriteService(
            "507f1f77bcf86cd799439011",
            listing1._id.toString()
          )
        ).rejects.toThrow("User not found");
      });

      it("should throw error when listing is not in favorites", async () => {
        // Create a new listing that's not in favorites
        const newListing = await createTestListing(hostUser._id, {
          title: "New Listing",
        });

        await expect(
          deleteFavoriteService(
            guestUser._id.toString(),
            newListing._id.toString()
          )
        ).rejects.toThrow("Listing is not in user's favorites");
      });

      it("should throw error when trying to remove from empty favorites", async () => {
        // Create a new user with no favorites
        const newUser = await createTestUser("guest");

        await expect(
          deleteFavoriteService(newUser._id.toString(), listing1._id.toString())
        ).rejects.toThrow("Listing is not in user's favorites");
      });
    });
  });

  describe("getFavoriteListingsService", () => {
    describe("Success Cases", () => {
      it("should retrieve all favorite listings for a user", async () => {
        // Add favorites
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );
        await addFavoriteService(
          guestUser._id.toString(),
          listing2._id.toString()
        );

        const favorites = await getFavoriteListingsService(
          guestUser._id.toString()
        );

        expect(favorites).toBeDefined();
        expect(favorites.length).toBe(2);

        const favoriteTitles = favorites.map((f) => f.title);
        expect(favoriteTitles).toContain("Beach House");
        expect(favoriteTitles).toContain("Mountain Cabin");
      });

      it("should return empty array when user has no favorites", async () => {
        const favorites = await getFavoriteListingsService(
          guestUser._id.toString()
        );

        expect(favorites).toBeDefined();
        expect(Array.isArray(favorites)).toBe(true);
        expect(favorites.length).toBe(0);
      });

      it("should return full listing details", async () => {
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        const favorites = await getFavoriteListingsService(
          guestUser._id.toString()
        );

        expect(favorites[0]).toBeDefined();
        expect(favorites[0].title).toBe("Beach House");
        expect(favorites[0].category).toBe("Beach");
        expect(favorites[0].price).toBeDefined();
        expect(favorites[0].location).toBeDefined();
      });

      it("should format createdAt as date string", async () => {
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        const favorites = await getFavoriteListingsService(
          guestUser._id.toString()
        );

        expect(favorites[0].createdAt).toBeDefined();
        expect(typeof favorites[0].createdAt).toBe("string");
      });

      it("should handle multiple favorites correctly", async () => {
        // Add all three listings
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );
        await addFavoriteService(
          guestUser._id.toString(),
          listing2._id.toString()
        );
        await addFavoriteService(
          guestUser._id.toString(),
          listing3._id.toString()
        );

        const favorites = await getFavoriteListingsService(
          guestUser._id.toString()
        );

        expect(favorites.length).toBe(3);
      });

      it("should only return listings that still exist", async () => {
        // Add favorites
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );
        await addFavoriteService(
          guestUser._id.toString(),
          listing2._id.toString()
        );

        // Delete one listing from database
        const { Listing } = await import(
          "../../../src/models/listing.model.js"
        );
        await Listing.findByIdAndDelete(listing2._id);

        const favorites = await getFavoriteListingsService(
          guestUser._id.toString()
        );

        // Should only return listing1 since listing2 was deleted
        expect(favorites.length).toBe(1);
        expect(favorites[0].title).toBe("Beach House");
      });
    });

    describe("Validation and Error Cases", () => {
      it("should throw error when user does not exist", async () => {
        await expect(
          getFavoriteListingsService("507f1f77bcf86cd799439011")
        ).rejects.toThrow("Something went wrong");
      });
    });

    describe("User Isolation", () => {
      it("should only return favorites for specific user", async () => {
        const secondUser = await createTestUser("guest");

        // First user adds listing1
        await addFavoriteService(
          guestUser._id.toString(),
          listing1._id.toString()
        );

        // Second user adds listing2
        await addFavoriteService(
          secondUser._id.toString(),
          listing2._id.toString()
        );

        // Get first user's favorites
        const user1Favorites = await getFavoriteListingsService(
          guestUser._id.toString()
        );

        // Get second user's favorites
        const user2Favorites = await getFavoriteListingsService(
          secondUser._id.toString()
        );

        // Each user should only see their own favorites
        expect(user1Favorites.length).toBe(1);
        expect(user1Favorites[0].title).toBe("Beach House");

        expect(user2Favorites.length).toBe(1);
        expect(user2Favorites[0].title).toBe("Mountain Cabin");
      });
    });
  });
});
