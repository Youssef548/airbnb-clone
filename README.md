# Airbnb Clone

Full-stack Airbnb clone built with the MERN stack and TypeScript.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)
![Playwright](https://img.shields.io/badge/Playwright-E2E-green?logo=playwright)
![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?logo=pnpm)

## Features

- **Authentication** — JWT + Google/GitHub OAuth
- **Listings** — Create, browse, search, and filter property listings
- **Booking System** — Date-based reservations with conflict detection
- **Favorites** — Save and manage favorite listings
- **Reviews & Ratings** — Rate and review properties you've stayed at
- **Search Filters** — Filter by location, dates, guests, price range, and sort results
- **Categories** — Browse listings by category (Beach, Mountain, Pool, etc.)
- **Role-Based Access** — Guest and Host roles with different permissions
- **Image Upload** — Cloudinary integration for listing photos
- **Interactive Maps** — Leaflet maps for location display

## Screenshots

<!-- Add your screenshots here -->

![Home Page](docs/screenshots/home.png)
![Listing Detail](docs/screenshots/listing.png)
![Search Filters](docs/screenshots/search.png)

## Architecture

```
airbnb-clone/
├── packages/
│   ├── shared/      # @airbnb/shared — Types, constants
│   ├── database/    # @airbnb/database — Mongoose models, Zod schemas
│   ├── server/      # @airbnb/server — Express REST API
│   └── client/      # @airbnb/client — React SPA
├── e2e/             # Playwright E2E tests
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**Dependency graph:** `shared` ← `database` ← `server`, `shared` ← `client`

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for MongoDB)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd airbnb-clone
pnpm install

# Start MongoDB
docker-compose up mongodb -d

# Copy environment files
cp packages/client/.env.example packages/client/.env
cp packages/server/.env.example packages/server/.env
# Edit .env files with your values

# Start dev servers
pnpm dev:client   # http://localhost:5173
pnpm dev:server   # http://localhost:3000
```

## Packages

| Package            | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `@airbnb/shared`   | Shared TypeScript types and constants                       |
| `@airbnb/database` | Mongoose models, Zod validation schemas, DB connection      |
| `@airbnb/server`   | Express REST API with JWT auth, OAuth, rate limiting        |
| `@airbnb/client`   | React SPA with Vite, Tailwind CSS, Zustand state management |

## Environment Variables

### Client (`packages/client/.env`)

| Variable                        | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `VITE_BACKEND_URL`              | Backend API URL (e.g., `http://localhost:3000/api`) |
| `VITE_APP_CLODINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads             |

### Server (`packages/server/.env`)

| Variable               | Description                           |
| ---------------------- | ------------------------------------- |
| `PORT`                 | Server port (default: 3000)           |
| `DATABASE_URL`         | MongoDB connection string             |
| `JWT_SECRET`           | Secret for JWT token signing          |
| `ALLOWED_ORIGINS`      | JSON array of allowed CORS origins    |
| `NODE_ENV`             | Environment (development/production)  |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID (optional)     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID (optional)     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret (optional) |

## API Documentation

Interactive Swagger API docs available at `/api/docs` when the server is running.

**Documented endpoints:**

- Auth (11) — Login, register, OAuth, session management
- Listings (4) — CRUD with search filters and pagination
- Bookings (3) — Create, list, cancel reservations
- Favorites (3) — Add, remove, list favorites
- Reviews (3) — Create, list, delete reviews
- Health (1) — Server health check

## Testing

```bash
# Server unit tests
pnpm --filter @airbnb/server test

# Client component tests
pnpm --filter @airbnb/client test

# E2E tests (Playwright)
cd e2e && npx playwright test
```

## License

MIT
