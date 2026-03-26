# Workflow: Full Refactoring Plan

**Generated**: 2026-03-22
**Branch**: `airbnb-v2`
**Strategy**: Phased sprints (security-first)
**Source**: `/fixes/01-06` (50 items)

---

## Sprint 1: Critical Security Foundation

**Branch**: `feature/security-hardening`
**Commit prefix**: `fix(security):`
**Installs**: `helmet`, `express-rate-limit`, `express-mongo-sanitize`

### Task 1.1 — Fix broken CORS configuration

**File**: `server/src/app.ts` (lines 19-38)

**Current code** uses `string.includes()` on `ALLOWED_ORIGINS`:
```typescript
process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.includes(origin)
```

**Action**:
1. Parse `ALLOWED_ORIGINS` as JSON array at the top of the file
2. Replace the `includes` check with array `.includes()` on the parsed array
3. Handle `JSON.parse` failure gracefully (default to empty array)
4. Update `server/.env.example` to show JSON array format: `ALLOWED_ORIGINS=["http://localhost:5173"]`

**Validation**: Verify CORS blocks requests from unlisted origins and allows listed ones.

---

### Task 1.2 — Fix JWT payload missing `role` in login

**File**: `server/src/services/auth.service.ts` (line 33)

**Current JWT payload**:
```typescript
{ userId: user._id, favoriteListingsIds: user.favoriteListingsIds }
```

**Action**:
1. Add `role: user.role` to the JWT sign payload in `loginUserService`
2. Remove `favoriteListingsIds` from JWT payload (it doesn't belong in a token — it's data, not auth claims)

**Result payload**: `{ userId: user._id, role: user.role }`

**Also update**: `server/src/controllers/oauth.controller.ts` line 52 — remove `favoriteListingsIds` from OAuth JWT too for consistency.

**Validation**: Login with a host user, verify `authorizeRoles("host")` middleware passes.

---

### Task 1.3 — Strengthen password requirements

**File**: `server/src/schemas/userSchema.ts` (lines 5-7, 16-18)

**Current**: `min(5)` for both login and register schemas.

**Action**:
1. Update `registerUserSchema` password field:
   - `.min(8, "Password must be at least 8 characters")`
   - `.regex(/[A-Z]/, "Must contain at least one uppercase letter")`
   - `.regex(/[a-z]/, "Must contain at least one lowercase letter")`
   - `.regex(/[0-9]/, "Must contain at least one number")`
2. Update `loginUserShema` password to `.min(1)` (login should not enforce complexity — only presence)
3. Fix typo: rename `loginUserShema` → `loginUserSchema`
4. Update import in `server/src/routes/authRoutes.ts` line 6 to match new name

**Validation**: Try registering with `"abc"` — should get 400. Register with `"Abcdef1!"` — should succeed.

---

### Task 1.4 — Fix insecure OAuth random password

**File**: `server/src/config/passport.ts` (lines 63, 120)

**Current**: `Math.random().toString(36).slice(-8)` — predictable.

**Action**:
1. Add `import crypto from "crypto";` at top of file
2. Replace both `Math.random()` password lines with:
   ```typescript
   password: crypto.randomBytes(32).toString("hex"),
   ```
3. Also fix `any` types on lines 10 and 88:
   - Line 10: `(user: any, done)` → `(user: Express.User, done)`
   - Line 88: `(accessToken: string, refreshToken: string, profile: any, done: any)` — keep `profile: any` (GitHub strategy types are poor), but type `done` properly

**Validation**: Create OAuth user, verify password field is 64-char hex string.

---

### Task 1.5 — Add Helmet middleware

**Install**: `cd server && pnpm add helmet`

**File**: `server/src/app.ts`

**Action**:
1. Add `import helmet from "helmet";` after express import
2. Add `app.use(helmet());` as the **first** middleware (before CORS)

**Validation**: Check response headers include `X-Content-Type-Options`, `X-Frame-Options`, etc.

---

### Task 1.6 — Add rate limiting

**Install**: `cd server && pnpm add express-rate-limit`

**Action**:
1. Create `server/src/middleware/rateLimiter.ts`:
   - `apiLimiter`: 100 requests per 15 minutes
   - `authLimiter`: 10 requests per 15 minutes
2. In `server/src/app.ts`: apply `apiLimiter` globally with `app.use(apiLimiter)`
3. In `server/src/routes/authRoutes.ts`: apply `authLimiter` to `/login` and `/register` routes

**Validation**: Hit `/api/auth/login` 11 times rapidly — 11th should return 429.

---

### Task 1.7 — Add NoSQL injection prevention

**Install**: `cd server && pnpm add express-mongo-sanitize`

**File**: `server/src/app.ts`

**Action**:
1. Add `import mongoSanitize from "express-mongo-sanitize";`
2. Add `app.use(mongoSanitize());` after `express.json()` middleware

**Validation**: Send `{ "email": { "$gt": "" } }` to login — should be sanitized, not match all users.

---

### Task 1.8 — Add request size limiting

**File**: `server/src/app.ts` (line 43)

**Current**: `app.use(express.json());` — no size limit.

**Action**:
1. Replace with `app.use(express.json({ limit: "10kb" }));`
2. Add `app.use(express.urlencoded({ extended: true, limit: "10kb" }));`

**Validation**: Send a >10kb JSON body — should get 413.

---

### Sprint 1 Checkpoint

**Before committing**, verify:
- [ ] Server starts without errors
- [ ] `pnpm run test` passes in server
- [ ] Login/register still works
- [ ] OAuth flow still works
- [ ] CORS blocks unauthorized origins

**Commit**: `fix(security): harden CORS, JWT, passwords, add helmet/rate-limiting/sanitization`

---

## Sprint 2: Auth Flow Overhaul

**Branch**: `feature/auth-overhaul`
**Commit prefix**: `refactor(auth):`
**Installs**: `cookie-parser`, `@types/cookie-parser`

### Task 2.1 — Install cookie-parser and set up httpOnly cookies

**Install**: `cd server && pnpm add cookie-parser && pnpm add -D @types/cookie-parser`

**File**: `server/src/app.ts`

**Action**:
1. Add `import cookieParser from "cookie-parser";`
2. Add `app.use(cookieParser());` before routes
3. Ensure CORS has `credentials: true` (already present)

---

### Task 2.2 — Server: Set JWT as httpOnly cookie on login/register

**File**: `server/src/controllers/auth.controller.ts`

**Action**:
1. In `loginUser`: after getting `{ token, user }` from service, set cookie:
   ```typescript
   res.cookie("token", token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax",
     maxAge: 60 * 60 * 1000,
     path: "/",
   });
   ```
2. Return `res.status(200).json({ message: "Login successful", currentUser: user })` — **remove token from response body**
3. Do the same for `createUser` (register):
   - Service currently only returns `user` (no token). Update `createUserService` to also return a token (same pattern as login), OR generate token in controller.
   - Set cookie, return user without token
4. Add `logout` controller:
   ```typescript
   export const logout = async (_req: Request, res: Response) => {
     res.clearCookie("token", { path: "/" });
     res.status(200).json({ message: "Logged out" });
   };
   ```

**File**: `server/src/routes/authRoutes.ts`
- Add `import { logout } from "../controllers/auth.controller";`
- Add `router.post("/logout", logout);`

---

### Task 2.3 — Server: Read JWT from cookie instead of Authorization header

**File**: `server/src/middleware/auth.middleware.ts`

**Action**: Replace the entire `isAuth` function:
1. Read token from `req.cookies?.token` instead of `req.headers.authorization`
2. Remove the Bearer token parsing logic
3. Keep the JWT verify + `req.user` assignment
4. Remove the `AuthenticatedRequest` interface (use global Express types)

---

### Task 2.4 — Server: OAuth code exchange pattern

**File**: `server/src/controllers/oauth.controller.ts`

**Action**:
1. Add `import crypto from "crypto";`
2. Create `pendingTokens` Map for temporary code storage:
   ```typescript
   const pendingTokens = new Map<string, { token: string; user: SanitizedUser; expiresAt: number }>();
   ```
3. In `oauthCallback`: instead of putting token/user in redirect URL:
   - Generate a random code: `crypto.randomBytes(32).toString("hex")`
   - Store `{ token, user, expiresAt: Date.now() + 60_000 }` in the map
   - Redirect to `${CLIENT_URL}/auth/callback?code=${code}`
4. Add `exchangeCode` controller:
   - Accept POST with `{ code }` body
   - Look up code in map, validate not expired
   - Delete code from map
   - Set httpOnly cookie with the token
   - Return user data in response body
5. Add cleanup interval (every 5 minutes, purge expired entries)

**File**: `server/src/routes/authRoutes.ts`
- Add `router.post("/oauth/exchange", exchangeCode);`

---

### Task 2.5 — Client: Remove localStorage token management

**File**: `client/src/providers/AxiosInstance.tsx`

**Action**:
1. Add `withCredentials: true` to axios.create config
2. **Remove** the request interceptor that injects `Authorization: Bearer` header
3. **Simplify** the response interceptor:
   - Remove refresh token logic (refreshToken is not implemented on server anyway)
   - On 401: call `handleUnauthorized()` — no retry
4. Remove all `localStorage.getItem("authToken")` and `localStorage.getItem("refreshToken")` references

**File**: `client/src/store/useStore.ts`

**Action**:
1. Remove `localStorage.getItem("authToken")` from `fetchUser`
2. Update `fetchUser` to call `/auth/me` directly (cookie sent automatically)
3. Remove `setAuthToken` import/usage from all client files
4. Keep `currentUser` in localStorage (just user display data, no token)

**File**: `client/src/utils/authUtils.tsx`
- Remove `setAuthToken` function (or update to no longer store token)
- Remove any `localStorage` token operations

---

### Task 2.6 — Client: Update OAuth callback for code exchange

**File**: `client/src/pages/Auth/OAuthCallback.tsx`

**Action**: Rewrite the component:
1. Extract `code` from URL params (not `token`/`user`)
2. POST to `/api/auth/oauth/exchange` with `{ code }` body (cookie set by server)
3. On success: store user from response in Zustand, navigate to `/`
4. On failure: navigate to `/` with error toast
5. Clear URL params with `window.history.replaceState`

---

### Task 2.7 — Client: Strengthen ProtectedRoute

**File**: `client/src/components/ProtectedRoute.tsx`

**Current**: Only checks `user !== null` from Zustand store.

**Action**: The route already has `/auth/me` available and `fetchUser` calls it. The ProtectedRoute should:
1. Check if `user` is `undefined` (still loading) → show loading spinner
2. Check if `user` is `null` (not authenticated) → redirect to `/`
3. Check if `user` exists → render `<Outlet />`

The `Layout` component already calls `fetchUser` on mount, which validates the cookie via `/auth/me`. If the cookie is invalid, `fetchUser` clears the user state, and ProtectedRoute redirects.

---

### Task 2.8 — Client: Add logout API call

**Files**: Find all logout/clearUser calls across client components.

**Action**:
1. Create `client/src/apis/auth/logout.ts`:
   ```typescript
   export const logoutApi = () => axiosInstance.post("/api/auth/logout");
   ```
2. Update `useStore.ts` `clearUser`:
   - Call `logoutApi()` to clear the server cookie
   - Then clear localStorage user data
3. Update all logout button handlers to use the new flow

---

### Sprint 2 Checkpoint

**Before committing**, verify:
- [ ] Login sets httpOnly cookie (check DevTools → Application → Cookies)
- [ ] No token visible in localStorage
- [ ] Protected routes redirect when not logged in
- [ ] OAuth login works end-to-end
- [ ] Logout clears cookie and redirects
- [ ] `pnpm run test` passes (update test auth headers to use cookies)

**Commit**: `refactor(auth): migrate to httpOnly cookies, add code exchange for OAuth`

---

## Sprint 3: Performance & Database

**Branch**: `feature/performance`
**Commit prefix**: `perf:`
**Installs**: none

### Task 3.1 — Rewrite getListingsService with aggregation pipeline

**File**: `server/src/services/listing.service.ts` (lines 38-101)

**Action**:
1. Add `import mongoose from "mongoose";`
2. Replace the entire `getListingsService` function with aggregation pipeline:
   - Build `$match` stage from query params
   - Fix location filter: `matchStage["location.value"] = queryParams.locationValue` (not `where.location`)
   - Only `$lookup` bookings when `startDate` and `endDate` are provided
   - Use `$count` + paginated query in `Promise.all`
   - Sort by `{ _id: -1 }` (not `{ id: -1 }`)
   - Apply `$skip` and `$limit` at database level
3. Update return shape to match current format (ensure client compatibility)

**Validation**:
- Query `/api/listings?page=1&limit=5` — should return 5 items with pagination metadata
- Query with date filters — should exclude booked listings
- Query with `category` and `locationValue` — should filter correctly

---

### Task 3.2 — Fix getListingByIdService bugs

**File**: `server/src/services/listing.service.ts` (lines 103-120)

**Action**:
1. Add `.select("-password")` to the user populate:
   ```typescript
   Listing.findById(listingId).populate("user", "-password").lean().exec();
   ```
2. Since using `.lean()`, remove `toObject()` call
3. Fix the user date mapping bug:
   - Currently uses `listingData.createdAt` for user dates
   - Change to `listingData.user.createdAt` and `listingData.user.updatedAt`
4. Remove manual password nulling (handled by `.select("-password")`)

---

### Task 3.3 — Add database indexes

**File**: `server/src/models/listing.model.ts` — add after schema definition:
```typescript
ListingSchema.index({ user: 1 });
ListingSchema.index({ category: 1 });
ListingSchema.index({ "location.value": 1 });
ListingSchema.index({ price: 1 });
ListingSchema.index({ category: 1, "location.value": 1, price: 1 });
```

**File**: `server/src/models/booking.model.ts` — add after schema:
```typescript
BookingSchema.index({ listingId: 1 });
BookingSchema.index({ guest: 1 });
BookingSchema.index({ authorId: 1 });
BookingSchema.index({ listingId: 1, startDate: 1, endDate: 1 });
```

**File**: `server/src/models/User.model.ts` — verify `email` has unique index (should via `unique: true` in schema), add:
```typescript
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ githubId: 1 }, { sparse: true });
```

---

### Task 3.4 — Add pagination to favorites

**File**: `server/src/services/favorite.service.ts` (lines 64-75)

**Action**:
1. Add `page` and `limit` parameters to `getFavoriteListingsService`
2. Use `Listing.find().skip().limit().lean()` with `countDocuments` in `Promise.all`
3. Return `{ favorites, pagination }` matching the listings pagination format

**File**: `server/src/controllers/favorite.controller.ts` — pass `req.query.page` and `req.query.limit`

---

### Task 3.5 — Use .lean() consistently

**Files**: All service files with read-only queries.

**Action**:
- `favorite.service.ts` line 65: add `.lean()` to `User.findById`
- `booking.service.ts` lines 53, 74: add `.lean()` to Booking queries (and remove `.toObject()` calls)
- `listing.service.ts` line 106: already handled in Task 3.2

---

### Task 3.6 — Fix Booking model types

**File**: `server/src/models/booking.model.ts`

**Action**:
1. Change `extends Document` to `extends mongoose.Document` (import properly)
2. Fix `listing: IListing` → remove it (redundant with `listingId`)
3. Fix `listingId: IListing` → `listingId: mongoose.Types.ObjectId`
4. Fix `totalPrice: Number` → `totalPrice: number` (TypeScript primitive)
5. Add `authorId` to the interface (currently missing)
6. Type the schema: `new mongoose.Schema<IBooking>(...)`

---

### Task 3.7 — Add ObjectId validation middleware

**Create**: `server/src/middleware/validateObjectId.ts`

**Action**: Create middleware that validates route params as valid MongoDB ObjectIds.

**Apply to routes**:
- `server/src/routes/listing.route.ts`: `/:listingId` routes
- `server/src/routes/booking.route.ts`: `/:bookingId` routes
- `server/src/routes/favorite.route.ts`: `/:listingId` routes

---

### Task 3.8 — Add cascading deletes

**File**: `server/src/services/listing.service.ts` — `deleteListingService`

**Action**: After authorization check, before/during deletion:
1. Delete all bookings for this listing: `Booking.deleteMany({ listingId })`
2. Remove from all users' favorites: `User.updateMany({ favoriteListingsIds: listingId }, { $pull: { favoriteListingsIds: listingId } })`
3. Use `Promise.all` for parallel cleanup + deletion

---

### Sprint 3 Checkpoint

- [ ] Listings load with correct pagination from DB (not in-memory)
- [ ] Location filter works (test with a known `location.value`)
- [ ] Date filtering excludes booked listings
- [ ] Favorites paginate properly
- [ ] Deleting a listing removes its bookings and favorites references
- [ ] All tests pass

**Commit**: `perf: aggregation pipeline, indexes, pagination, cascading deletes`

---

## Sprint 4: Code Quality & Types

**Branch**: `feature/code-quality`
**Commit prefix**: `refactor:`
**Installs**: none

### Task 4.1 — Update global Express types and remove CustomRequest

**File**: `server/src/types/express/index.d.ts`

**Action**:
1. Add `role` to `UserJwtPayload`:
   ```typescript
   interface UserJwtPayload extends JwtPayload {
     userId: string;
     role: "guest" | "host";
   }
   ```
2. Export `UserJwtPayload` so it can be imported

**Files**: All 4 controllers (`auth`, `booking`, `favorite`, `listing`)
- Remove local `CustomRequest` interface definitions
- Remove `as CustomRequest` casts
- Use `req.user!.userId` directly (global type already extends Request)

---

### Task 4.2 — Eliminate `any` types

**Files and changes**:
1. `server/src/services/listing.service.ts`:
   - `listingData: any` → use Zod inferred type: `z.infer<typeof createListingSchema>`
   - `queryParams: any` → `Record<string, string | undefined>` or Zod inferred query type
   - `where: any` → proper `ListingFilter` interface
2. `server/src/controllers/auth.controller.ts` line 45:
   - `catch (error: any)` → `catch (error)` + `if (error instanceof Error)`
3. `server/src/middleware/validationFactory.middleware.ts`:
   - `ZodObject<any>` → `ZodType`
4. `client/src/providers/AxiosInstance.tsx` line 23:
   - `as any` → proper type or `as AxiosRequestConfig & { _retry?: boolean }`

---

### Task 4.3 — Standardize error handling

**Action**: Ensure all controllers follow the pattern:
```typescript
try {
  const result = await service(...);
  res.status(200).json({ data: result });
} catch (error) {
  next(error);
}
```

**Files to update**:
- `auth.controller.ts`: `loginUser` and `createUser` currently return errors directly with `res.status(400)` instead of using `next(error)`. Wrap service errors.
- `auth.controller.ts`: `getMe` — use `next(error)` pattern

---

### Task 4.4 — Create response helpers

**Create**: `server/src/utils/response.ts`

```typescript
export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string) => { ... };
export const sendPaginated = <T>(res: Response, data: T[], pagination: PaginationMeta) => { ... };
```

**Apply** across all controllers for consistent response format.

---

### Task 4.5 — Fix 204 responses with bodies

**Files**:
- `server/src/controllers/booking.controller.ts`: Change `res.status(204).json(...)` → `res.status(204).send()`
- `server/src/controllers/listing.controller.ts`: Same fix for delete

---

### Task 4.6 — Fix typos

**Files**:
- `client/src/components/Inputs/ImageUpload.tsx`: `cloundinaryRef` → `cloudinaryRef` (search for all instances)
- `client/src/pages/Trips/TripsClient.tsx`: `TripsClieentProps` → `TripsClientProps` (if exists)
- `client/.env.example`: `CLODINARY` → `CLOUDINARY`
- `server/src/schemas/userSchema.ts`: `loginUserShema` → `loginUserSchema` (done in Sprint 1 Task 1.3)

---

### Task 4.7 — Remove dead code and debug console.logs

**Action**:
- Search for `console.log` in client source files, remove debug logs
- `server/src/controllers/booking.controller.ts`: check for unused `getBookings` — if not wired to any route, remove
- Remove TODO comments that will be addressed by this refactor

---

### Task 4.8 — Centralize configuration constants

**Create**: `server/src/config/constants.ts`

```typescript
export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 12, MAX_LIMIT: 100 } as const;
export const AUTH = { JWT_EXPIRY: "1h", SALT_ROUNDS: 10 } as const;
export const ROLES = { GUEST: "guest", HOST: "host" } as const;
```

**Update** services to import and use these constants.

---

### Task 4.9 — Consolidate favorite service

**File**: `server/src/services/favorite.service.ts`

The current code already uses `findByIdAndUpdate` with Sets for both add/delete. It's reasonably DRY. Minor improvement:
1. Extract shared validation into a helper function
2. Use `$addToSet` for add and `$pull` for delete (atomic MongoDB operations)

---

### Task 4.10 — Consolidate booking mapping logic

**File**: `server/src/services/booking.service.ts`

**Action**:
1. Extract the duplicated mapping function (lines 58-70 and 79-91) into a shared `mapBookingToResponse` function
2. Use it in both `getBookingsService` and `getMyBookingsService`

---

### Task 4.11 — Fix client-side types

**File**: `client/src/types/` — review all type files for:
- `Number` → `number`
- Inconsistent naming patterns
- Missing fields

---

### Sprint 4 Checkpoint

- [ ] No `any` types remaining (search codebase)
- [ ] All controllers use `next(error)` pattern
- [ ] Consistent response format across endpoints
- [ ] No `console.log` debug statements in production code
- [ ] TypeScript compilation passes with no errors

**Commit**: `refactor: eliminate any types, standardize errors/responses, fix typos, clean dead code`

---

## Sprint 5: Client Improvements

**Branch**: `feature/client-improvements`
**Commit prefix**: `feat(client):` / `perf(client):`
**Installs**: `@tanstack/react-query`, `dompurify`, `@types/dompurify`

### Task 5.1 — Add React Query

**Install**: `cd client && pnpm add @tanstack/react-query`

**Action**:
1. Create `client/src/providers/QueryProvider.tsx` with `QueryClient` (5 min stale time)
2. Wrap app in `main.tsx` with `QueryProvider`
3. Convert `Home.tsx` to use `useQuery` for listings fetch
4. Convert `Listing.tsx` / `ListingClient.tsx` to use `useQuery`
5. Convert other data-fetching pages incrementally

---

### Task 5.2 — Add React.memo to ListingCard

**File**: `client/src/components/Listings/ListingCard.tsx`

**Action**: Wrap export with `memo()`:
```typescript
export default memo(ListingCard);
```

---

### Task 5.3 — Lazy load modals

**File**: `client/src/components/Layout.tsx`

**Action**:
1. Import modals with `lazy()` instead of direct imports
2. Wrap in `Suspense` with `null` fallback
3. Conditionally render based on modal open state (requires reading modal hooks)

---

### Task 5.4 — Cloudinary image optimization

**Create**: `client/src/utils/image.ts` (or update existing `Image.tsx`)

**Action**:
1. Create `optimizedImageUrl(url, width)` function that inserts Cloudinary transforms
2. Use in `ListingCard.tsx` (width 400) and `ListingHead.tsx` (width 800)

---

### Task 5.5 — Parallel API calls on listing page

**File**: `client/src/pages/Listings/ListingClient.tsx` or `Listing.tsx`

**Action**: Use `Promise.all` for listing + reservations fetch (or `useQueries` with React Query).

---

### Task 5.6 — Extract AuthModalBase

**Create**: `client/src/components/Modals/AuthModalBase.tsx`

**Action**:
1. Extract shared form structure, OAuth buttons, and layout from `LoginModal` and `RegisterModal`
2. Refactor both modals to use `AuthModalBase` with different props (fields, submit handler, footer text)

---

### Task 5.7 — Extract ListingGrid component

**Create**: `client/src/components/Listings/ListingGrid.tsx`

**Action**:
1. Extract the repeated grid rendering pattern into a reusable component
2. Update `Home.tsx`, `Favorites.tsx`, `PropertiesPage.tsx`, `TripsPage.tsx`, `Reservations.tsx` to use it

---

### Task 5.8 — Add DOMPurify sanitization

**Install**: `cd client && pnpm add dompurify && pnpm add -D @types/dompurify`

**Create**: `client/src/utils/sanitize.ts`

**Action**: Sanitize user-generated content (listing descriptions) before rendering.

**File**: `client/src/components/Listings/ListingInfo.tsx` — wrap description with `sanitize()`

---

### Task 5.9 — Add client-side Zod validation for rent form

**File**: `client/src/components/Modals/RentModal.tsx`

**Action**: Add bounds validation using Zod or react-hook-form's built-in validation:
- `price`: 1-100000
- `roomCount`, `bathRoomCount`: 1-50
- `guestCount`: 1-100
- `title`: 3-100 chars
- `description`: 10-2000 chars

---

### Task 5.10 — Remove hardcoded backend URL

**File**: `client/src/apis/baseurl.ts`

**Action**: Replace hardcoded `http://localhost:3000/api` with:
```typescript
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
```

Verify all API files use `axiosInstance` (which already reads `VITE_BACKEND_URL`) rather than importing `BASE_URL` directly.

---

### Sprint 5 Checkpoint

- [ ] React Query caching works (check DevTools)
- [ ] Modals lazy load (check network tab)
- [ ] Images use Cloudinary transforms (check URLs)
- [ ] Listing description sanitized (test with `<script>` tags)
- [ ] Rent form validates inputs before submission
- [ ] `pnpm run build` succeeds in client

**Commit**: `feat(client): react-query, lazy modals, image optimization, sanitization, validation`

---

## Sprint 6: Infrastructure & DevOps

**Branch**: `feature/infrastructure`
**Commit prefix**: `chore:`
**Installs**: `compression`, `@types/compression`, `morgan`, `@types/morgan`

### Task 6.1 — Multi-stage Dockerfile

**Create/Replace**: `server/Dockerfile`

**Action**: Create multi-stage build (builder → production) with:
- `node:20-alpine` base
- Non-root user
- Health check
- pnpm support

**Create**: `server/src/routes/health.route.ts` — simple `/health` endpoint
**Update**: `server/src/app.ts` — register health route

---

### Task 6.2 — Create .dockerignore

**Create**: `server/.dockerignore` — exclude node_modules, .env, tests, etc.

---

### Task 6.3 — Fix docker-compose.yml

**File**: `server/docker-compose.yml`

**Action**:
- Pin MongoDB version to `7.0`
- Bind MongoDB port to `127.0.0.1` only
- Move credentials to `.env` file references
- Add resource limits
- Add `restart: unless-stopped`

---

### Task 6.4 — Add environment variable validation

**Create**: `server/src/config/env.ts`

**Action**: Zod schema validating all env vars at startup:
- `PORT`, `DATABASE_URL`, `JWT_SECRET` (required)
- `ALLOWED_ORIGINS` (JSON array)
- OAuth vars (optional)
- `CLIENT_URL` (with default)

**Update**: `server/src/server.ts` — import env config at top

---

### Task 6.5 — Add structured logging

**Install**: `cd server && pnpm add morgan && pnpm add -D @types/morgan`

**File**: `server/src/app.ts`

**Action**: Add `morgan("dev")` in development, `morgan("combined")` in production.

---

### Task 6.6 — Add response compression

**Install**: `cd server && pnpm add compression && pnpm add -D @types/compression`

**File**: `server/src/app.ts`

**Action**: Add `app.use(compression());` before routes.

---

### Task 6.7 — Enhance .gitignore

**File**: Root `.gitignore`

**Action**: Add patterns for `.env.*`, credentials files, IDE folders, OS files.

---

### Task 6.8 — Update Husky and lint-staged

**File**: `.husky/pre-commit` — ensure it runs `npx lint-staged`

**File**: Root `package.json` — update `lint-staged` to include `eslint --fix` for client files.

---

### Task 6.9 — Vite production config

**File**: `client/vite.config.ts`

**Action**:
- Disable sourcemaps in production
- Add manual chunks (vendor, maps, dates)
- Add security headers for dev server

---

### Task 6.10 — Verify ErrorBoundary

**File**: `client/src/main.tsx`

Already has `<ErrorBoundary>` with `react-error-boundary`. Verify it wraps the app correctly. No action needed unless broken.

---

### Task 6.11 — Add API versioning

**File**: `server/src/app.ts`

**Action**:
1. Prefix all routes with `/api/v1/`
2. Keep `/api/` as alias for backward compatibility
3. Update client `VITE_BACKEND_URL` default to include `/api/v1`

---

### Sprint 6 Checkpoint

- [ ] Docker build succeeds: `docker build -t airbnb-server .`
- [ ] `docker-compose up` starts MongoDB + app
- [ ] Health endpoint responds at `/api/health`
- [ ] Environment validation rejects missing `JWT_SECRET`
- [ ] Morgan logs requests in terminal
- [ ] Client builds with manual chunks (check dist output)
- [ ] API versioning works at both `/api/v1/` and `/api/`

**Commit**: `chore: dockerfile, env validation, logging, compression, API versioning`

---

## Final Merge Sequence

```bash
# After all sprints are complete and tested:
git checkout airbnb-v2

git merge --no-ff feature/security-hardening
git merge --no-ff feature/auth-overhaul
git merge --no-ff feature/performance
git merge --no-ff feature/code-quality
git merge --no-ff feature/client-improvements
git merge --no-ff feature/infrastructure

# Clean up
git branch -d feature/security-hardening
git branch -d feature/auth-overhaul
git branch -d feature/performance
git branch -d feature/code-quality
git branch -d feature/client-improvements
git branch -d feature/infrastructure
```

---

## Post-Refactor Verification

- [ ] Full test suite passes: `cd server && pnpm run test`
- [ ] Client builds: `cd client && pnpm run build`
- [ ] Lint passes: `cd client && pnpm run lint`
- [ ] Docker builds: `cd server && docker build .`
- [ ] Manual smoke test: register → login → create listing → book → favorite → delete
- [ ] OAuth smoke test: Google + GitHub flows
- [ ] Delete the `/fixes` directory (all items addressed)

---

**Next step**: Run `/sc:implement sprint 1` to begin execution.
