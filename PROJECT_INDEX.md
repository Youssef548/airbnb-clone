# Project Index: Airbnb Clone

Generated: 2026-03-22

## 📁 Project Structure

```
airbnb-clone/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── apis/              # API service functions
│       │   ├── auth/          # Auth API (login, register)
│       │   ├── Favorites/     # Favorites API
│       │   ├── Listing/       # Listings API
│       │   └── Reservations/  # Reservations/bookings API
│       ├── components/        # Reusable UI components
│       │   ├── Inputs/        # Form inputs (Calendar, Counter, CountrySelect, ImageUpload)
│       │   ├── Listings/      # Listing display components
│       │   ├── Modals/        # Modal dialogs (Login, Register, Rent, Search)
│       │   └── layouts/       # Layout components (Header, Footer, Navbar, Sidebar)
│       ├── hooks/             # Custom hooks (useFavorite, useLoginModal, etc.)
│       ├── pages/             # Route pages
│       │   ├── Auth/          # OAuth callback/error
│       │   ├── Favorites/     # Favorites page
│       │   ├── Home/          # Home/landing page
│       │   ├── Listings/      # Single listing page
│       │   ├── Properties/    # Host properties management
│       │   ├── Reservations/  # Host reservations view
│       │   └── Trips/         # Guest trips view
│       ├── providers/         # Context providers (Axios, Toaster)
│       ├── store/             # Zustand stores (useStore, listingsStore)
│       ├── types/             # TypeScript type definitions
│       └── utils/             # Auth utilities
├── server/                    # Express + MongoDB backend
│   ├── src/
│   │   ├── config/            # Database & Passport config
│   │   ├── controllers/       # Route handlers (auth, booking, favorite, listing, oauth)
│   │   ├── interfaces/        # TypeScript interfaces
│   │   ├── middleware/        # Auth, roles, validation, error handling
│   │   ├── models/            # Mongoose models (User, Listing, Booking)
│   │   ├── routes/            # Express route definitions
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── scripts/           # Seed script
│   │   ├── seeders/           # Database seeders (user, listing)
│   │   ├── services/          # Business logic layer
│   │   ├── types/             # Express type extensions
│   │   └── utils/             # Error utility
│   └── tests/                 # Vitest test suites
│       ├── auth/
│       ├── booking/
│       ├── favorite/
│       └── listing/
└── fixes/                     # Documented improvement plans
```

## 🚀 Entry Points

- **Server**: `server/src/server.ts` → connects DB, starts Express on port 3000
- **Server App**: `server/src/app.ts` → Express app setup, routes, middleware
- **Client**: `client/src/main.tsx` → React root with ErrorBoundary + Suspense
- **Client App**: `client/src/App.tsx` → Router config with lazy-loaded pages
- **DB Seed**: `server/src/scripts/seed.ts` → `pnpm run seed`

## 📡 API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | - | Register user |
| POST | `/api/auth/login` | - | Login user |
| GET | `/api/auth/google` | - | Google OAuth |
| GET | `/api/auth/github` | - | GitHub OAuth |
| GET | `/api/listings/` | - | List all (paginated) |
| GET | `/api/listings/:id` | - | Get single listing |
| POST | `/api/listings/` | host | Create listing |
| DELETE | `/api/listings/:id` | host | Delete listing |
| POST | `/api/favorites/:id` | user | Toggle favorite |
| GET | `/api/favorites/` | user | Get favorites |
| POST | `/api/booking/` | user | Create booking |
| GET | `/api/booking/` | user | Get user bookings |
| DELETE | `/api/booking/:id` | user | Cancel booking |

## 📦 Core Modules

### Server Services
- `auth.service.ts` — User registration, login, JWT generation
- `listing.service.ts` — CRUD for listings with pagination
- `booking.service.ts` — Booking creation with date conflict validation
- `favorite.service.ts` — Toggle and retrieve favorite listings

### Server Middleware
- `auth.middleware.ts` — JWT verification (`isAuth`)
- `authorizeRoles.ts` — Role-based access (guest/host)
- `validationFactory.middleware.ts` — Zod schema validation
- `error.middleware.ts` — Centralized error handler

### Client State (Zustand)
- `useStore.ts` — User auth state, token management
- `listingsStore.ts` — Listings data and pagination state

### Client Pages (7 routes)
- `/` — Home with category filters + paginated listings
- `/listing/:id` — Listing detail with booking calendar
- `/trips` — Guest's booked trips (protected)
- `/reservations` — Host's incoming reservations (protected)
- `/properties` — Host's listed properties (protected)
- `/favorites` — User's saved favorites (protected)
- `/auth/callback` — OAuth redirect handler

## 🔧 Configuration

| File | Purpose |
|------|---------|
| `server/docker-compose.yml` | MongoDB container |
| `server/vercel.json` | Vercel deployment config |
| `server/tsconfig.json` | Server TypeScript config |
| `client/tsconfig.json` | Client TypeScript config (strict) |
| `client/.env` | `VITE_BACKEND_URL`, `VITE_APP_CLODINARY_CLOUD_NAME` |
| `server/.env` | `PORT`, `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS` |

## 🧪 Test Coverage

- **4 test suites**: auth, booking, favorite, listing
- **Framework**: Vitest + Supertest
- **Run**: `cd server && pnpm run test`

## 🔗 Key Dependencies

### Server
| Package | Purpose |
|---------|---------|
| express ^4.19 | HTTP framework |
| mongoose ^8.4 | MongoDB ODM |
| jsonwebtoken ^9.0 | JWT auth |
| zod ^3.23 | Request validation |
| passport ^0.7 | OAuth (Google, GitHub) |
| bcryptjs ^2.4 | Password hashing |

### Client
| Package | Purpose |
|---------|---------|
| react ^18.2 | UI framework |
| vite ^5.2 | Build tool |
| zustand ^4.5 | State management |
| axios ^1.6 | HTTP client |
| react-router-dom ^6.24 | Routing |
| react-hook-form ^7.51 | Form handling |
| tailwindcss ^3.4 | Styling |
| react-leaflet ^4.2 | Map display |
| react-date-range ^2.0 | Date picker |
| react-select ^5.8 | Country selector |

## 📝 Quick Start

```bash
# 1. Install dependencies
pnpm install
cd client && pnpm install
cd ../server && pnpm install

# 2. Start MongoDB
cd server && docker-compose up mongodb

# 3. Start server (new terminal)
cd server && pnpm run dev        # → localhost:3000

# 4. Start client (new terminal)
cd client && pnpm run dev        # → localhost:5173

# 5. (Optional) Seed database
cd server && pnpm run seed
```

## 📊 File Counts

- **Server source**: 34 files
- **Client source**: 80 files
- **Test files**: 4 suites
- **Total TypeScript/TSX**: ~114 files
