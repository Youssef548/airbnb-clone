import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { User } from "../../src/models/User.model.js";
import { Listing } from "../../src/models/listing.model.js";
import { Booking } from "../../src/models/booking.model.js";

/**
 * Test Utilities and Factory Functions
 * Provides reusable helper functions for creating test data and authentication
 */

// ============================================
// User Factory Functions
// ============================================

export interface CreateTestUserOptions {
  username?: string;
  email?: string;
  password?: string;
  role?: "guest" | "host";
}

/**
 * Creates a test user in the database
 * @param role - User role (guest or host)
 * @param options - Optional overrides for user properties
 */
export const createTestUser = async (
  role: "guest" | "host" = "guest",
  options: CreateTestUserOptions = {}
) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);

  const hashedPassword = await bcrypt.hash(
    options.password || "password123",
    10
  );

  const user = await User.create({
    username: options.username || `testuser_${role}_${timestamp}_${randomId}`,
    email: options.email || `test_${role}_${timestamp}_${randomId}@example.com`,
    password: hashedPassword,
    role,
  });

  return user;
};

// ============================================
// Listing Factory Functions
// ============================================

export interface CreateTestListingOptions {
  title?: string;
  description?: string;
  imageSrc?: string;
  category?: string;
  roomCount?: number;
  bathRoomCount?: number;
  guestCount?: number;
  location?: {
    flag?: string;
    label?: string;
    latlng?: number[];
    region?: string;
    value?: string;
  };
  price?: number;
}

/**
 * Creates a test listing in the database
 * @param userId - ID of the user who owns the listing
 * @param options - Optional overrides for listing properties
 */
export const createTestListing = async (
  userId: string | Types.ObjectId,
  options: CreateTestListingOptions = {}
) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);

  const defaultLocation = {
    flag: "🇺🇸",
    label: "United States",
    latlng: [37.7749, -122.4194], // San Francisco coordinates
    region: "North America",
    value: "US",
  };

  const listing = await Listing.create({
    title: options.title || `Test Listing ${timestamp}`,
    description:
      options.description || `Test description for listing ${timestamp}`,
    imageSrc: options.imageSrc || `https://example.com/image_${randomId}.jpg`,
    category: options.category || "Beach",
    roomCount: options.roomCount ?? 2,
    bathRoomCount: options.bathRoomCount ?? 1,
    guestCount: options.guestCount ?? 4,
    location: options.location || defaultLocation,
    user: new Types.ObjectId(userId),
    price: options.price ?? 100,
  });

  return listing;
};

// ============================================
// Booking Factory Functions
// ============================================

export interface CreateTestBookingOptions {
  startDate?: Date;
  endDate?: Date;
  totalPrice?: number;
}

/**
 * Creates a test booking in the database
 * @param listingId - ID of the listing to book
 * @param userId - ID of the user making the booking (guest)
 * @param options - Optional overrides for booking properties
 */
export const createTestBooking = async (
  listingId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  options: CreateTestBookingOptions = {}
) => {
  const now = new Date();
  const defaultStartDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const defaultEndDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

  // Fetch the listing to get the authorId (listing owner)
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error(`Listing with ID ${listingId} not found`);
  }

  const booking = await Booking.create({
    guest: new Types.ObjectId(userId),
    listingId: new Types.ObjectId(listingId),
    authorId: listing.user, // The listing owner
    startDate: options.startDate || defaultStartDate,
    endDate: options.endDate || defaultEndDate,
    totalPrice: options.totalPrice ?? 300,
  });

  // Update the listing to include this booking (mirrors booking service behavior)
  await Listing.findByIdAndUpdate(listingId, {
    $push: { bookings: booking._id },
  });

  return booking;
};

/**
 * Creates a booking with specific date range
 * @param listingId - ID of the listing to book
 * @param userId - ID of the user making the booking
 * @param startDate - Booking start date
 * @param endDate - Booking end date
 * @param totalPrice - Total booking price
 */
export const createBookingWithDates = async (
  listingId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date,
  totalPrice: number = 300
) => {
  return createTestBooking(listingId, userId, {
    startDate,
    endDate,
    totalPrice,
  });
};

// ============================================
// Authentication Helpers
// ============================================

/**
 * Generates a JWT token for a user
 * @param userId - User ID to encode in the token
 */
export const generateAuthToken = (userId: string | Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET || "test-secret-key";
  return jwt.sign({ userId: userId.toString() }, secret, {
    expiresIn: "7d",
  });
};

/**
 * Creates a test user and returns both the user and auth token
 * @param role - User role (guest or host)
 */
export const createAuthenticatedUser = async (
  role: "guest" | "host" = "guest"
) => {
  const user = await createTestUser(role);
  const token = generateAuthToken(user._id);

  return {
    user,
    token,
    authHeader: `Bearer ${token}`,
  };
};

// ============================================
// Date Helper Functions
// ============================================

/**
 * Creates a date X days from now
 * @param daysFromNow - Number of days to add to current date
 */
export const createFutureDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

/**
 * Creates a date X days in the past
 * @param daysAgo - Number of days to subtract from current date
 */
export const createPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

/**
 * Checks if two date ranges overlap
 * @param start1 - Start date of first range
 * @param end1 - End date of first range
 * @param start2 - Start date of second range
 * @param end2 - End date of second range
 */
export const doDateRangesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

// ============================================
// Assertion Helpers
// ============================================

/**
 * Expects that two booking date ranges conflict
 * Used in booking conflict detection tests
 */
export const expectDateConflict = (
  booking1: { startDate: Date; endDate: Date },
  booking2: { startDate: Date; endDate: Date }
): boolean => {
  return doDateRangesOverlap(
    booking1.startDate,
    booking1.endDate,
    booking2.startDate,
    booking2.endDate
  );
};

// ============================================
// Cleanup Helpers
// ============================================

/**
 * Deletes all test users created during tests
 */
export const cleanupTestUsers = async () => {
  // Delete ALL users in test database
  await User.deleteMany({});
};

/**
 * Deletes all test listings created during tests
 */
export const cleanupTestListings = async () => {
  // Delete ALL listings in test database
  await Listing.deleteMany({});
};

/**
 * Deletes all test bookings created during tests
 */
export const cleanupTestBookings = async () => {
  await Booking.deleteMany({});
};

/**
 * Comprehensive cleanup of all test data
 * Order matters: bookings first (references listings), then listings (references users), then users
 */
export const cleanupAllTestData = async () => {
  // Delete in order of dependencies
  await cleanupTestBookings();
  await cleanupTestListings();
  await cleanupTestUsers();
};
