import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createListingService,
  getListingsService,
  getListingByIdService,
  deleteListingService,
} from "../../../src/services/listing.service";
import {
  createTestUser,
  createTestListing,
  createBookingWithDates,
  cleanupAllTestData,
} from "../../helpers/testUtils";
import {
  validListingPayload,
  dateFilterScenarios,
} from "../../fixtures/testData";

describe("Listing Service - Unit Tests", () => {
  let guestUser: any;
  let hostUser: any;

  beforeEach(async () => {
    await cleanupAllTestData();

    guestUser = await createTestUser("guest");
    hostUser = await createTestUser("host");
  });

  afterEach(async () => {
    await cleanupAllTestData();
  });

  describe("createListingService", () => {
    it("should successfully create a listing with valid data", async () => {
      const listing = await createListingService(
        hostUser._id.toString(),
        validListingPayload
      );

      expect(listing).toBeDefined();
      expect(listing.title).toBe(validListingPayload.title);
      expect(listing.description).toBe(validListingPayload.description);
      expect(listing.category).toBe(validListingPayload.category);
      expect(listing.price).toBe(validListingPayload.price);
      expect(listing.user.toString()).toBe(hostUser._id.toString());
    });

    it("should create listing with correct room and guest counts", async () => {
      const listing = await createListingService(
        hostUser._id.toString(),
        validListingPayload
      );

      expect(listing.roomCount).toBe(validListingPayload.roomCount);
      expect(listing.bathRoomCount).toBe(validListingPayload.bathRoomCount);
      expect(listing.guestCount).toBe(validListingPayload.guestCount);
    });

    it("should create listing with location data", async () => {
      const listing = await createListingService(
        hostUser._id.toString(),
        validListingPayload
      );

      expect(listing.location).toBeDefined();
      expect(listing.location.value).toBe(validListingPayload.location.value);
      expect(listing.location.label).toBe(validListingPayload.location.label);
    });
  });

  describe("getListingsService - Query Filtering", () => {
    beforeEach(async () => {
      // Create multiple listings with different properties
      await createTestListing(hostUser._id, {
        title: "Beach House",
        category: "Beach",
        guestCount: 6,
        roomCount: 3,
        bathRoomCount: 2,
        price: 250,
      });

      await createTestListing(hostUser._id, {
        title: "Mountain Cabin",
        category: "Countryside",
        guestCount: 4,
        roomCount: 2,
        bathRoomCount: 1,
        price: 150,
      });

      await createTestListing(hostUser._id, {
        title: "City Apartment",
        category: "Modern",
        guestCount: 2,
        roomCount: 1,
        bathRoomCount: 1,
        price: 100,
      });
    });

    it("should retrieve all listings when no filters applied", async () => {
      const listings = await getListingsService({});

      expect(listings.length).toBeGreaterThanOrEqual(3);
    });

    it("should filter listings by category", async () => {
      const listings = await getListingsService({ category: "Beach" });

      expect(listings.length).toBeGreaterThanOrEqual(1);
      listings.forEach((listing) => {
        expect(listing.category).toBe("Beach");
      });
    });

    it("should filter listings by minimum guest count", async () => {
      const listings = await getListingsService({ guestCount: 4 });

      expect(listings.length).toBeGreaterThanOrEqual(2);
      listings.forEach((listing) => {
        expect(listing.guestCount).toBeGreaterThanOrEqual(4);
      });
    });

    it("should filter listings by minimum room count", async () => {
      const listings = await getListingsService({ roomCount: 2 });

      expect(listings.length).toBeGreaterThanOrEqual(2);
      listings.forEach((listing) => {
        expect(listing.roomCount).toBeGreaterThanOrEqual(2);
      });
    });

    it("should filter listings by minimum bathroom count", async () => {
      const listings = await getListingsService({ bathRoomCount: 2 });

      expect(listings.length).toBeGreaterThanOrEqual(1);
      listings.forEach((listing) => {
        expect(listing.bathRoomCount).toBeGreaterThanOrEqual(2);
      });
    });

    it("should filter listings by user ID", async () => {
      const secondHost = await createTestUser("host");
      await createTestListing(secondHost._id, {
        title: "Second Host Listing",
      });

      const listings = await getListingsService({ userId: hostUser._id });

      expect(listings.length).toBeGreaterThanOrEqual(3);
      listings.forEach((listing) => {
        expect(listing.user.toString()).toBe(hostUser._id.toString());
      });
    });

    it("should combine multiple filters", async () => {
      const listings = await getListingsService({
        category: "Beach",
        guestCount: 6,
        roomCount: 3,
      });

      expect(listings.length).toBeGreaterThanOrEqual(1);
      const beachHouse = listings[0];
      expect(beachHouse.category).toBe("Beach");
      expect(beachHouse.guestCount).toBeGreaterThanOrEqual(6);
      expect(beachHouse.roomCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getListingsService - Date Range Filtering ⚠️ CRITICAL", () => {
    let availableListing: any;
    let bookedListing: any;
    let partiallyBookedListing: any;

    beforeEach(async () => {
      // Listing 1: No bookings (always available)
      availableListing = await createTestListing(hostUser._id, {
        title: "Always Available Listing",
      });

      // Listing 2: Fully booked during Dec 20-27
      bookedListing = await createTestListing(hostUser._id, {
        title: "Booked Listing",
      });
      await createBookingWithDates(
        bookedListing._id,
        guestUser._id,
        new Date("2025-12-20"),
        new Date("2025-12-27"),
        700
      );

      // Listing 3: Booked Dec 10-15, available Dec 20-27
      partiallyBookedListing = await createTestListing(hostUser._id, {
        title: "Partially Booked Listing",
      });
      await createBookingWithDates(
        partiallyBookedListing._id,
        guestUser._id,
        new Date("2025-12-10"),
        new Date("2025-12-15"),
        500
      );
    });

    it("should return all listings when no date range specified", async () => {
      const listings = await getListingsService({});

      expect(listings.length).toBeGreaterThanOrEqual(3);
    });

    it("should exclude listings with conflicting bookings", async () => {
      // Query for Dec 20-27 (bookedListing has a booking during this time)
      const listings = await getListingsService({
        startDate: "2025-12-20",
        endDate: "2025-12-27",
      });

      const titles = listings.map((l) => l.title);

      // Should include available listing
      expect(titles).toContain("Always Available Listing");

      // Should include partially booked (available during Dec 20-27)
      expect(titles).toContain("Partially Booked Listing");

      // Should NOT include fully booked listing
      expect(titles).not.toContain("Booked Listing");
    });

    it("should include listing if booking ends before query start", async () => {
      // partiallyBookedListing has booking Dec 10-15
      // Query for Dec 20-27 (after the booking ends)
      const listings = await getListingsService({
        startDate: "2025-12-20",
        endDate: "2025-12-27",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).toContain("Partially Booked Listing");
    });

    it("should include listing if booking starts after query end", async () => {
      // Create listing with future booking
      const futureListing = await createTestListing(hostUser._id, {
        title: "Future Booking Listing",
      });
      await createBookingWithDates(
        futureListing._id,
        guestUser._id,
        new Date("2026-01-15"),
        new Date("2026-01-22"),
        700
      );

      // Query for Dec 20-27 (before the future booking)
      const listings = await getListingsService({
        startDate: "2025-12-20",
        endDate: "2025-12-27",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).toContain("Future Booking Listing");
    });

    it("should exclude listing if query overlaps booking start", async () => {
      // bookedListing has booking Dec 20-27
      // Query for Dec 18-23 (overlaps with booking start)
      const listings = await getListingsService({
        startDate: "2025-12-18",
        endDate: "2025-12-23",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).not.toContain("Booked Listing");
    });

    it("should exclude listing if query overlaps booking end", async () => {
      // bookedListing has booking Dec 20-27
      // Query for Dec 25-30 (overlaps with booking end)
      const listings = await getListingsService({
        startDate: "2025-12-25",
        endDate: "2025-12-30",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).not.toContain("Booked Listing");
    });

    it("should exclude listing if query is within booking", async () => {
      // bookedListing has booking Dec 20-27
      // Query for Dec 22-25 (completely within booking)
      const listings = await getListingsService({
        startDate: "2025-12-22",
        endDate: "2025-12-25",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).not.toContain("Booked Listing");
    });

    it("should exclude listing if query contains entire booking", async () => {
      // bookedListing has booking Dec 20-27
      // Query for Dec 15-31 (contains entire booking)
      const listings = await getListingsService({
        startDate: "2025-12-15",
        endDate: "2025-12-31",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).not.toContain("Booked Listing");
    });

    it("should handle listings with multiple bookings", async () => {
      const multiBookedListing = await createTestListing(hostUser._id, {
        title: "Multi Booked Listing",
      });

      // Add multiple bookings
      await createBookingWithDates(
        multiBookedListing._id,
        guestUser._id,
        new Date("2025-12-01"),
        new Date("2025-12-05"),
        400
      );

      await createBookingWithDates(
        multiBookedListing._id,
        guestUser._id,
        new Date("2025-12-20"),
        new Date("2025-12-27"),
        700
      );

      // Query for Dec 10-15 (in the gap between bookings)
      const listings = await getListingsService({
        startDate: "2025-12-10",
        endDate: "2025-12-15",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).toContain("Multi Booked Listing");

      // Query for Dec 22-25 (overlaps second booking)
      const conflictListings = await getListingsService({
        startDate: "2025-12-22",
        endDate: "2025-12-25",
      });

      const conflictTitles = conflictListings.map((l) => l.title);
      expect(conflictTitles).not.toContain("Multi Booked Listing");
    });

    it("should handle empty bookings array", async () => {
      // availableListing has no bookings
      const listings = await getListingsService({
        startDate: "2025-12-20",
        endDate: "2025-12-27",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).toContain("Always Available Listing");
    });

    it("should combine date filters with other query parameters", async () => {
      const beachListing = await createTestListing(hostUser._id, {
        title: "Beach Listing Available",
        category: "Beach",
        guestCount: 4,
      });

      const mountainListing = await createTestListing(hostUser._id, {
        title: "Mountain Listing Booked",
        category: "Countryside",
        guestCount: 4,
      });

      await createBookingWithDates(
        mountainListing._id,
        guestUser._id,
        new Date("2025-12-20"),
        new Date("2025-12-27"),
        700
      );

      // Query with category, guest count, AND date range
      const listings = await getListingsService({
        category: "Beach",
        guestCount: 4,
        startDate: "2025-12-20",
        endDate: "2025-12-27",
      });

      const titles = listings.map((l) => l.title);
      expect(titles).toContain("Beach Listing Available");

      // Mountain listing would match category/guest filters but is booked
      expect(titles).not.toContain("Mountain Listing Booked");
    });
  });

  describe("getListingByIdService", () => {
    it("should retrieve listing by ID with populated user", async () => {
      const listing = await createTestListing(hostUser._id, {
        title: "Test Listing for ID Lookup",
      });

      const result = await getListingByIdService(listing._id.toString());

      expect(result).toBeDefined();
      expect(result.title).toBe("Test Listing for ID Lookup");
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(hostUser.email);
      expect(result.user.password).toBeNull(); // Password should be removed
    });

    it("should throw error when listing ID is missing", async () => {
      await expect(getListingByIdService("")).rejects.toThrow(
        "Missing listing id"
      );
    });

    it("should throw error when listing not found", async () => {
      await expect(
        getListingByIdService("507f1f77bcf86cd799439011")
      ).rejects.toThrow("Listing not found");
    });

    it("should format dates as ISO strings", async () => {
      const listing = await createTestListing(hostUser._id);

      const result = await getListingByIdService(listing._id.toString());

      expect(result.createdAt).toBeDefined();
      expect(typeof result.createdAt).toBe("string");
      expect(result.user.createdAt).toBeDefined();
      expect(typeof result.user.createdAt).toBe("string");
    });
  });

  describe("deleteListingService", () => {
    it("should allow listing owner to delete their listing", async () => {
      const listing = await createTestListing(hostUser._id, {
        title: "Listing to Delete",
      });

      await deleteListingService(
        hostUser._id.toString(),
        listing._id.toString()
      );

      // Verify listing was deleted
      await expect(
        getListingByIdService(listing._id.toString())
      ).rejects.toThrow("Listing not found");
    });

    it("should throw error when listing ID is missing", async () => {
      await expect(
        deleteListingService(hostUser._id.toString(), "")
      ).rejects.toThrow("Missing listing id");
    });

    it("should throw error when listing not found", async () => {
      await expect(
        deleteListingService(
          hostUser._id.toString(),
          "507f1f77bcf86cd799439011"
        )
      ).rejects.toThrow("Listing not found");
    });

    it("should throw error when non-owner tries to delete", async () => {
      const listing = await createTestListing(hostUser._id);
      const otherHost = await createTestUser("host");

      await expect(
        deleteListingService(otherHost._id.toString(), listing._id.toString())
      ).rejects.toThrow("You are not authorized to delete this listing");
    });

    it("should throw error when guest tries to delete", async () => {
      const listing = await createTestListing(hostUser._id);

      await expect(
        deleteListingService(guestUser._id.toString(), listing._id.toString())
      ).rejects.toThrow("You are not authorized to delete this listing");
    });
  });
});
