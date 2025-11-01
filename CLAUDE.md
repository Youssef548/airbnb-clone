# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Airbnb clone with TypeScript throughout. Monorepo structure with separate `client/` (React + Vite) and `server/` (Express + MongoDB) directories.

## Development Commands

**Package Manager:** This project uses **pnpm** instead of npm.

### Client (React + Vite)
```bash
cd client
pnpm install
pnpm run dev      # Development server on http://localhost:5173
pnpm run build    # TypeScript check + production build
pnpm run lint     # ESLint on TS/TSX files
pnpm run preview  # Preview production build
```

### Server (Express + MongoDB)
```bash
cd server
pnpm install
pnpm run dev      # Development with watch mode (tsx)
pnpm run test     # Run Vitest tests
pnpm start        # Production server (ts-node)

# Docker
docker-compose up    # Start MongoDB + app services
```

### Environment Setup
Both client and server have `.env.example` files. Copy to `.env` and configure:
- **Client**: `VITE_BACKEND_URL`, `VITE_APP_CLODINARY_CLOUD_NAME`
- **Server**: `PORT`, `DATABASE_URL`, `TEST_DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `NODE_ENV`

## Architecture

### Backend: Layered MVC Pattern
```
Routes → Controllers → Services → Models → Database
         ↓
    Middleware (Auth, Validation, Error Handling)
```

**Key directories:**
- `server/src/routes/` - API endpoints
- `server/src/controllers/` - HTTP request/response handlers
- `server/src/services/` - Business logic layer
- `server/src/models/` - Mongoose schemas
- `server/src/middleware/` - Auth, validation, error handling
- `server/src/schemas/` - Zod validation schemas

**Middleware chain order:**
1. `isAuth` - JWT verification (extracts `req.user` from Bearer token)
2. `authorizeRoles(role)` - Role-based access control (guest/host)
3. `validateSchema(schema)` - Zod schema validation on `req.body`
4. Controller function
5. `errorMiddleware` - Centralized error handling (registered in app setup)

### Frontend: Component-Based React
- **State Management**: Zustand stores (`store/useStore.ts`, `store/listingsStore.ts`)
- **Custom Hooks**: Modal hooks (`useLoginModal`, `useRegisterModal`, `useRentModal`, `useSearchModal`) and `useFavorite`
- **Routing**: React Router v6 with protected routes
- **HTTP Client**: Axios with base URL from `VITE_BACKEND_URL`

**Key directories:**
- `client/src/pages/` - Route-based pages
- `client/src/components/` - Reusable UI components
- `client/src/apis/` - API service functions
- `client/src/hooks/` - Custom React hooks
- `client/src/store/` - Zustand state management

## Database Schema (MongoDB + Mongoose)

### User Model
```typescript
{
  username: string
  email: string (unique)
  password: string (hashed with bcryptjs)
  role: 'guest' | 'host' (default: 'guest')
  favoriteListingsIds: ObjectId[] → Listing
  listings: ObjectId[] → Listing
  bookings: ObjectId[] → Booking
  // ... OAuth fields (googleId, githubId, facebookId)
}
```

### Listing Model
```typescript
{
  title: string
  description: string
  imageSrc: string
  category: string
  roomCount: number
  bathRoomCount: number
  guestCount: number
  price: number
  location: { flag, label, latlng, region, value }
  user: ObjectId → User (required)
  bookings: ObjectId[] → Booking
}
```

### Booking Model
```typescript
{
  startDate: Date (required)
  endDate: Date (required)
  guest: ObjectId → User (required)
  listingId: ObjectId → Listing (required)
  authorId: ObjectId → User (listing owner, required)
  totalPrice: number (required)
}
```

**Relationships:**
- User (1) → (many) Listing (as host)
- User (1) → (many) Booking (as guest)
- Listing (1) → (many) Booking
- User ↔ Listing (many-to-many favorites via `favoriteListingsIds`)

## Authentication & Authorization

**JWT-based authentication:**
- Login/register returns JWT token
- Client stores token and sends in `Authorization: Bearer <token>` header
- Server middleware `isAuth` verifies JWT and attaches `req.user` with `{ userId, role }`

**Role-based authorization:**
- Users have `role: 'guest' | 'host'` (default: 'guest')
- `authorizeRoles("host")` middleware restricts routes to hosts only
- Create listing requires host role

**Typical protected route pattern:**
```typescript
router.post("/",
  isAuth,                              // Verify JWT
  authorizeRoles("host"),              // Check role
  validateSchema(createListingSchema), // Validate request body
  createListing                        // Controller
);
```

## TypeScript Configuration

**Backend:**
- Custom type extensions for Express `req.user` should be in `types/express.ts` (may need creation)
- Import `UserJwtPayload` type for type-safe JWT payloads
- Vitest globals enabled for testing

**Frontend:**
- Vite handles TypeScript compilation (no emit in tsconfig)
- Strict mode enabled on both client and server

## Key Patterns & Conventions

### Backend Request Validation
All routes use Zod schemas (in `server/src/schemas/`) with `validateSchema()` middleware. Validation errors return 400 with Zod's error message.

### Error Handling
- Use `errorHandler(statusCode, message)` utility from `server/src/utils/error.ts`
- Pass errors to `next(error)` for centralized error middleware
- Error middleware registered after all routes

### Testing (Vitest)
- Tests in `server/tests/`
- Setup file: `server/tests/setup.ts`
- Global setup/teardown for test database
- Run with `pnpm run test` in server directory

### API Response Format
Controllers return JSON responses. Common patterns:
- Success: `{ data: {...}, message?: "..." }`
- Error: `{ message: "error description" }`

### Frontend Data Fetching
API calls in `client/src/apis/` return promises. Handle errors with try-catch and toast notifications (react-hot-toast).

## Important Notes

- **Package Manager**: This project uses **pnpm**. The `.npmrc` file configures build script behavior.
- **Password Hashing**: Uses `bcryptjs` (pure JavaScript implementation) instead of native `bcrypt` to avoid native compilation dependencies.
- **Host role required**: Creating and deleting listings requires `role: 'host'`. Default user role is 'guest'.
- **Date validation**: Bookings include date conflict checking. Overlapping dates rejected by service layer.
- **Image uploads**: Cloudinary integration for listing images (client-side upload, URL stored in DB).
- **Map integration**: React Leaflet used for location display. Location data includes coordinates and country info.
- **TypeScript Version**: Client uses TypeScript 5.9.3 (upgraded from 4.9.5 for compatibility with newer dependencies).

## Current Git Branch
Main development branch: `airbnb-v2`
