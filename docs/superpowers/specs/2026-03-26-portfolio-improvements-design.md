# Portfolio Improvements Design

**Date:** 2026-03-26
**Status:** Approved

## Overview

Eight improvements to make the Airbnb clone a strong mid-level MERN stack portfolio piece: documentation, a reviews/ratings feature, enhanced search filters, code quality fixes, React component tests, and accessibility.

## 1. README & Swagger Documentation

### README.md (root)

Complete rewrite with:

- Project title + one-line description ("Full-stack Airbnb clone built with the MERN stack")
- Feature list: auth (JWT + OAuth), booking system, favorites, search with filters, categories, reviews/ratings, role-based access (guest/host)
- Tech stack with badges: React 18, Express 4, MongoDB, TypeScript, Tailwind CSS, Docker, Playwright, pnpm workspaces
- Screenshots section (placeholder image paths — user adds actual screenshots)
- Architecture overview: monorepo structure diagram showing the 4 packages and their dependencies
- Quick start instructions: prerequisites, clone, pnpm install, Docker MongoDB, dev servers
- Package descriptions table (shared, database, server, client)
- Environment variables table (all required vars for client and server)
- API docs link pointing to `/api/docs`
- License: MIT

### Swagger/OpenAPI

**Dependencies:** Add `swagger-jsdoc` and `swagger-ui-express` to `@airbnb/server`.

**Setup:** Create `packages/server/src/config/swagger.ts` with OpenAPI 3.0 spec definition. Mount Swagger UI at `GET /api/docs`.

**Endpoints to document (33 total):**

Auth (11):

- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me
- POST /api/auth/logout
- POST /api/auth/oauth/exchange
- GET /api/auth/oauth/availability
- GET /api/auth/google
- GET /api/auth/google/callback
- GET /api/auth/github
- GET /api/auth/github/callback
- GET /api/auth/failure

Listings (4):

- POST /api/listings/
- GET /api/listings/
- GET /api/listings/:listingId
- DELETE /api/listings/:listingId

Bookings (3):

- POST /api/booking/
- GET /api/booking/
- DELETE /api/booking/:bookingId

Favorites (3):

- POST /api/favorites/:listingId
- DELETE /api/favorites/:listingId
- GET /api/favorites/

Health (1):

- GET /api/health

Reviews (3, new — see Section 2):

- POST /api/reviews/:listingId
- GET /api/reviews/:listingId
- DELETE /api/reviews/:reviewId

Each endpoint documented with: summary, description, request body schema (where applicable), response schema, authentication requirements, error responses.

## 2. Reviews/Ratings Feature

### Database

**New model:** `packages/database/src/models/review.model.ts`

```typescript
interface IReview extends Document {
  listing: Types.ObjectId; // ref: Listing
  user: Types.ObjectId; // ref: User
  rating: number; // 1-5
  comment: string; // min 10, max 1000 chars
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**

- Compound unique index on `{ listing, user }` — one review per user per listing
- Index on `{ listing: 1, createdAt: -1 }` — for fetching reviews by listing

**Listing model update:** Add two cached fields:

- `averageRating: Number` (default: 0)
- `reviewCount: Number` (default: 0)

These are updated when reviews are created or deleted (in the review service).

**Zod schema:** `packages/database/src/schemas/review.schema.ts`

- `rating`: number, min 1, max 5
- `comment`: string, min 10 chars, max 1000 chars

### Shared Types

Add to `@airbnb/shared`:

```typescript
export type ReviewType = {
  _id: string;
  listing: string;
  user: UserType;
  rating: number;
  comment: string;
  createdAt: string;
};
```

Update `ListingType` to include:

- `averageRating?: number`
- `reviewCount?: number`

### API

**New route file:** `packages/server/src/routes/review.route.ts`

| Method | Endpoint                | Middleware                                                   | Description                                                                                                               |
| ------ | ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| POST   | /api/reviews/:listingId | isAuth, validateObjectId, validateSchema(createReviewSchema) | Create review. Service checks user has a completed booking for this listing and hasn't reviewed yet.                      |
| GET    | /api/reviews/:listingId | validateObjectId                                             | Get paginated reviews for a listing. Populates user (username, image). Sorted by newest first. Query params: page, limit. |
| DELETE | /api/reviews/:reviewId  | isAuth, validateObjectId                                     | Delete own review. Updates listing's averageRating and reviewCount.                                                       |

**Service:** `packages/server/src/services/review.service.ts`

- `createReviewService(userId, listingId, data)` — Verify booking exists, create review, recalculate listing averageRating/reviewCount
- `getReviewsService(listingId, page, limit)` — Paginated reviews with user population
- `deleteReviewService(userId, reviewId)` — Delete own review, recalculate listing stats

**Controller:** `packages/server/src/controllers/review.controller.ts`

**App.ts:** Mount new route: `app.use("/api/reviews/", reviewRoutes)`

### Client

**New API file:** `packages/client/src/apis/Reviews/review.ts`

- `getReviews(listingId, page?)` — GET /api/reviews/:listingId
- `createReview(listingId, data)` — POST /api/reviews/:listingId
- `deleteReview(reviewId)` — DELETE /api/reviews/:reviewId

**New components:**

`packages/client/src/components/StarRating.tsx` — Reusable star display. Props: `rating: number`, `size?: 'sm' | 'md'`, `showNumber?: boolean`. Renders filled/empty stars using simple SVG or unicode stars.

`packages/client/src/components/Reviews/ReviewCard.tsx` — Single review display. Shows user avatar, name, date (relative using date-fns `formatDistanceToNow`), star rating, comment text.

`packages/client/src/components/Reviews/ReviewForm.tsx` — Star selector (clickable stars) + textarea + submit button. Only shown if user is authenticated and has a completed booking.

`packages/client/src/components/Reviews/ReviewsSection.tsx` — Container component for listing detail page. Shows average rating + count header, list of ReviewCards with pagination, ReviewForm at bottom (conditionally).

**UI integration:**

`ListingCard` — Add `StarRating` below price showing `averageRating` and `reviewCount`. Example: "4.8 (12 reviews)".

`ListingClient.tsx` — Add `ReviewsSection` below the grid (after ListingInfo + ListingReservation). Fetch reviews in the parent `Listing.tsx` page alongside listing and reservations.

## 3. Search Filters Enhancement

### Backend

**Schema update** (`getListingsQuerySchema`): Add:

- `minPrice`: optional string, transforms to number
- `maxPrice`: optional string, transforms to number
- `sortBy`: optional enum `['price_asc', 'price_desc', 'newest', 'rating']`, default `'newest'`

**Service update** (`getListingsService`): Add to match stage:

```typescript
if (queryParams.minPrice)
  match.price = { ...match.price, $gte: parseInt(queryParams.minPrice) };
if (queryParams.maxPrice)
  match.price = { ...match.price, $lte: parseInt(queryParams.maxPrice) };
```

Replace hardcoded `{ $sort: { _id: -1 } }` with dynamic sort based on `sortBy`:

- `price_asc` → `{ price: 1 }`
- `price_desc` → `{ price: -1 }`
- `newest` → `{ _id: -1 }` (current default)
- `rating` → `{ averageRating: -1 }` (requires reviews feature)

### Frontend

**SearchModal** — Add step `PRICE = 2` (renumber INFO to 3):

```
LOCATION(0) → DATE(1) → PRICE(2) → INFO(3)
```

PRICE step UI:

- "Price Range" heading
- Two input fields: "Min Price" and "Max Price" (type number)
- State: `minPrice: string`, `maxPrice: string`
- Added to query params on submit

**Home page** — Add sort dropdown above the listing grid:

- `<select>` with options: "Newest", "Price: Low to High", "Price: High to Low", "Highest Rated"
- Changes `sortBy` query param and refetches listings
- Styled with Tailwind to match existing UI

## 4. Code Quality Fixes

### Fix `any` types (3 instances)

1. `packages/server/src/config/passport.ts:11` — `(user: any, done)` → type as `Express.User`
2. `packages/server/src/config/passport.ts:89` — `(accessToken: string, refreshToken: string, profile: any, done: any)` → type with Passport profile types
3. `packages/server/src/services/booking.service.ts:51` — `(reservation: any)` → type with proper booking populated type

### Fix typo

`packages/client/src/pages/Listings/ListingClient.tsx:37` — `loginMOdal` → `loginModal`

### Extract shared AuthModal

Create `packages/client/src/components/Modals/AuthModal.tsx` — shared base component containing:

- OAuth availability check logic
- OAuth button section (Google/GitHub)
- Error display pattern
- Toggle between login/register
- Form container layout

`LoginModal` and `RegisterModal` become thin wrappers that provide:

- Form fields specific to their mode
- Submit handler
- Title/subtitle text

This eliminates ~40% code duplication.

### Remove debug logs

- `packages/client/src/pages/Home/Home.tsx:51` — Replace `console.error` with toast notification
- Remove dead commented-out admin route in `packages/server/src/routes/booking.route.ts`

## 5. React Component Tests

### Setup

**Dependencies** (add to `@airbnb/client` devDependencies):

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `jsdom`

**Config:** Create `packages/client/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
```

**Setup file:** `packages/client/src/test/setup.ts` — imports `@testing-library/jest-dom`.

**Script:** Add `"test": "vitest"` to client package.json.

### Tests to write

**`src/components/__tests__/ListingCard.test.tsx`**

- Renders listing title, price, category
- Shows average rating when present
- Shows favorite button
- Renders reservation dates when provided

**`src/components/__tests__/HeartButton.test.tsx`**

- Renders unfilled heart by default
- Calls login modal when clicked while unauthenticated
- Toggles filled state when clicked while authenticated

**`src/components/__tests__/Modal.test.tsx`**

- Renders when isOpen is true
- Hidden when isOpen is false
- Closes on backdrop click
- Closes on Escape key (after a11y fix)
- Renders title and body content

**`src/store/__tests__/useStore.test.ts`**

- Sets and gets current user
- Persists to localStorage
- Clears user on logout

**`src/store/__tests__/listingsStore.test.ts`**

- Sets and gets listings
- Handles empty state

**`src/hooks/__tests__/useFavorite.test.tsx`**

- Returns isFavorited true when listing is in user's favorites
- Returns isFavorited false when not in favorites
- Calls API on toggle

## 6. Accessibility Fixes

### Modal (`packages/client/src/components/Modals/Modal.tsx`)

- Add `role="dialog"` and `aria-modal="true"` to modal container
- Add `aria-labelledby` pointing to the title element
- Add Escape key handler: `useEffect` with `keydown` listener that calls `handleClose()`
- Add focus trap: focus stays within modal while open (use a simple implementation — trap Tab and Shift+Tab to cycle through focusable elements)
- Restore focus to trigger element on close

### Icon buttons

- `HeartButton`: Add `aria-label="Add to favorites"` / `aria-label="Remove from favorites"` (dynamic based on state)
- Modal close button: Add `aria-label="Close"`
- Search button: Add `aria-label="Search"`
- Any icon-only button in Navbar: Add descriptive `aria-label`

### Images

- `ListingCard`: Add `alt={listing.title}` to listing image
- `ListingHead`: Add `alt={listing.title}` to header image
- `Avatar`: Add `alt="User avatar"` or `alt={username}`

### Semantic HTML

- Navbar: Wrap in `<nav aria-label="Main navigation">`
- Main content: Wrap page content in `<main>`
- Footer: Use `<footer>` element
- Listing cards: Use `<article>` elements

### Forms

- All input fields: ensure `<label>` elements have matching `htmlFor`/`id` attributes
- Form error messages: associate with inputs using `aria-describedby`

### Skip link

- Add hidden "Skip to main content" link as first focusable element in Layout, visible on focus
