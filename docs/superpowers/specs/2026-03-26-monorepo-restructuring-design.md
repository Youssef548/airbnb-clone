# Monorepo Restructuring Design

**Date:** 2026-03-26
**Status:** Approved

## Overview

Restructure the Airbnb clone from a loose two-directory setup (client/ + server/) into a proper pnpm workspace monorepo with four packages: `shared`, `database`, `server`, and `client`.

## Goals

1. Eliminate duplicated types between frontend and backend
2. Extract the data access layer (models, schemas, seeders) into its own package
3. Create a shared package for types, constants, and utilities
4. Establish clear dependency boundaries between packages
5. Keep pnpm workspaces as the only monorepo tool (no Turborepo, no Nx)

## Target Structure

```
airbnb-clone/
├── packages/
│   ├── client/                  # @airbnb/client - React + Vite frontend
│   │   ├── src/
│   │   │   ├── apis/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── providers/
│   │   │   ├── store/
│   │   │   └── utils/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── server/                  # @airbnb/server - Express backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── config/          # env.ts, passport.ts, constants.ts
│   │   │   ├── types/           # Express augmentation (stays here)
│   │   │   └── utils/           # error.ts, response.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── database/                # @airbnb/database - Data access layer
│   │   ├── src/
│   │   │   ├── models/          # Mongoose models (User, Listing, Booking)
│   │   │   ├── schemas/         # Zod validation schemas
│   │   │   ├── seeders/         # Seed data logic
│   │   │   ├── scripts/         # seed.ts
│   │   │   ├── connection.ts    # MongoDB connection setup
│   │   │   └── index.ts         # Barrel export
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                  # @airbnb/shared - Types, constants, utils
│       ├── src/
│       │   ├── types/           # Unified TypeScript interfaces
│       │   ├── constants/       # Roles, categories, error codes
│       │   ├── utils/           # Shared utility functions
│       │   └── index.ts         # Barrel export
│       ├── package.json
│       └── tsconfig.json
│
├── e2e/                         # Playwright tests (stays at root)
├── pnpm-workspace.yaml
├── package.json                 # Root: husky, prettier, workspace scripts
└── tsconfig.base.json           # Base TS config all packages extend
```

## Dependency Graph

```
shared (zero deps) ← database ← server
shared             ← client
```

- `@airbnb/shared` is a leaf node with zero internal dependencies
- `@airbnb/database` imports types from `@airbnb/shared`
- `@airbnb/server` imports from both `@airbnb/database` and `@airbnb/shared`
- `@airbnb/client` imports from `@airbnb/shared` only (never `@airbnb/database`)

## Package Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

### Inter-package Dependencies

Use the `workspace:*` protocol:

```json
// packages/database/package.json
{ "dependencies": { "@airbnb/shared": "workspace:*" } }

// packages/server/package.json
{ "dependencies": { "@airbnb/database": "workspace:*", "@airbnb/shared": "workspace:*" } }

// packages/client/package.json
{ "dependencies": { "@airbnb/shared": "workspace:*" } }
```

### tsconfig.base.json (new, at root)

Shared TypeScript configuration that all packages extend:
- `strict: true`, `esModuleInterop: true`, `skipLibCheck: true`
- `composite: true`, `declaration: true` for project references
- Each package extends with `"extends": "../../tsconfig.base.json"`

### Build Order

1. `@airbnb/shared` (no deps, build first)
2. `@airbnb/database` (depends on shared)
3. `@airbnb/server` and `@airbnb/client` (can build in parallel)

## Migration: What Moves Where

### Into `@airbnb/shared`

| Source | Destination | Notes |
|--------|-------------|-------|
| `client/src/types/user.ts` | `shared/src/types/user.ts` | Unified with server's IUser interface |
| `client/src/types/Listing.ts` | `shared/src/types/listing.ts` | Unified with server's IListing interface |
| `client/src/types/Reservation.ts` | `shared/src/types/reservation.ts` | Unified with server's IBooking interface |
| `server/src/interfaces/authInterfaces.ts` | `shared/src/types/auth.ts` | JWT payload, auth types |
| Categories (from client) | `shared/src/constants/categories.ts` | Category list used by both sides |
| Role constants | `shared/src/constants/roles.ts` | `'guest' \| 'host'` |
| Common date utils | `shared/src/utils/date.ts` | Any shared date formatting |

### Into `@airbnb/database`

| Source | Destination | Notes |
|--------|-------------|-------|
| `server/src/models/User.model.ts` | `database/src/models/User.model.ts` | Direct move |
| `server/src/models/listing.model.ts` | `database/src/models/listing.model.ts` | Direct move |
| `server/src/models/booking.model.ts` | `database/src/models/booking.model.ts` | Direct move |
| `server/src/schemas/userSchema.ts` | `database/src/schemas/userSchema.ts` | Direct move |
| `server/src/schemas/listings.schema.ts` | `database/src/schemas/listings.schema.ts` | Direct move |
| `server/src/schemas/booking.schema.ts` | `database/src/schemas/booking.schema.ts` | Direct move |
| `server/src/config/database.ts` | `database/src/connection.ts` | DB connection logic |
| `server/src/seeders/*` | `database/src/seeders/*` | Direct move |
| `server/src/scripts/seed.ts` | `database/src/scripts/seed.ts` | Direct move |

### Stays in `@airbnb/server`

- Routes, controllers, services, middleware
- `config/env.ts`, `config/passport.ts`, `config/constants.ts`
- `utils/error.ts`, `utils/response.ts`
- `app.ts`, `server.ts`
- `tests/` directory
- `types/express/index.d.ts` (Express-specific augmentation)

### Stays in `@airbnb/client`

- All components, pages, hooks, stores, providers, utils
- Removes `src/types/` directory (imports from `@airbnb/shared` instead)

## Type Unification

### Strategy

- `@airbnb/shared` defines the "API contract" types (`UserType`, `ListingType`, `ReservationType`)
- `@airbnb/database` Mongoose models use `IUser extends Document` internally, re-exporting the shared types
- Both client and server import the same types from `@airbnb/shared`

### Unified Types

```typescript
// @airbnb/shared/src/types/user.ts
export interface UserType {
  _id: string;
  username: string;
  email: string;
  image?: string;
  role: 'guest' | 'host';
  favoriteListingsIds: string[];
  googleId?: string;
  githubId?: string;
  facebookId?: string;
}

export interface UserJwtPayload {
  userId: string;
  role: 'guest' | 'host';
}
```

### Import Path Changes

**Server before:** `import User from '../models/User.model'`
**Server after:** `import { User } from '@airbnb/database'`

**Client before:** `import { UserType } from '../types/user'`
**Client after:** `import { UserType } from '@airbnb/shared'`

### Barrel Exports

```typescript
// @airbnb/shared/src/index.ts
export * from './types/user';
export * from './types/listing';
export * from './types/reservation';
export * from './constants/categories';
export * from './constants/roles';
export * from './utils/date';

// @airbnb/database/src/index.ts
export { User } from './models/User.model';
export { Listing } from './models/listing.model';
export { Booking } from './models/booking.model';
export * from './schemas/userSchema';
export * from './schemas/listings.schema';
export * from './schemas/booking.schema';
export { connectDatabase } from './connection';
```

## Docker & Dev Workflow

### Docker Changes

- Build contexts update from `./client` → `./packages/client`, `./server` → `./packages/server`
- Volume mounts update similarly
- `@airbnb/database` is a build-time library, no container needed
- MongoDB service unchanged

### Root Scripts

```json
{
  "scripts": {
    "dev": "./dev.sh",
    "dev:client": "pnpm --filter @airbnb/client dev",
    "dev:server": "pnpm --filter @airbnb/server dev",
    "build": "pnpm --filter @airbnb/shared build && pnpm --filter @airbnb/database build && pnpm --filter @airbnb/client build & pnpm --filter @airbnb/server build",
    "test": "pnpm --filter @airbnb/server test",
    "test:e2e": "pnpm --filter e2e test",
    "lint": "pnpm --filter @airbnb/client lint",
    "format": "prettier --write ."
  }
}
```

### E2E Tests

The `e2e/` directory stays at root. Playwright config paths update if they reference `../client` or `../server`.

### Husky / lint-staged

Stays at root, no changes needed. lint-staged runs on staged files regardless of package.

## Build Configuration

### @airbnb/shared

Pure TypeScript package. Compiles with `tsc` to produce `.js` + `.d.ts` files. No bundler needed.

```json
{
  "name": "@airbnb/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

### @airbnb/database

TypeScript package compiled with `tsc`. Produces `.js` + `.d.ts` for consumption by server.

```json
{
  "name": "@airbnb/database",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@airbnb/shared": "workspace:*",
    "mongoose": "^8.4.0",
    "zod": "^3.x",
    "bcryptjs": "^2.4.3"
  }
}
```

### @airbnb/server

Runs with `tsx` in dev mode (same as current). For production, compiled with `tsc` or run directly with `ts-node`. Dependencies include `@airbnb/database` and `@airbnb/shared`.

### @airbnb/client

Vite handles bundling (same as current). Vite resolves `@airbnb/shared` through pnpm's workspace symlinks. No special bundler config needed for workspace packages.

**Note:** In development, `@airbnb/shared` and `@airbnb/database` can be consumed directly from source (TypeScript) by using `tsx` (server) and Vite (client) which both handle TS natively. The `build` script is only needed for production builds.
