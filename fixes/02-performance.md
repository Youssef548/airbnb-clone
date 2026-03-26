# Performance Fixes

## 1. Fix N+1 Query / In-Memory Pagination

**File:** `server/src/services/listing.service.ts` (lines 55-88)

**Problem:** `Listing.find()` fetches ALL listings with ALL bookings populated, filters dates in JavaScript, then paginates in-memory. At scale this will cause out-of-memory crashes.

**Fix - Use MongoDB Aggregation Pipeline:**

```typescript
export const getListingsService = async (queryParams: Record<string, any>) => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 12;
  const skip = (page - 1) * limit;

  // Build match stage
  const matchStage: Record<string, any> = {};

  if (queryParams.userId) {
    matchStage.user = new mongoose.Types.ObjectId(queryParams.userId);
  }
  if (queryParams.category) {
    matchStage.category = queryParams.category;
  }
  if (queryParams.roomCount) {
    matchStage.roomCount = { $gte: Number(queryParams.roomCount) };
  }
  if (queryParams.guestCount) {
    matchStage.guestCount = { $gte: Number(queryParams.guestCount) };
  }
  if (queryParams.bathRoomCount) {
    matchStage.bathRoomCount = { $gte: Number(queryParams.bathRoomCount) };
  }
  if (queryParams.locationValue) {
    matchStage["location.value"] = queryParams.locationValue;
  }

  const pipeline: any[] = [{ $match: matchStage }];

  // Only join bookings if date filtering is needed
  if (queryParams.startDate && queryParams.endDate) {
    pipeline.push(
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "listingId",
          as: "bookings",
        },
      },
      {
        $match: {
          $or: [
            { bookings: { $size: 0 } },
            {
              bookings: {
                $not: {
                  $elemMatch: {
                    startDate: { $lt: new Date(queryParams.endDate) },
                    endDate: { $gt: new Date(queryParams.startDate) },
                  },
                },
              },
            },
          ],
        },
      }
    );
  }

  // Get total count and paginated results in parallel
  const [countResult, listings] = await Promise.all([
    Listing.aggregate([...pipeline, { $count: "total" }]),
    Listing.aggregate([
      ...pipeline,
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
  ]);

  const totalListings = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalListings / limit);

  return {
    listings,
    totalPages,
    currentPage: page,
  };
};
```

---

## 2. Add Database Indexes

**File:** `server/src/models/User.model.ts`

```typescript
// Add after schema definition
UserSchema.index({ email: 1 }, { unique: true });
```

**File:** `server/src/models/Listing.model.ts`

```typescript
ListingSchema.index({ user: 1 });
ListingSchema.index({ category: 1 });
ListingSchema.index({ "location.value": 1 });
ListingSchema.index({ price: 1 });
// Compound index for common query patterns
ListingSchema.index({ category: 1, "location.value": 1, price: 1 });
```

**File:** `server/src/models/booking.model.ts`

```typescript
BookingSchema.index({ listingId: 1 });
BookingSchema.index({ guest: 1 });
BookingSchema.index({ authorId: 1 });
// Compound index for date overlap queries
BookingSchema.index({ listingId: 1, startDate: 1, endDate: 1 });
```

---

## 3. Add Pagination to Favorites

**File:** `server/src/services/favorite.service.ts` (line 69)

**Problem:** Fetches all favorite listings with no limit.

**Fix:**

```typescript
export const getFavoriteListingsService = async (
  userId: string,
  page: number = 1,
  limit: number = 12
) => {
  const user = await User.findById(userId).lean();
  if (!user) throw errorHandler(404, "User not found");

  const favoriteListingIds = user.favoriteListingsIds || [];
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    Listing.find({ _id: { $in: favoriteListingIds } })
      .skip(skip)
      .limit(limit)
      .lean(),
    Listing.countDocuments({ _id: { $in: favoriteListingIds } }),
  ]);

  return {
    favorites,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};
```

---

## 4. Use `.lean()` Consistently

**Problem:** Some queries return full Mongoose documents when only plain objects are needed.

**Files to update:**

```typescript
// favorite.service.ts line 65 - add .lean()
const user = await User.findById(userId).lean();

// listing.service.ts line 106 - add .lean() and select only needed fields
const listing = await Listing.findById(listingId)
  .populate("user", "username email")  // only needed fields
  .lean()
  .exec();

// booking.service.ts - add .lean() to read queries
const bookings = await Booking.find({ authorId: userId })
  .populate("listingId")
  .lean();
```

---

## 5. Client-Side: Add React Query for Caching

**Install:**

```bash
cd client
pnpm add @tanstack/react-query
```

**Create `client/src/providers/QueryProvider.tsx`:**

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
```

**Example usage in `Home.tsx`:**

```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["listings", page, filters],
  queryFn: () => getListings({ page, ...filters }),
});
```

---

## 6. Client-Side: Add React.memo to ListingCard

**File:** `client/src/components/Listings/ListingCard.tsx`

```typescript
import { memo } from "react";

const ListingCard = ({ data, currentUser, ... }: ListingCardProps) => {
  // ... existing component code
};

export default memo(ListingCard);
```

---

## 7. Client-Side: Lazy Load Modals

**File:** `client/src/components/layouts/Layout.tsx`

```typescript
import { lazy, Suspense } from "react";

const LoginModal = lazy(() => import("../Modals/LoginModal"));
const RegisterModal = lazy(() => import("../Modals/RegisterModal"));
const RentModal = lazy(() => import("../Modals/RentModal"));
const SearchModal = lazy(() => import("../Modals/SearchModal"));

// In JSX:
<Suspense fallback={null}>
  {loginModal.isOpen && <LoginModal />}
  {registerModal.isOpen && <RegisterModal />}
  {rentModal.isOpen && <RentModal />}
  {searchModal.isOpen && <SearchModal />}
</Suspense>
```

---

## 8. Cloudinary Image Optimization

**File:** `client/src/components/Listings/ListingCard.tsx`

Add transformation parameters to Cloudinary URLs:

```typescript
const optimizedImageUrl = (url: string, width: number = 400) => {
  if (!url.includes("cloudinary.com")) return url;
  // Insert transformation before /upload/
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
};

// Usage in img tag:
<img src={optimizedImageUrl(data.imageSrc, 400)} alt={data.title} />
```

**File:** `client/src/components/Listings/ListingHead.tsx`

```typescript
// Use larger size for detail page
<img src={optimizedImageUrl(imageSrc, 800)} alt={title} />
```

---

## 9. Parallel API Calls on Listing Page

**File:** `client/src/pages/Listings/ListingPage.tsx`

**Problem:** Listing and reservations fetched sequentially.

**Fix:**

```typescript
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [listingRes, reservationsRes] = await Promise.all([
        getListing(listingId),
        getReservations({ listingId }),
      ]);
      setListing(listingRes);
      setReservations(reservationsRes);
    } catch (error) {
      toast.error("Failed to load listing");
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [listingId]);
```
