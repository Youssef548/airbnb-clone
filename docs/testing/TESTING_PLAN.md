# Backend Testing Plan - Airbnb Clone

## Executive Summary

This document outlines the comprehensive testing strategy for the backend API. Based on detailed analysis, the current test coverage is approximately **25%**, with critical gaps in business logic validation, particularly around booking conflicts and date filtering.

## Current Test Coverage

### Existing Tests ✅

- **Auth Tests**: Registration validation, login error handling
- **Listing Tests**: CRUD operations, authorization
- **Booking Tests**: Create, filter, cancel operations
- **Favorite Tests**: Add, remove, get favorites

### Coverage Gaps ⚠️

- No unit tests for service layer business logic
- Missing critical booking conflict detection tests
- No date range availability filtering tests
- Incomplete authentication/authorization scenarios
- Limited edge case coverage

---

## Priority 1: CRITICAL Tests (Implement Immediately)

### 1.1 Booking Conflict Detection ⚠️ **HIGHEST PRIORITY**

**Risk**: Data corruption, double bookings, revenue loss

**Test File**: `server/tests/unit/services/booking.service.test.ts`

**Critical Scenarios:**

```typescript
// Scenario 1: New booking contains existing booking
Existing: Jan 5-10
New:      Jan 3-12 ❌ SHOULD REJECT

// Scenario 2: New booking starts during existing booking
Existing: Jan 5-10
New:      Jan 8-15 ❌ SHOULD REJECT

// Scenario 3: New booking ends during existing booking
Existing: Jan 5-10
New:      Jan 2-7  ❌ SHOULD REJECT

// Scenario 4: New booking contained in existing booking
Existing: Jan 5-10
New:      Jan 6-8  ❌ SHOULD REJECT

// Scenario 5: Adjacent bookings (edge case)
Existing: Jan 5-10
New:      Jan 10-15 ✅ SHOULD ALLOW (checkout = checkin)
```

**Implementation Location**: `server/src/services/booking.service.ts:20-28`

---

### 1.2 Date Range Filtering Tests ⚠️ **CRITICAL**

**Risk**: Users see unavailable listings, poor UX, booking conflicts

**Test File**: `server/tests/unit/services/listing.service.test.ts`

**Critical Logic**: `server/src/services/listing.service.ts:55-75`

**Test Scenarios:**

- Filter listings by date range (exclude booked properties)
- Handle empty bookings array
- Test adjacent booking edge cases
- Validate date range query combinations

---

### 1.3 Authentication & Authorization Tests ⚠️

**Risk**: Security vulnerabilities, unauthorized access

**Test Files:**

- Unit: `server/tests/unit/services/auth.service.test.ts`
- Integration: `server/tests/auth/auth.test.ts` (update)

**Missing Tests:**

- JWT token generation and validation
- Password hashing verification
- Default role assignment (guest vs host)
- Role-based access control (guests cannot create listings)
- GET `/api/auth/me` endpoint (currently not tested)

---

## Priority 2: Service Layer Unit Tests

### 2.1 Auth Service

**File**: `server/tests/unit/services/auth.service.test.ts`

Tests needed:

- `loginUserService`: Password verification, JWT generation, user sanitization
- `createUserService`: Password hashing, default role, duplicate prevention

### 2.2 Listing Service

**File**: `server/tests/unit/services/listing.service.test.ts`

Tests needed:

- `getListingsService`: Query filtering, date range logic, multiple filters
- `getListingByIdService`: Population, error handling
- `createListingService`: Validation, user association
- `deleteListingService`: Authorization checks

### 2.3 Booking Service

**File**: `server/tests/unit/services/booking.service.test.ts`

Tests needed:

- `createBookingService`: Conflict detection (see Priority 1.1)
- `getBookingsService`: Filtering logic
- `getMyBookingsService`: User filtering
- `cancelBookingService`: Dual authorization (guest or listing owner)

### 2.4 Favorite Service

**File**: `server/tests/unit/services/favorite.service.test.ts`

Tests needed:

- `addFavoriteService`: Duplicate prevention, validation
- `deleteFavoriteService`: Remove logic, error handling
- `getFavoriteListingsService`: Data retrieval

---

## Priority 3: Integration Test Completeness

### 3.1 Auth Endpoints (UPDATE)

**File**: `server/tests/auth/auth.test.ts`

**Add Tests:**

- POST `/api/auth/register` - Success case (currently only errors tested)
- POST `/api/auth/login` - Success case with token validation
- GET `/api/auth/me` - **MISSING ENTIRELY**

### 3.2 Listing Endpoints (UPDATE)

**File**: `server/tests/listing/listing.test.ts`

**Add Tests:**

- Query parameter filtering (category, guestCount, roomCount, etc.)
- Date range filtering for availability
- Guest role trying to create listing (403 expected)

### 3.3 Booking Endpoints (UPDATE)

**File**: `server/tests/booking/booking.test.ts`

**Add Tests:**

- Overlapping booking prevention (integration test)
- Date validation (startDate < endDate, no past dates)
- GET `/api/booking/my` endpoint test

---

## Test Infrastructure Setup

### Coverage Configuration ✅ DONE

- Added to `vitest.config.ts`
- Target: 80% lines, 80% functions, 75% branches
- Reporters: text, html, json, lcov

### Test Utilities (TO CREATE)

**File**: `server/tests/helpers/testUtils.ts`

```typescript
// Factory functions for test data
export const createTestUser = (role: 'guest' | 'host') => { ... }
export const createTestListing = (userId: string) => { ... }
export const createTestBooking = (listingId, userId, dates) => { ... }

// Authentication helpers
export const generateAuthToken = (userId: string) => { ... }
export const loginTestUser = (email, password) => { ... }

// Assertion helpers
export const expectDateConflict = (booking1, booking2) => { ... }
```

### Test Fixtures (TO CREATE)

**File**: `server/tests/fixtures/testData.ts`

```typescript
export const validUser = { username, email, password }
export const validListing = { title, description, ... }
export const validBooking = { startDate, endDate, ... }
export const invalidPayloads = { ... }
```

---

## Package.json Scripts Update

**Current**:

```json
"test": "tsx tests/globalSetup.ts && vitest; tsx tests/globalTeardown.ts"
```

**Proposed** (TO ADD):

```json
{
  "test": "vitest",
  "test:unit": "vitest tests/unit",
  "test:integration": "vitest tests/auth tests/listing tests/booking tests/favorite",
  "test:coverage": "vitest --coverage",
  "test:watch": "vitest --watch",
  "test:ui": "vitest --ui"
}
```

---

## Implementation Roadmap

### Week 1: Critical Path

- **Day 1-2**: Booking conflict detection tests (Priority 1.1)
- **Day 3**: Date range filtering tests (Priority 1.2)
- **Day 4-5**: Authentication tests (Priority 1.3)

### Week 2: Foundation

- **Day 1-2**: Listing service unit tests
- **Day 3**: Favorite service unit tests
- **Day 4**: Auth service unit tests
- **Day 5**: Test utilities and factories

### Week 3: Completeness

- **Day 1-2**: Update auth integration tests
- **Day 2-3**: Update listing integration tests
- **Day 4-5**: Update booking integration tests

### Week 4: Polish

- **Day 1-2**: Edge case tests
- **Day 3**: Coverage reporting setup
- **Day 4-5**: Documentation and CI/CD integration

---

## Coverage Goals

### Current Status

- Services: ~20%
- Controllers: ~40%
- Middleware: ~30%
- **Overall: ~25%**

### Target After Implementation

- Services: 90%+
- Controllers: 85%+
- Middleware: 95%+
- **Overall: 85%+**

### Must-Have 100% Coverage

1. Booking conflict logic
2. Date filtering logic
3. Authorization middleware
4. Password hashing/verification

---

## Key Files Reference

### Business Logic (High Priority for Testing)

- `server/src/services/booking.service.ts:20-28` - Booking conflict detection
- `server/src/services/listing.service.ts:55-75` - Date range filtering
- `server/src/services/auth.service.ts` - Password hashing, JWT generation
- `server/src/middleware/auth.middleware.ts` - JWT verification
- `server/src/middleware/authorizeRoles.ts` - Role-based access control

### Existing Test Files (To Update)

- `server/tests/auth/auth.test.ts`
- `server/tests/listing/listing.test.ts`
- `server/tests/booking/booking.test.ts`
- `server/tests/favorite/favorite.test.ts`

### Test Infrastructure

- `server/vitest.config.ts` - ✅ Updated with coverage config
- `server/tests/setup.ts` - Database connection
- `server/tests/globalSetup.ts` - Test DB seeding
- `server/tests/globalTeardown.ts` - Cleanup

---

## Next Steps

1. ✅ Create feature branch: `feature/add-comprehensive-testing`
2. ✅ Add coverage configuration to vitest.config.ts
3. ⏳ Install coverage provider: `@vitest/coverage-v8`
4. ⏳ Create test utilities (`tests/helpers/testUtils.ts`)
5. ⏳ Create test fixtures (`tests/fixtures/testData.ts`)
6. ⏳ Implement Priority 1 tests (booking conflicts)
7. ⏳ Implement Priority 2 tests (service layer)
8. ⏳ Update integration tests (Priority 3)
9. ⏳ Add coverage reporting scripts
10. ⏳ Commit, merge, and document

---

## Risk Assessment

### Without Comprehensive Testing:

- ❌ Booking conflicts (double bookings)
- ❌ Data corruption
- ❌ Security vulnerabilities (unauthorized access)
- ❌ Poor user experience (unavailable listings shown)
- ❌ Difficult to refactor/maintain code

### With Comprehensive Testing:

- ✅ Confidence in business logic
- ✅ Early bug detection
- ✅ Safe refactoring
- ✅ Better code quality
- ✅ Reduced production incidents
- ✅ Faster onboarding for new developers

---

_This testing plan ensures the Airbnb clone backend is robust, secure, and maintainable. Priority 1 tests address the most critical business logic that could lead to data corruption or security issues._
