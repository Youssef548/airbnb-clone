/**
 * Test Fixtures and Sample Data
 * Provides consistent test data for use across all test files
 */

// ============================================
// Valid User Payloads
// ============================================

export const validUser = {
  guest: {
    username: "testguest",
    email: "guest@test.com",
    password: "password123",
  },
  host: {
    username: "testhost",
    email: "host@test.com",
    password: "password123",
  },
};

export const validRegistrationPayload = {
  username: "newuser",
  email: "newuser@test.com",
  password: "securepassword123",
};

export const validLoginPayload = {
  email: "test@example.com",
  password: "password123",
};

// ============================================
// Valid Listing Payloads
// ============================================

export const validListingPayload = {
  title: "Beautiful Beach House",
  description: "A stunning beach house with ocean views and modern amenities.",
  imageSrc: "https://example.com/beach-house.jpg",
  category: "Beach",
  roomCount: 3,
  bathRoomCount: 2,
  guestCount: 6,
  location: {
    flag: "🇺🇸",
    label: "United States",
    latlng: [37.7749, -122.4194],
    region: "North America",
    value: "US",
  },
  price: 250,
};

export const validListingPayloadMinimal = {
  title: "Cozy Apartment",
  description: "Small but comfortable apartment in the city center",
  imageSrc: "https://example.com/apartment.jpg",
  category: "Modern",
  roomCount: 1,
  bathroomCount: 1,
  guestCount: 2,
  locationValue: "US",
  price: 75,
};

export const validListingCategories = [
  "Beach",
  "Windmills",
  "Modern",
  "Countryside",
  "Pools",
  "Islands",
  "Lake",
  "Skiing",
  "Castles",
  "Caves",
  "Camping",
  "Arctic",
  "Desert",
  "Barns",
  "Lux",
];

// ============================================
// Valid Booking Payloads
// ============================================

export const createValidBookingPayload = (
  listingId: string,
  startDate: Date = new Date("2025-12-01"),
  endDate: Date = new Date("2025-12-07")
) => ({
  listingId,
  startDate,
  endDate,
  totalPrice: 600,
});

export const validBookingDates = {
  future: {
    startDate: new Date("2025-12-01"),
    endDate: new Date("2025-12-07"),
  },
  farFuture: {
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-01-22"),
  },
};

// ============================================
// Booking Conflict Test Scenarios
// ============================================

/**
 * Pre-defined booking conflict scenarios for testing
 * Each scenario includes existing and new booking dates to test overlap detection
 */
export const bookingConflictScenarios = {
  // Scenario 1: New booking completely contains existing booking
  newContainsExisting: {
    existing: {
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-10"),
    },
    new: {
      startDate: new Date("2025-12-03"),
      endDate: new Date("2025-12-12"),
    },
    shouldConflict: true,
    description: "New booking contains existing booking",
  },

  // Scenario 2: New booking starts during existing booking
  newStartsDuringExisting: {
    existing: {
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-10"),
    },
    new: {
      startDate: new Date("2025-12-08"),
      endDate: new Date("2025-12-15"),
    },
    shouldConflict: true,
    description: "New booking starts during existing booking",
  },

  // Scenario 3: New booking ends during existing booking
  newEndsDuringExisting: {
    existing: {
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-10"),
    },
    new: {
      startDate: new Date("2025-12-02"),
      endDate: new Date("2025-12-07"),
    },
    shouldConflict: true,
    description: "New booking ends during existing booking",
  },

  // Scenario 4: New booking is contained within existing booking
  newWithinExisting: {
    existing: {
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-10"),
    },
    new: {
      startDate: new Date("2025-12-06"),
      endDate: new Date("2025-12-08"),
    },
    shouldConflict: true,
    description: "New booking is contained within existing booking",
  },

  // Scenario 5: Adjacent bookings (checkout = checkin) - SHOULD ALLOW
  adjacentBookings: {
    existing: {
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-10"),
    },
    new: {
      startDate: new Date("2025-12-10"),
      endDate: new Date("2025-12-15"),
    },
    shouldConflict: false,
    description: "Adjacent bookings (checkout equals checkin)",
  },

  // Scenario 6: New booking before existing (no overlap)
  beforeExisting: {
    existing: {
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-10"),
    },
    new: {
      startDate: new Date("2025-12-01"),
      endDate: new Date("2025-12-04"),
    },
    shouldConflict: false,
    description: "New booking completely before existing",
  },

  // Scenario 7: New booking after existing (no overlap)
  afterExisting: {
    existing: {
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-10"),
    },
    new: {
      startDate: new Date("2025-12-11"),
      endDate: new Date("2025-12-15"),
    },
    shouldConflict: false,
    description: "New booking completely after existing",
  },
};

// ============================================
// Date Range Filter Test Data
// ============================================

export const dateFilterScenarios = {
  // Query for listings available during specific dates
  decemberHolidays: {
    startDate: new Date("2025-12-20"),
    endDate: new Date("2025-12-27"),
  },
  newYearWeek: {
    startDate: new Date("2025-12-31"),
    endDate: new Date("2026-01-07"),
  },
  summerVacation: {
    startDate: new Date("2026-06-15"),
    endDate: new Date("2026-06-30"),
  },
};

// ============================================
// Invalid Payloads (For Validation Testing)
// ============================================

export const invalidUserPayloads = {
  missingEmail: {
    username: "testuser",
    password: "password123",
  },
  missingPassword: {
    username: "testuser",
    email: "test@example.com",
  },
  missingUsername: {
    email: "test@example.com",
    password: "password123",
  },
  invalidEmail: {
    username: "testuser",
    email: "not-an-email",
    password: "password123",
  },
  shortPassword: {
    username: "testuser",
    email: "test@example.com",
    password: "123",
  },
};

export const invalidListingPayloads = {
  missingTitle: {
    description: "A nice place",
    imageSrc: "https://example.com/image.jpg",
    category: "Beach",
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 4,
    locationValue: "US",
    price: 100,
  },
  missingCategory: {
    title: "Beach House",
    description: "A nice place",
    imageSrc: "https://example.com/image.jpg",
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 4,
    locationValue: "US",
    price: 100,
  },
  negativePrice: {
    title: "Beach House",
    description: "A nice place",
    imageSrc: "https://example.com/image.jpg",
    category: "Beach",
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 4,
    locationValue: "US",
    price: -50,
  },
  zeroGuestCount: {
    title: "Beach House",
    description: "A nice place",
    imageSrc: "https://example.com/image.jpg",
    category: "Beach",
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 0,
    locationValue: "US",
    price: 100,
  },
};

export const invalidBookingPayloads = {
  missingListingId: {
    startDate: new Date("2025-12-01"),
    endDate: new Date("2025-12-07"),
    totalPrice: 600,
  },
  missingDates: {
    listingId: "507f1f77bcf86cd799439011",
    totalPrice: 600,
  },
  endBeforeStart: {
    listingId: "507f1f77bcf86cd799439011",
    startDate: new Date("2025-12-10"),
    endDate: new Date("2025-12-05"),
    totalPrice: 600,
  },
  pastDates: {
    listingId: "507f1f77bcf86cd799439011",
    startDate: new Date("2020-01-01"),
    endDate: new Date("2020-01-07"),
    totalPrice: 600,
  },
};

// ============================================
// Query Parameter Test Data
// ============================================

export const listingQueryParams = {
  byCategory: {
    category: "Beach",
  },
  byGuestCount: {
    guestCount: "4",
  },
  byRoomCount: {
    roomCount: "2",
  },
  byBathroomCount: {
    bathroomCount: "2",
  },
  byLocation: {
    locationValue: "US",
  },
  combined: {
    category: "Beach",
    guestCount: "4",
    locationValue: "US",
  },
  withDateRange: {
    startDate: "2025-12-01",
    endDate: "2025-12-07",
  },
};

// ============================================
// HTTP Response Status Codes
// ============================================

export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
