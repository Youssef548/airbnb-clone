# Bugs Discovered Through Testing

This document tracks bugs found during comprehensive testing implementation.

## 🐛 Bug #1: Booking Conflict Detection - Adjacent Bookings

**Severity**: Medium
**Status**: Documented (not fixed yet)
**File**: `server/src/services/booking.service.ts:26`
**Discovered by**: Unit test `booking.service.test.ts`

### Description

The booking conflict detection logic incorrectly prevents adjacent bookings from being created. When a guest tries to book a property where the checkout date of one booking equals the checkin date of another booking, the system incorrectly rejects it as a conflict.

### Expected Behavior

Adjacent bookings should be allowed:

```
Booking 1: Dec 1-5 (checkout on Dec 5)
Booking 2: Dec 5-10 (checkin on Dec 5) ✅ SHOULD BE ALLOWED
Booking 3: Dec 10-15 (checkin on Dec 10) ✅ SHOULD BE ALLOWED
```

This is standard practice in the hospitality industry where checkout time is usually morning (11 AM) and checkin time is afternoon (3 PM).

### Actual Behavior

The system rejects adjacent bookings as conflicts:

```
Booking 1: Dec 1-5
Booking 2: Dec 5-10 ❌ REJECTED as conflict
```

### Root Cause

In `server/src/services/booking.service.ts` line 26:

```typescript
const existingBooking = await Booking.findOne({
  listingId: listingId,
  $or: [
    { startDate: { $lt: startDate }, endDate: { $gt: endDate } },
    { startDate: { $gte: startDate, $lt: endDate } },
    { endDate: { $gt: startDate, $lt: endDate } },
    { startDate: { $gte: startDate, $lte: endDate } }, // ⚠️ BUG IS HERE
  ],
});
```

The fourth condition uses `$lte` (less than or equal) which causes it to match when:

- An existing booking's `startDate` equals the new booking's `endDate`

This prevents adjacent bookings where checkout = checkin.

### Proposed Fix

Change line 26 from:

```typescript
{ startDate: { $gte: startDate, $lte: endDate } }
```

To:

```typescript
{ startDate: { $gte: startDate, $lt: endDate } }
```

This will allow adjacent bookings while still preventing actual overlaps.

### Test Coverage

Test case: `tests/unit/services/booking.service.test.ts` line 281

- Currently marked with `.fails()` to document the known bug
- Once fixed, remove `.fails()` wrapper and the test should pass

### Impact

- **User Experience**: Limits booking availability unnecessarily
- **Revenue**: Potential loss of valid bookings
- **Severity**: Medium (reduces availability but doesn't cause data corruption)

### Verification Steps

1. Fix the code as proposed above
2. Run `pnpm run test:unit -- tests/unit/services/booking.service.test.ts`
3. Remove `.fails()` wrapper from the test
4. Verify all 21 tests pass

---

## Future Bugs

Additional bugs discovered during testing will be documented below.
