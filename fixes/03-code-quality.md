# Code Quality Fixes

## 1. Consolidate Duplicate CustomRequest Interface

**Problem:** `CustomRequest` interface duplicated in 4 controller files.

**Files affected:**
- `server/src/controllers/auth.controller.ts:10`
- `server/src/controllers/booking.controller.ts:10`
- `server/src/controllers/favorite.controller.ts:8`
- `server/src/controllers/listing.controller.ts:10`

**Fix:** Use the existing global Express type extension.

**File:** `server/src/types/express/index.d.ts` (already exists, verify content):

```typescript
import { UserJwtPayload } from "../../middleware/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}
```

Where `UserJwtPayload` is:

```typescript
// server/src/middleware/auth.middleware.ts
export interface UserJwtPayload {
  userId: string;
  role: "guest" | "host";
}
```

**Then remove** the `CustomRequest` interface and `as CustomRequest` casts from all 4 controllers:

```typescript
// BEFORE (in each controller)
interface CustomRequest extends Request {
  user: { userId: string };
}

const createListing = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as CustomRequest).user;
  // ...
};

// AFTER (in each controller)
const createListing = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.user!;
  // ...
};
```

---

## 2. Eliminate `any` Types

### Server-side fixes:

**File:** `server/src/controllers/auth.controller.ts:45`

```typescript
// BEFORE
} catch (error: any) {
  res.status(400).json({ message: error.message });
}

// AFTER
} catch (error) {
  if (error instanceof Error) {
    next(errorHandler(400, error.message));
  } else {
    next(errorHandler(500, "An unexpected error occurred"));
  }
}
```

**File:** `server/src/services/listing.service.ts:7,38-39`

```typescript
// BEFORE
const where: Record<string, any> = {};

// AFTER
interface ListingFilter {
  user?: mongoose.Types.ObjectId;
  category?: string;
  roomCount?: { $gte: number };
  guestCount?: { $gte: number };
  bathRoomCount?: { $gte: number };
  "location.value"?: string;
}

const where: ListingFilter = {};
```

**File:** `server/src/config/passport.ts:10`

```typescript
// BEFORE
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// AFTER
import { IUser } from "../models/User.model";

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUser).id);
});
```

**File:** `server/src/middleware/validationFactory.middleware.ts:5`

```typescript
// BEFORE
export const validateSchema = (schema: ZodObject<any>) => {

// AFTER
import { ZodType } from "zod";

export const validateSchema = (schema: ZodType) => {
```

### Client-side fixes:

**File:** `client/src/providers/AxiosInstance.tsx:23`

```typescript
// BEFORE
} catch (error: any) {

// AFTER
} catch (error) {
  if (error instanceof AxiosError) {
    // handle axios error
  }
}
```

**File:** `client/src/components/Map.tsx:10,26`

Replace `any` with proper Leaflet types or use the specific type from the library.

---

## 3. Standardize Error Handling in Controllers

**Problem:** Some controllers use `res.status().json()` directly, others use `next(errorHandler())`.

**Fix:** All controllers should pass errors to `next()` for centralized handling.

```typescript
// STANDARD PATTERN for all controllers:
const controllerFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await someService(req.body);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error); // Let error middleware handle it
  }
};
```

Services should throw errors using `errorHandler`:

```typescript
// In services:
import { errorHandler } from "../utils/error";

if (!listing) {
  throw errorHandler(404, "Listing not found");
}
```

---

## 4. Standardize API Response Format

**Problem:** Inconsistent response shapes across endpoints.

**Fix:** Define and use a consistent response helper:

```typescript
// server/src/utils/response.ts
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: { page: number; totalPages: number; total: number }
) => {
  res.status(200).json({
    success: true,
    data,
    pagination,
  });
};
```

---

## 5. Fix 204 With JSON Body

**File:** `server/src/controllers/booking.controller.ts:64`

**Problem:** HTTP 204 (No Content) should not have a response body.

```typescript
// BEFORE
res.status(204).json({ message: "Booking cancelled" });

// AFTER - Option A: Use 204 correctly (no body)
res.status(204).send();

// AFTER - Option B: Use 200 with body
res.status(200).json({ message: "Booking cancelled" });
```

---

## 6. Fix Typos

**File:** `client/src/components/Listings/ListingClient.tsx`

```typescript
// Fix: loginMOdal → loginModal (if present)
```

**File:** `client/src/pages/Trips/TripsClient.tsx`

```typescript
// Fix: TripsClieentProps → TripsClientProps
interface TripsClientProps {
  // ...
}
```

**File:** `client/src/components/Inputs/ImageUpload.tsx`

```typescript
// Fix: cloundinaryRef → cloudinaryRef
const cloudinaryRef = useRef<any>(null);
```

**File:** `client/.env.example`

```
# Fix: CLODINARY → CLOUDINARY
VITE_APP_CLOUDINARY_CLOUD_NAME="test"
```

---

## 7. Remove Dead Code

**File:** `server/src/controllers/booking.controller.ts` (lines 32-55)

Remove the unused `getBookings` function or export it and wire it to a route.

**File:** `server/src/routes/booking.route.ts` (line 16)

Either implement the admin route or remove the TODO comment:

```typescript
// Remove this line:
// TODO: add admin middleware (I didn't create admin role yet)
```

---

## 8. Remove Debug console.log Statements

**Files to clean:**
- `client/src/hooks/useCountries.tsx:2` - remove `console.log(countries)`
- `client/src/components/Listings/ListingClient.tsx:87,94` - remove debug logs
- `client/src/pages/Trips/Trips.tsx:24` - remove debug log

Replace with nothing (remove the lines), or if logging is needed, use a debug utility:

```typescript
// client/src/utils/logger.ts
export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
};
```

---

## 9. Reduce Modal Code Duplication

**Problem:** `LoginModal` and `RegisterModal` share nearly identical structure.

**Fix:** Extract shared auth modal logic:

```typescript
// client/src/components/Modals/AuthModalBase.tsx
interface AuthModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: FieldValues) => void;
  fields: FieldConfig[];
  submitLabel: string;
  footerText: string;
  footerAction: () => void;
  footerActionLabel: string;
}

const AuthModalBase = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  fields,
  submitLabel,
  footerText,
  footerAction,
  footerActionLabel,
}: AuthModalBaseProps) => {
  // Shared form logic, OAuth buttons, and layout
};
```

---

## 10. Extract Shared List Rendering Component

**Problem:** Grid rendering of `ListingCard` duplicated in 5+ pages.

**Fix:**

```typescript
// client/src/components/Listings/ListingGrid.tsx
interface ListingGridProps {
  listings: ListingType[];
  currentUser: UserType | null;
  emptyMessage?: string;
  onAction?: (id: string) => void;
  actionLabel?: string;
  reservation?: boolean;
}

const ListingGrid = ({
  listings,
  currentUser,
  emptyMessage = "No listings found",
  onAction,
  actionLabel,
}: ListingGridProps) => {
  if (listings.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          data={listing}
          currentUser={currentUser}
          onAction={onAction}
          actionLabel={actionLabel}
        />
      ))}
    </div>
  );
};
```
