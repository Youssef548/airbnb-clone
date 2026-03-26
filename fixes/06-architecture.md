# Architecture Fixes

## 1. Fix Booking Model Type Errors

**File:** `server/src/models/booking.model.ts`

**Problem:** `listingId` typed as `IListing` instead of `ObjectId`. Both `listing` and `listingId` exist creating confusion.

**Fix:**

```typescript
import mongoose, { Document } from "mongoose";

export interface IBooking extends Document {
  startDate: Date;
  endDate: Date;
  guest: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  totalPrice: number; // lowercase 'number', not 'Number'
}

const BookingSchema = new mongoose.Schema<IBooking>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);
```

---

## 2. Add ObjectId Validation Middleware

**Problem:** Route params like `:listingId` and `:bookingId` are never validated as MongoDB ObjectId format.

**Create:** `server/src/middleware/validateObjectId.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { errorHandler } from "../utils/error";

export const validateObjectId = (...paramNames: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const param of paramNames) {
      const value = req.params[param];
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return next(errorHandler(400, `Invalid ${param} format`));
      }
    }
    next();
  };
};
```

**Usage in routes:**

```typescript
// server/src/routes/listing.route.ts
import { validateObjectId } from "../middleware/validateObjectId";

router.get("/:listingId", validateObjectId("listingId"), getListingById);
router.delete(
  "/:listingId",
  isAuth,
  authorizeRoles("host"),
  validateObjectId("listingId"),
  deleteListing
);

// server/src/routes/booking.route.ts
router.delete(
  "/:bookingId",
  isAuth,
  validateObjectId("bookingId"),
  cancelBooking
);
```

---

## 3. Centralize Configuration Constants

**Create:** `server/src/config/constants.ts`

```typescript
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const AUTH = {
  JWT_EXPIRY: "1h",
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 8,
} as const;

export const ROLES = {
  GUEST: "guest",
  HOST: "host",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
```

**Usage:**

```typescript
// In services
import { PAGINATION, AUTH } from "../config/constants";

const page = Number(queryParams.page) || PAGINATION.DEFAULT_PAGE;
const limit = Math.min(
  Number(queryParams.limit) || PAGINATION.DEFAULT_LIMIT,
  PAGINATION.MAX_LIMIT
);
```

---

## 4. Handle Cascading Deletes

**Problem:** Deleting a listing leaves orphaned bookings. Deleting a user leaves orphaned listings and bookings.

**Option A - Mongoose middleware (pre/post hooks):**

```typescript
// server/src/models/Listing.model.ts
import Booking from "./booking.model";
import User from "./User.model";

ListingSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const listingId = this._id;

    // Remove all bookings for this listing
    await Booking.deleteMany({ listingId });

    // Remove listing from owner's listings array
    await User.updateMany(
      { listings: listingId },
      { $pull: { listings: listingId } }
    );

    // Remove from all users' favorites
    await User.updateMany(
      { favoriteListingsIds: listingId },
      { $pull: { favoriteListingsIds: listingId } }
    );
  }
);
```

**Option B - Service-level cleanup (more explicit):**

```typescript
// server/src/services/listing.service.ts
export const deleteListingService = async (
  listingId: string,
  userId: string
) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw errorHandler(404, "Listing not found");
  if (listing.user.toString() !== userId) {
    throw errorHandler(403, "Not authorized");
  }

  // Cleanup related data
  await Promise.all([
    Booking.deleteMany({ listingId }),
    User.updateMany(
      { favoriteListingsIds: listingId },
      { $pull: { favoriteListingsIds: listingId } }
    ),
    User.updateOne(
      { _id: userId },
      { $pull: { listings: listingId } }
    ),
    listing.deleteOne(),
  ]);

  return { message: "Listing deleted" };
};
```

---

## 5. Consolidate Favorite Service Logic

**File:** `server/src/services/favorite.service.ts`

**Problem:** `addFavoriteService` and `deleteFavoriteService` duplicate validation and user lookup.

**Fix:**

```typescript
import User from "../models/User.model";
import Listing from "../models/Listing.model";
import { errorHandler } from "../utils/error";

// Shared validation
const validateFavoriteRequest = async (listingId: string, userId: string) => {
  const [listing, user] = await Promise.all([
    Listing.findById(listingId).lean(),
    User.findById(userId),
  ]);

  if (!listing) throw errorHandler(404, "Listing not found");
  if (!user) throw errorHandler(404, "User not found");

  return { listing, user };
};

export const addFavoriteService = async (
  listingId: string,
  userId: string
) => {
  const { user } = await validateFavoriteRequest(listingId, userId);

  const favorites = new Set(
    (user.favoriteListingsIds || []).map((id) => id.toString())
  );

  if (favorites.has(listingId)) {
    throw errorHandler(400, "Already in favorites");
  }

  user.favoriteListingsIds.push(listingId as any);
  await user.save();

  return user.favoriteListingsIds;
};

export const deleteFavoriteService = async (
  listingId: string,
  userId: string
) => {
  const { user } = await validateFavoriteRequest(listingId, userId);

  user.favoriteListingsIds = user.favoriteListingsIds.filter(
    (id) => id.toString() !== listingId
  );
  await user.save();

  return user.favoriteListingsIds;
};
```

---

## 6. Consolidate Booking Mapping Logic

**File:** `server/src/services/booking.service.ts`

**Problem:** `getBookingsService` and `getMyBookingsService` have identical mapping logic.

**Fix:**

```typescript
// Shared mapper
const mapBookingToResponse = (booking: any) => ({
  _id: booking._id,
  startDate: booking.startDate,
  endDate: booking.endDate,
  totalPrice: booking.totalPrice,
  listing: booking.listingId, // populated
  guest: booking.guest,
  createdAt: booking.createdAt,
});

export const getBookingsService = async (authorId: string) => {
  const bookings = await Booking.find({ authorId })
    .populate("listingId")
    .lean();
  return bookings.map(mapBookingToResponse);
};

export const getMyBookingsService = async (guestId: string) => {
  const bookings = await Booking.find({ guest: guestId })
    .populate("listingId")
    .lean();
  return bookings.map(mapBookingToResponse);
};
```

---

## 7. Client-Side Type Fixes

**File:** `client/src/types/Listing/listing.types.ts`

```typescript
// Fix: Use lowercase 'number' throughout
export interface ReservationType {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number; // NOT 'Number'
  listing: ListingType;
  guest: string;
  createdAt: string;
}
```

**File:** `client/src/types/`

Standardize naming conventions:

```
// Consistent naming pattern:
UserType          (not UserType vs safeUserType)
ListingType       (not ListingType vs safeListingType)
ReservationType   (not ReservationType vs ReservationSafeType)
BookingType       (not mixed)
```

---

## 8. Add Error Boundary Component

**Create:** `client/src/components/ErrorBoundary.tsx`

```typescript
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <button
              className="bg-rose-500 text-white px-4 py-2 rounded-lg"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Wrap app in `main.tsx` or `App.tsx`:**

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 9. Add API Versioning

**File:** `server/src/app.ts`

```typescript
// Prefix all routes with /api/v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/favorites", favoriteRoutes);

// Keep /api as alias for current version (backward compat)
app.use("/api", authRoutes);
app.use("/api", listingRoutes);
// ... etc
```

This allows future API versions without breaking existing clients.
