# Monorepo Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Airbnb clone into a proper pnpm workspace monorepo with four packages: `@airbnb/shared`, `@airbnb/database`, `@airbnb/server`, `@airbnb/client`.

**Architecture:** Flat `packages/` directory with pnpm workspaces. Dependency graph: `shared` (leaf) ← `database` ← `server`, `shared` ← `client`. Each package has its own `tsconfig.json` extending a root `tsconfig.base.json`.

**Tech Stack:** pnpm workspaces, TypeScript project references, Mongoose, Zod, Vite, Express, tsx

---

## File Structure

### New files to create:
- `pnpm-workspace.yaml` — workspace definition
- `tsconfig.base.json` — shared TypeScript base config
- `packages/shared/package.json` — shared package manifest
- `packages/shared/tsconfig.json` — shared TS config
- `packages/shared/src/index.ts` — barrel export
- `packages/shared/src/types/user.ts` — unified user types
- `packages/shared/src/types/listing.ts` — unified listing types
- `packages/shared/src/types/reservation.ts` — unified reservation types
- `packages/shared/src/types/auth.ts` — auth interfaces
- `packages/shared/src/types/location.ts` — location value type (extracted from client's CountrySelect)
- `packages/shared/src/constants/roles.ts` — role constants
- `packages/shared/src/constants/categories.ts` — category labels/IDs (no icons — icons are client-only)
- `packages/database/package.json` — database package manifest
- `packages/database/tsconfig.json` — database TS config
- `packages/database/src/index.ts` — barrel export

### Files to move (git mv):
- `client/` → `packages/client/`
- `server/` → `packages/server/`
- `server/src/models/*` → `packages/database/src/models/*`
- `server/src/schemas/*` → `packages/database/src/schemas/*`
- `server/src/config/database.ts` → `packages/database/src/connection.ts`
- `server/src/seeders/*` → `packages/database/src/seeders/*`
- `server/src/scripts/seed.ts` → `packages/database/src/scripts/seed.ts`

### Files to modify:
- `package.json` (root) — add workspace scripts, remove `bcryptjs` from root
- `packages/server/package.json` — add `@airbnb/database` and `@airbnb/shared` deps
- `packages/client/package.json` — add `@airbnb/shared` dep
- `packages/server/src/server.ts` — import `connectDatabase` from `@airbnb/database`
- `packages/server/src/app.ts` — no changes (doesn't import models directly)
- All server services — update model/schema imports to `@airbnb/database`
- All server controllers — update interface imports to `@airbnb/shared`
- All client files importing from `types/` — update to `@airbnb/shared`
- `docker-compose.yml` — update build contexts
- `docker-compose.prod.yml` — update build contexts
- `dev.sh` — update paths
- `e2e/playwright.config.ts` — no changes needed (uses URLs, not file paths)

---

### Task 1: Create workspace infrastructure

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Modify: `package.json` (root)

- [ ] **Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 2: Create tsconfig.base.json at project root**

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Note: We intentionally do NOT use `composite: true` in the base config because the client uses `noEmit: true` (Vite handles bundling), which is incompatible with `composite`. Each package that needs `composite` will enable it in its own tsconfig.

- [ ] **Step 3: Update root package.json**

Replace the entire root `package.json` with:

```json
{
  "private": true,
  "scripts": {
    "prepare": "husky",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "dev": "./dev.sh",
    "dev:client": "pnpm --filter @airbnb/client dev",
    "dev:server": "pnpm --filter @airbnb/server dev",
    "build": "pnpm --filter @airbnb/shared build && pnpm --filter @airbnb/database build && pnpm --filter @airbnb/client build && pnpm --filter @airbnb/server build",
    "test": "pnpm --filter @airbnb/server test",
    "lint": "pnpm --filter @airbnb/client lint",
    "seed": "pnpm --filter @airbnb/database seed"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^16.2.6",
    "prettier": "^3.6.2"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write"
    ],
    "packages/client/**/*.{js,jsx,ts,tsx}": [
      "prettier --write"
    ],
    "packages/server/**/*.{js,ts}": [
      "prettier --write"
    ],
    "**/*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

Key changes: removed `bcryptjs` from root (it belongs in `@airbnb/database`), added workspace scripts, updated lint-staged paths from `client/` to `packages/client/` and `server/` to `packages/server/`.

- [ ] **Step 4: Commit**

```bash
git add pnpm-workspace.yaml tsconfig.base.json package.json
git commit -m "chore: add pnpm workspace infrastructure and base tsconfig"
```

---

### Task 2: Create @airbnb/shared package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types/location.ts`
- Create: `packages/shared/src/types/user.ts`
- Create: `packages/shared/src/types/listing.ts`
- Create: `packages/shared/src/types/reservation.ts`
- Create: `packages/shared/src/types/auth.ts`
- Create: `packages/shared/src/constants/roles.ts`
- Create: `packages/shared/src/constants/categories.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create packages/shared/package.json**

```json
{
  "name": "@airbnb/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
```

Note: `main` and `types` point to source `.ts` files, not compiled output. Both Vite (client) and tsx (server) can consume TypeScript directly. The `build` script compiles for production only.

- [ ] **Step 2: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create packages/shared/src/types/location.ts**

This type is currently embedded in the client's `CountrySelect` component. We extract the pure data shape so both client and server can use it.

```typescript
export interface LocationValue {
  flag: string;
  label: string;
  latlng: number[];
  region: string;
  value: string;
}
```

- [ ] **Step 4: Create packages/shared/src/types/user.ts**

Unified from `client/src/types/user.ts` and `server/src/interfaces/authInterfaces.ts`:

```typescript
export type UserType = {
  _id: string;
  username: string;
  image: string;
  email: string;
  name?: string;
  age?: number;
  favoriteListingsIds?: string[];
  role: string;
};

export interface SanitizedUser {
  id: string;
  email: string;
  username: string;
  image?: string | null;
  favoriteListingsIds?: string[];
  role: string;
}
```

- [ ] **Step 5: Create packages/shared/src/types/listing.ts**

Unified listing types. Note: `CountrySelectValue` from the client is replaced by `LocationValue` from shared.

```typescript
import { LocationValue } from "./location";
import { UserType } from "./user";

export type ListingType = {
  _id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  roomCount: number;
  bathRoomCount: number;
  guestCount: number;
  price: number;
  location: LocationValue;
  user: UserType;
  reviews: string[];
  bookings: string[];
};

export type safeListingType = Omit<ListingType, "createdAt"> & {
  createdAt: string;
};
```

- [ ] **Step 6: Create packages/shared/src/types/reservation.ts**

```typescript
import { ListingType } from "./listing";

export type ReservationType = {
  _id: string;
  listingId: string;
  userId: string;
  checkInDate: Date;
  checkOutDate: Date;
  startDate: Date;
  endDate: Date;
  status: "confirmed" | "pending" | "cancelled";
  totalPrice: number;
};

export type ReservationSafeType = Omit<
  ReservationType,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: ListingType;
};
```

- [ ] **Step 7: Create packages/shared/src/types/auth.ts**

Moved from `server/src/interfaces/authInterfaces.ts`. Only the shared interfaces — Express-specific Request/Response types stay in the server.

```typescript
import { SanitizedUser } from "./user";

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface CreateUserRequestBody {
  email: string;
  password: string;
  username: string;
}

export interface LoginResponse {
  token: string;
  user: SanitizedUser;
}
```

- [ ] **Step 8: Create packages/shared/src/constants/roles.ts**

```typescript
export const ROLES = {
  GUEST: "guest",
  HOST: "host",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
```

- [ ] **Step 9: Create packages/shared/src/constants/categories.ts**

Category data without icons (icons are client-specific `@iconify` imports):

```typescript
export const CATEGORY_LABELS = [
  { id: "1", label: "Homes" },
  { id: "2", label: "Experiences" },
  { id: "3", label: "Drinks" },
  { id: "4", label: "Travel" },
  { id: "5", label: "Music" },
  { id: "7", label: "Sports" },
  { id: "8", label: "Fashion" },
  { id: "9", label: "Books" },
  { id: "10", label: "Wellness" },
] as const;

export type CategoryLabel = (typeof CATEGORY_LABELS)[number]["label"];
```

- [ ] **Step 10: Create packages/shared/src/index.ts**

```typescript
// Types
export * from "./types/location";
export * from "./types/user";
export * from "./types/listing";
export * from "./types/reservation";
export * from "./types/auth";

// Constants
export * from "./constants/roles";
export * from "./constants/categories";
```

- [ ] **Step 11: Verify shared package compiles**

Run: `cd packages/shared && npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 12: Commit**

```bash
git add packages/shared/
git commit -m "feat: create @airbnb/shared package with unified types and constants"
```

---

### Task 3: Create @airbnb/database package

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/tsconfig.json`
- Create: `packages/database/src/index.ts`
- Move: `server/src/models/User.model.ts` → `packages/database/src/models/User.model.ts`
- Move: `server/src/models/listing.model.ts` → `packages/database/src/models/listing.model.ts`
- Move: `server/src/models/booking.model.ts` → `packages/database/src/models/booking.model.ts`
- Move: `server/src/schemas/userSchema.ts` → `packages/database/src/schemas/userSchema.ts`
- Move: `server/src/schemas/listings.schema.ts` → `packages/database/src/schemas/listings.schema.ts`
- Move: `server/src/schemas/booking.schema.ts` → `packages/database/src/schemas/booking.schema.ts`
- Move: `server/src/config/database.ts` → `packages/database/src/connection.ts`
- Move: `server/src/seeders/` → `packages/database/src/seeders/`
- Move: `server/src/scripts/seed.ts` → `packages/database/src/scripts/seed.ts`

- [ ] **Step 1: Create packages/database/package.json**

```json
{
  "name": "@airbnb/database",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "seed": "tsx src/scripts/seed.ts"
  },
  "dependencies": {
    "@airbnb/shared": "workspace:*",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.5",
    "mongoose": "^8.4.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "tsx": "^4.15.6",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Create packages/database/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src"]
}
```

Note: Uses `CommonJS` module to match the server's existing module system.

- [ ] **Step 3: Create directory structure and move model files**

```bash
mkdir -p packages/database/src/models
mkdir -p packages/database/src/schemas
mkdir -p packages/database/src/seeders
mkdir -p packages/database/src/scripts

git mv server/src/models/User.model.ts packages/database/src/models/User.model.ts
git mv server/src/models/listing.model.ts packages/database/src/models/listing.model.ts
git mv server/src/models/booking.model.ts packages/database/src/models/booking.model.ts
```

- [ ] **Step 4: Move schema files**

```bash
git mv server/src/schemas/userSchema.ts packages/database/src/schemas/userSchema.ts
git mv server/src/schemas/listings.schema.ts packages/database/src/schemas/listings.schema.ts
git mv server/src/schemas/booking.schema.ts packages/database/src/schemas/booking.schema.ts
```

- [ ] **Step 5: Move connection, seeders, and seed script**

```bash
git mv server/src/config/database.ts packages/database/src/connection.ts
git mv server/src/seeders/index.ts packages/database/src/seeders/index.ts
git mv server/src/seeders/userSeeder.ts packages/database/src/seeders/userSeeder.ts
git mv server/src/seeders/listingSeeder.ts packages/database/src/seeders/listingSeeder.ts
git mv server/src/scripts/seed.ts packages/database/src/scripts/seed.ts
```

- [ ] **Step 6: Update import paths in moved files**

**packages/database/src/connection.ts** — no changes needed (self-contained, uses `mongoose` and `dotenv`).

**packages/database/src/seeders/userSeeder.ts** — update model import:

Change:
```typescript
import { User } from "../models/User.model";
```
This path still works because models are now at `packages/database/src/models/` and seeders are at `packages/database/src/seeders/`. The relative path `../models/User.model` is still correct. No change needed.

**packages/database/src/seeders/listingSeeder.ts** — same as above, relative paths still work within the package. No change needed.

**packages/database/src/seeders/index.ts** — relative imports to `./userSeeder` and `./listingSeeder` still work. No change needed.

**packages/database/src/scripts/seed.ts** — update import path:

Change:
```typescript
import { seedDatabase } from "../seeders";
```
This relative path still works within the database package. No change needed.

BUT: The seed script imports `dotenv` and `mongoose` directly. It currently does `dotenv.config()` which expects `.env` in CWD. We need to make this work from the database package directory. Update to:

```typescript
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { seedDatabase } from "../seeders";

// Load .env from the server package (where env vars are defined)
dotenv.config({ path: path.resolve(__dirname, "../../../server/.env") });

async function runSeed() {
  try {
    const dbUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/airbnb";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");

    console.log("\nStarting to seed database...");
    await seedDatabase();

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  }
}

runSeed();
```

- [ ] **Step 7: Update listing.model.ts import**

The listing model imports `IBooking` from `./booking.model`. This relative path still works. No change needed.

- [ ] **Step 8: Create packages/database/src/index.ts barrel export**

```typescript
// Models
export { User } from "./models/User.model";
export type { IUser } from "./models/User.model";
export { Listing } from "./models/listing.model";
export type { IListing } from "./models/listing.model";
export { Booking } from "./models/booking.model";
export type { IBooking } from "./models/booking.model";

// Schemas
export { loginUserSchema, registerUserSchema } from "./schemas/userSchema";
export {
  createListingSchema,
  getListingsQuerySchema,
} from "./schemas/listings.schema";
export { createBookSchema, cancelBookSchema } from "./schemas/booking.schema";

// Connection
export { default as connectDatabase } from "./connection";

// Seeders
export { seedDatabase } from "./seeders";
```

- [ ] **Step 9: Commit**

```bash
git add packages/database/ server/src/models/ server/src/schemas/ server/src/config/database.ts server/src/seeders/ server/src/scripts/
git commit -m "feat: create @airbnb/database package with models, schemas, seeders"
```

---

### Task 4: Move client to packages/client

**Files:**
- Move: `client/` → `packages/client/`
- Modify: `packages/client/package.json` — add `@airbnb/shared` dep
- Modify: `packages/client/tsconfig.json` — extend base config
- Delete: `packages/client/src/types/user.ts`
- Delete: `packages/client/src/types/Listing.ts`
- Delete: `packages/client/src/types/Reservation.ts`
- Modify: 18 client files to update type imports
- Modify: `packages/client/src/components/Inputs/CountrySelect.tsx` — export type alias pointing to shared
- Modify: `packages/client/src/components/layouts/Navbar/Categories.tsx` — import labels from shared

- [ ] **Step 1: Move client directory**

```bash
git mv client packages/client
```

- [ ] **Step 2: Update packages/client/package.json**

Add `@airbnb/shared` dependency. Change the `name` field:

```json
{
  "name": "@airbnb/client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@airbnb/shared": "workspace:*",
    "@heroicons/react": "^2.1.3",
    "@iconify/icons-bi": "^1.2.19",
    "@iconify/icons-fa": "^1.2.3",
    "@iconify/icons-mdi": "^1.2.48",
    "@tanstack/react-query": "^5.94.5",
    "@types/react-helmet": "^6.1.11",
    "autoprefixer": "^10.4.19",
    "axios": "^1.6.8",
    "date-fns": "^3.6.0",
    "dompurify": "^3.3.3",
    "leaflet": "^1.9.4",
    "postcss": "^8.4.38",
    "qs": "^6.12.1",
    "react": "^18.2.0",
    "react-date-range": "^2.0.1",
    "react-dom": "^18.2.0",
    "react-error-boundary": "^4.0.13",
    "react-helmet": "^6.1.0",
    "react-helmet-async": "^2.0.4",
    "react-hook-form": "^7.51.2",
    "react-hot-toast": "^2.4.1",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.24.0",
    "react-select": "^5.8.0",
    "react-spinners": "^0.14.1",
    "tailwindcss": "^3.4.1",
    "world-countries": "^5.0.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@iconify/react": "^4.1.1",
    "@iconify/types": "^2.0.0",
    "@types/dompurify": "^3.2.0",
    "@types/leaflet": "^1.9.12",
    "@types/node": "^20.11.30",
    "@types/qs": "^6.14.0",
    "@types/react": "^18.2.66",
    "@types/react-date-range": "^1.4.9",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "react-scripts": "^5.0.1",
    "typescript": "^5.9.3",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 3: Update packages/client/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Key changes: added `"extends": "../../tsconfig.base.json"`, removed `"strict": true` and `"skipLibCheck": true` (inherited from base).

- [ ] **Step 4: Update CountrySelect to use shared LocationValue**

In `packages/client/src/components/Inputs/CountrySelect.tsx`, find the `CountrySelectValue` type definition and add an import + type alias:

Add at the top of the file:
```typescript
import { LocationValue } from "@airbnb/shared";
```

Then find where `CountrySelectValue` is defined (it should be an interface/type in that file) and update it to:
```typescript
export type CountrySelectValue = LocationValue;
```

This keeps backward compatibility — all existing client code that imports `CountrySelectValue` still works, but the actual shape comes from shared.

- [ ] **Step 5: Delete old client type files**

```bash
rm packages/client/src/types/user.ts
rm packages/client/src/types/Listing.ts
rm packages/client/src/types/Reservation.ts
```

If the `types/` directory is now empty, remove it:
```bash
rmdir packages/client/src/types 2>/dev/null || true
```

- [ ] **Step 6: Update all client type imports**

Replace type imports in all 18 files. The pattern is:

**Before** (various relative paths):
```typescript
import { UserType } from "../types/user";
import { ListingType } from "../types/Listing";
import { ReservationType, ReservationSafeType } from "../types/Reservation";
import { safeListingType } from "../types/Listing";
```

**After** (all from shared):
```typescript
import { UserType } from "@airbnb/shared";
import { ListingType } from "@airbnb/shared";
import { ReservationType, ReservationSafeType } from "@airbnb/shared";
import { safeListingType } from "@airbnb/shared";
```

Files to update (all paths relative to `packages/client/src/`):

1. `hooks/useFavorite.tsx` — `UserType`
2. `pages/Trips/TripsPage.tsx` — `ReservationSafeType`
3. `pages/Trips/TripsClient.tsx` — `ReservationSafeType`, `UserType`
4. `pages/Reservations/ReservationsClient.tsx` — `ReservationSafeType`, `UserType`
5. `pages/Listings/ListingClient.tsx` — `ReservationSafeType`, `ListingType`, `UserType`
6. `pages/Reservations/Reservations.tsx` — `ReservationSafeType`
7. `pages/Listings/Listing.tsx` — `ListingType`, `UserType`, `ReservationSafeType`
8. `pages/Favorites/FavoritesClient.tsx` — `safeListingType`, `UserType`
9. `store/useStore.ts` — `UserType`
10. `pages/Home/Home.tsx` — `safeListingType`
11. `pages/Properties/PropertiesClient.tsx` — `UserType`, `safeListingType`
12. `components/HeartButton.tsx` — `UserType`
13. `store/listingsStore.ts` — `safeListingType`
14. `components/Listings/ListingCard.tsx` — `ListingType`, `ReservationSafeType`, `ReservationType`, `UserType`
15. `components/Listings/ListingInfo.tsx` — `UserType`
16. `components/Listings/ListingHead.tsx` — `UserType`
17. `components/layouts/Navbar/Navbar.tsx` — `UserType`
18. `components/layouts/Navbar/UserMenu.tsx` — `UserType`

For each file, find lines matching `from ["']\.\..*types/(user|Listing|Reservation)["']` and replace with `from "@airbnb/shared"`. When multiple types are imported from different type files, consolidate into a single import:

**Before:**
```typescript
import { ListingType } from "../../types/Listing";
import { UserType } from "../../types/user";
import { ReservationSafeType } from "../../types/Reservation";
```

**After:**
```typescript
import { ListingType, UserType, ReservationSafeType } from "@airbnb/shared";
```

- [ ] **Step 7: Verify client TypeScript compiles**

Run: `cd packages/client && npx tsc --noEmit`

Expected: No errors. If there are errors related to `CountrySelectValue` vs `LocationValue`, fix the type compatibility.

- [ ] **Step 8: Commit**

```bash
git add packages/client/ client/
git commit -m "feat: move client to packages/client, import types from @airbnb/shared"
```

---

### Task 5: Move server to packages/server and update imports

**Files:**
- Move: `server/` → `packages/server/`
- Modify: `packages/server/package.json` — add workspace deps, update name
- Modify: `packages/server/tsconfig.json` — extend base config
- Modify: All service files — update model/schema imports to `@airbnb/database`
- Modify: `packages/server/src/server.ts` — import `connectDatabase` from `@airbnb/database`
- Modify: `packages/server/src/controllers/auth.controller.ts` — update model import
- Modify: `packages/server/src/controllers/oauth.controller.ts` — update imports
- Modify: `packages/server/src/services/auth.service.ts` — update imports
- Modify: `packages/server/src/middleware/auth.middleware.ts` — update type import if needed
- Delete: `packages/server/src/interfaces/authInterfaces.ts` (moved to shared)
- Keep: `packages/server/src/config/constants.ts` (has PAGINATION and AUTH constants, server-specific)

- [ ] **Step 1: Move server directory**

```bash
git mv server packages/server
```

Note: The `models/`, `schemas/`, `seeders/`, `scripts/`, and `config/database.ts` directories/files were already moved to `packages/database/` in Task 3. If git complains about missing files, that's expected — those files already live in the database package.

- [ ] **Step 2: Update packages/server/package.json**

```json
{
  "name": "@airbnb/server",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@airbnb/database": "workspace:*",
    "@airbnb/shared": "workspace:*",
    "@types/bcryptjs": "^2.4.6",
    "@types/passport": "^1.0.17",
    "@types/passport-github2": "^1.2.9",
    "@types/passport-google-oauth20": "^2.0.17",
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.20.2",
    "compression": "^1.8.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^8.3.1",
    "helmet": "^8.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.1",
    "passport": "^0.7.0",
    "passport-github2": "^0.1.12",
    "passport-google-oauth20": "^2.0.0",
    "rimraf": "^6.0.1",
    "tsx": "^4.15.6",
    "zod": "^3.23.8"
  },
  "scripts": {
    "start": "ts-node src/app.ts",
    "dev": "tsx --watch ./src/server.ts",
    "build": "echo hello world",
    "test": "tsx tests/globalSetup.ts && vitest; tsx tests/globalTeardown.ts",
    "seed": "pnpm --filter @airbnb/database seed"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/compression": "^1.8.1",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/mongoose": "^5.11.97",
    "@types/morgan": "^1.9.10",
    "@types/node": "^20.12.13",
    "@types/supertest": "^6.0.3",
    "supertest": "^7.0.0",
    "typescript": "^5.4.5",
    "vitest": "^3.0.5",
    "vitest-mock-express": "^2.2.0"
  }
}
```

Key changes: added `@airbnb/database` and `@airbnb/shared` as workspace dependencies. Removed `mongoose` and `zod` (now in database package, but server still imports them — keep `zod` for middleware validation, keep `mongoose` as it's used directly in listing.service.ts). Actually, looking at the code:

- `listing.service.ts` uses `mongoose.Types.ObjectId` and `mongoose.PipelineStage` directly
- `auth.service.ts` uses `bcryptjs` and `jsonwebtoken` directly
- Services use `zod` type inference (`z.infer`)

So `mongoose` and `zod` must stay in server dependencies as well. They are also in `@airbnb/database` but that's fine — pnpm deduplicates.

- [ ] **Step 3: Update packages/server/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "types": ["vitest/globals"]
  },
  "include": ["api/**/*.ts", "src/**/*.ts", "tests/**/*.ts", "tests/setup.ts"],
  "exclude": ["node_modules"]
}
```

Key changes: added `"extends": "../../tsconfig.base.json"`, removed `strict`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames` (all inherited from base).

- [ ] **Step 4: Update server/src/server.ts**

Change the database import:

**Before:**
```typescript
import "./config/env";
import app from "./app";
import connectDB from "./config/database";
```

**After:**
```typescript
import "./config/env";
import app from "./app";
import { connectDatabase } from "@airbnb/database";
```

And update the usage:

**Before:**
```typescript
connectDB().then(() => {
```

**After:**
```typescript
connectDatabase().then(() => {
```

Note: The `connectDatabase` function is the default export from `packages/database/src/connection.ts`, re-exported as a named export from the barrel. The function signature is the same.

- [ ] **Step 5: Update server services — model and schema imports**

**packages/server/src/services/booking.service.ts:**

Change:
```typescript
import { Booking } from "../models/booking.model";
import { Listing } from "../models/listing.model";
```
To:
```typescript
import { Booking, Listing } from "@airbnb/database";
```

**packages/server/src/services/listing.service.ts:**

Change:
```typescript
import { Listing } from "../models/listing.model";
import { Booking } from "../models/booking.model";
import { User } from "../models/User.model";
import { createListingSchema } from "../schemas/listings.schema";
```
To:
```typescript
import { Listing, Booking, User, createListingSchema } from "@airbnb/database";
```

Keep: `import { PAGINATION } from "../config/constants";` (stays in server)
Keep: `import { errorHandler } from "../utils/error";` (stays in server)

**packages/server/src/services/auth.service.ts:**

Change:
```typescript
import { User } from "../models/User.model";
import { LoginResponse, SanitizedUser } from "../interfaces/authInterfaces";
```
To:
```typescript
import { User } from "@airbnb/database";
import { LoginResponse, SanitizedUser } from "@airbnb/shared";
```

Keep: `import { AUTH } from "../config/constants";` (stays in server)

**packages/server/src/services/favorite.service.ts:**

Change:
```typescript
import { Listing } from "../models/listing.model";
import { User } from "../models/User.model";
```
To:
```typescript
import { Listing, User } from "@airbnb/database";
```

Keep: `import { PAGINATION } from "../config/constants";` and `import { errorHandler } from "../utils/error";`

- [ ] **Step 6: Update server controllers**

**packages/server/src/controllers/auth.controller.ts:**

Change:
```typescript
import {
  LoginRequestBody,
  CreateUserRequestBody,
} from "../interfaces/authInterfaces";
import { User as UserModel } from "../models/User.model";
```
To:
```typescript
import { LoginRequestBody, CreateUserRequestBody } from "@airbnb/shared";
import { User as UserModel } from "@airbnb/database";
```

**packages/server/src/controllers/oauth.controller.ts:**

Change:
```typescript
import { IUser } from "../models/User.model";
import { SanitizedUser } from "../interfaces/authInterfaces";
```
To:
```typescript
import { IUser } from "@airbnb/database";
import { SanitizedUser } from "@airbnb/shared";
```

**packages/server/src/controllers/favorite.controller.ts:**

Change:
```typescript
import { PAGINATION } from "../config/constants";
```
This import stays as-is (server-internal constant). No changes needed.

**packages/server/src/controllers/booking.controller.ts:**

No model/schema/interface imports — only imports from services. No changes needed.

**packages/server/src/controllers/listing.controller.ts:**

No model/schema/interface imports — only imports from services. No changes needed.

- [ ] **Step 7: Update server middleware that imports schemas**

Check `packages/server/src/middleware/validationFactory.middleware.ts` — this file imports `zod` but not specific schemas. No changes needed.

Check `packages/server/src/middleware/auth.middleware.ts` — if it imports `UserJwtPayload` from `../types/express/index.d.ts`, that stays in the server. No changes needed.

- [ ] **Step 8: Update server routes that import schemas**

Check all route files for schema imports:

```bash
grep -r "from.*schemas/" packages/server/src/routes/
```

If any route file imports schemas directly (e.g., `import { createListingSchema } from "../schemas/listings.schema"`), update to:
```typescript
import { createListingSchema } from "@airbnb/database";
```

Common pattern in routes:
```typescript
import { validateSchema } from "../middleware/validationFactory.middleware";
import { createListingSchema } from "../schemas/listings.schema";
```

Update the schema import to:
```typescript
import { createListingSchema } from "@airbnb/database";
```

- [ ] **Step 9: Delete moved files that may still have stubs**

Remove `packages/server/src/interfaces/authInterfaces.ts` since all its types are now in `@airbnb/shared`:

```bash
rm packages/server/src/interfaces/authInterfaces.ts
rmdir packages/server/src/interfaces 2>/dev/null || true
```

Also clean up any empty directories left from the model/schema/seeder moves:

```bash
rmdir packages/server/src/models 2>/dev/null || true
rmdir packages/server/src/schemas 2>/dev/null || true
rmdir packages/server/src/seeders 2>/dev/null || true
rmdir packages/server/src/scripts 2>/dev/null || true
```

- [ ] **Step 10: Verify server TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit`

Expected: No errors. If there are import resolution errors for `@airbnb/database` or `@airbnb/shared`, ensure `pnpm install` was run from the root first.

- [ ] **Step 11: Commit**

```bash
git add packages/server/ server/
git commit -m "feat: move server to packages/server, import from @airbnb/database and @airbnb/shared"
```

---

### Task 6: Update Docker, dev.sh, and root configs

**Files:**
- Modify: `docker-compose.yml`
- Modify: `docker-compose.prod.yml`
- Modify: `dev.sh`
- Modify: `CLAUDE.md` — update paths throughout

- [ ] **Step 1: Update docker-compose.yml**

Change build contexts and volume paths:

```yaml
services:
  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-secret}
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongo-data:/data/db

  server:
    build: ./packages/server
    depends_on:
      - mongodb
    restart: unless-stopped
    env_file:
      - ./packages/server/.env
    environment:
      - PORT=3000
      - DATABASE_URL=mongodb://${MONGO_USERNAME:-admin}:${MONGO_PASSWORD:-secret}@mongodb:27017/airbnb?authSource=admin
      - TEST_DATABASE_URL=mongodb://${MONGO_USERNAME:-admin}:${MONGO_PASSWORD:-secret}@mongodb:27017/airbnb-test?authSource=admin
      - JWT_SECRET=${JWT_SECRET:-your_jwt_secret_here}
      - ALLOWED_ORIGINS=["http://localhost:5173"]
      - NODE_ENV=development
      - CLIENT_URL=http://localhost:5173
    ports:
      - "3000:3000"

  client:
    build: ./packages/client
    depends_on:
      - server
    restart: unless-stopped
    environment:
      - VITE_BACKEND_URL=http://localhost:3000/api/
      - VITE_APP_CLODINARY_CLOUD_NAME=test
    ports:
      - "5173:5173"

volumes:
  mongo-data:
```

- [ ] **Step 2: Update docker-compose.prod.yml**

No path changes needed — prod uses pre-built images (`${SERVER_IMAGE}`, `${CLIENT_IMAGE}`), not local build contexts. The only change would be if the Dockerfiles reference workspace packages. Check `client/Dockerfile.prod` — it only copies files from its own directory. No changes needed for prod docker-compose.

However, the prod Dockerfile will need updating later if it needs to access `@airbnb/shared` during build. For now, Vite resolves workspace deps via symlinks which won't exist in Docker. We'll address this by adding a Docker build context that includes the full monorepo. This is a follow-up concern — not blocking for the restructure.

- [ ] **Step 3: Update dev.sh**

```bash
#!/bin/bash

# Start MongoDB with Docker
echo "Starting MongoDB..."
cd packages/server && docker-compose -f ../../docker-compose.yml up -d mongodb && cd ../..

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 5

# Function to cleanup on exit
cleanup() {
  echo "\nStopping servers..."
  kill $SERVER_PID $CLIENT_PID 2>/dev/null
  exit
}

trap cleanup INT TERM

# Start server in background
echo "Starting server on http://localhost:3000..."
pnpm --filter @airbnb/server dev &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Start client in background
echo "Starting client on http://localhost:5173..."
pnpm --filter @airbnb/client dev &
CLIENT_PID=$!

echo ""
echo "================================="
echo "Development servers running:"
echo "   Server: http://localhost:3000"
echo "   Client: http://localhost:5173"
echo "================================="
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
```

Key changes: Uses `pnpm --filter` instead of `cd` into directories. Docker-compose path updated.

- [ ] **Step 4: Update CLAUDE.md paths**

Update all references from `client/` to `packages/client/` and `server/` to `packages/server/` throughout the CLAUDE.md file. Also mention the new `packages/shared/` and `packages/database/` packages.

Key sections to update:
- Quick Start commands
- Architecture section (directory paths)
- Environment Setup (`.env` file locations)
- Key directories lists

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml docker-compose.prod.yml dev.sh CLAUDE.md
git commit -m "chore: update Docker, dev script, and docs for monorepo structure"
```

---

### Task 7: Install dependencies and verify

**Files:** None (validation only)

- [ ] **Step 1: Remove old node_modules and lockfiles**

```bash
rm -rf node_modules client/node_modules server/node_modules
rm -f pnpm-lock.yaml client/pnpm-lock.yaml server/pnpm-lock.yaml
```

Note: Since client and server have been moved to `packages/`, the old lockfiles at `client/` and `server/` should already be gone. But clean up any remnants.

- [ ] **Step 2: Install all dependencies from root**

```bash
pnpm install
```

Expected: pnpm resolves workspace dependencies, creates symlinks for `@airbnb/shared` and `@airbnb/database` in the appropriate `node_modules`.

- [ ] **Step 3: Verify @airbnb/shared compiles**

```bash
cd packages/shared && npx tsc --noEmit && cd ../..
```

Expected: No errors.

- [ ] **Step 4: Verify @airbnb/database compiles**

```bash
cd packages/database && npx tsc --noEmit && cd ../..
```

Expected: No errors.

- [ ] **Step 5: Verify @airbnb/server compiles**

```bash
cd packages/server && npx tsc --noEmit && cd ../..
```

Expected: No errors. If there are errors, they will likely be:
- Missing module `@airbnb/database` — re-run `pnpm install`
- Type mismatches between old `IUser` imports and new barrel exports — fix the specific import

- [ ] **Step 6: Verify @airbnb/client compiles**

```bash
cd packages/client && npx tsc --noEmit && cd ../..
```

Expected: No errors. Common issue: `CountrySelectValue` type mismatch with `LocationValue`. Fix by ensuring the alias is correct.

- [ ] **Step 7: Run server tests**

```bash
pnpm --filter @airbnb/server test
```

Expected: All existing tests pass. If tests import models directly, they may need import path updates too. Check `packages/server/tests/` for model imports and update them to `@airbnb/database`.

- [ ] **Step 8: Start dev servers and smoke test**

```bash
# Terminal 1: Start MongoDB
docker-compose up -d mongodb

# Terminal 2: Start server
pnpm --filter @airbnb/server dev

# Terminal 3: Start client
pnpm --filter @airbnb/client dev
```

Verify:
- Server starts on http://localhost:3000 without errors
- Client starts on http://localhost:5173 without errors
- Homepage loads and displays listings
- Login/register works

- [ ] **Step 9: Commit final state**

```bash
git add -A
git commit -m "chore: install workspace dependencies and verify all packages compile"
```

---

### Task 8: Clean up and final verification

**Files:**
- Remove: any leftover empty directories from moves
- Verify: git status is clean

- [ ] **Step 1: Clean up empty directories**

```bash
# Remove any empty directories left from moves
find . -type d -empty -not -path './.git/*' -not -path './node_modules/*' -delete 2>/dev/null || true
```

- [ ] **Step 2: Verify git status**

```bash
git status
```

Expected: Clean working tree (or only untracked files like `node_modules/`).

- [ ] **Step 3: Run E2E tests (if servers are running)**

```bash
cd e2e && npx playwright test
```

Expected: All 32 tests pass. If any tests reference old paths, update them.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: clean up monorepo restructuring"
```

---

## Summary of commits

1. `chore: add pnpm workspace infrastructure and base tsconfig`
2. `feat: create @airbnb/shared package with unified types and constants`
3. `feat: create @airbnb/database package with models, schemas, seeders`
4. `feat: move client to packages/client, import types from @airbnb/shared`
5. `feat: move server to packages/server, import from @airbnb/database and @airbnb/shared`
6. `chore: update Docker, dev script, and docs for monorepo structure`
7. `chore: install workspace dependencies and verify all packages compile`
8. `chore: clean up monorepo restructuring`
