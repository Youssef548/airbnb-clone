# Portfolio Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 portfolio improvements (README/Swagger, reviews/ratings, search filters, code quality, React component tests, accessibility) to make this a strong mid-level MERN portfolio piece.

**Architecture:** Each improvement is independent and can be implemented as a separate commit. Reviews/ratings adds a new vertical slice (model → service → controller → route → API → components). Search filters extends existing listing query pipeline. Tests and a11y are pure additions.

**Tech Stack:** MongoDB/Mongoose, Express, React 18, TypeScript, Tailwind CSS, Vitest, React Testing Library, swagger-jsdoc, swagger-ui-express

---

### Task 1: README & Swagger Documentation

**Files:**

- Create: `README.md` (root — overwrite existing)
- Create: `packages/server/src/config/swagger.ts`
- Modify: `packages/server/src/app.ts`
- Modify: `packages/server/package.json`

- [ ] **Step 1: Install Swagger dependencies**

Run:

```bash
cd packages/server && pnpm add swagger-jsdoc swagger-ui-express && pnpm add -D @types/swagger-jsdoc @types/swagger-ui-express
```

- [ ] **Step 2: Create Swagger config**

Create `packages/server/src/config/swagger.ts`:

```typescript
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb Clone API",
      version: "1.0.0",
      description:
        "Full-stack Airbnb clone REST API built with Express, MongoDB, and TypeScript",
    },
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        Location: {
          type: "object",
          properties: {
            flag: { type: "string" },
            label: { type: "string" },
            latlng: { type: "array", items: { type: "number" } },
            region: { type: "string" },
            value: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            image: { type: "string" },
            role: { type: "string", enum: ["guest", "host"] },
            favoriteListingsIds: { type: "array", items: { type: "string" } },
          },
        },
        Listing: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            imageSrc: { type: "string" },
            category: { type: "string" },
            roomCount: { type: "number" },
            bathRoomCount: { type: "number" },
            guestCount: { type: "number" },
            price: { type: "number" },
            location: { $ref: "#/components/schemas/Location" },
            averageRating: { type: "number" },
            reviewCount: { type: "number" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            totalPrice: { type: "number" },
            guest: { type: "string" },
            listingId: { type: "string" },
            authorId: { type: "string" },
          },
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string" },
            listing: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            comment: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "number" },
            totalPages: { type: "number" },
            totalCount: { type: "number" },
            limit: { type: "number" },
            hasNextPage: { type: "boolean" },
            hasPreviousPage: { type: "boolean" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
```

- [ ] **Step 3: Mount Swagger UI in app.ts**

In `packages/server/src/app.ts`, add after the existing imports:

```typescript
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
```

Add before the routes section (after `app.use(mongoSanitize());`):

```typescript
// API Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

- [ ] **Step 4: Add JSDoc annotations to all route files**

Add Swagger JSDoc comments above each route handler in these files:

`packages/server/src/routes/listing.route.ts` — Add before each route:

```typescript
/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, imageSrc, category, roomCount, bathRoomCount, guestCount, price, location]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               imageSrc: { type: string }
 *               category: { type: string }
 *               roomCount: { type: number }
 *               bathRoomCount: { type: number }
 *               guestCount: { type: number }
 *               price: { type: number }
 *               location: { $ref: '#/components/schemas/Location' }
 *     responses:
 *       201:
 *         description: Listing created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Host role required
 *   get:
 *     summary: Get paginated listings with filters
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 100 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: locationValue
 *         schema: { type: string }
 *       - in: query
 *         name: guestCount
 *         schema: { type: integer }
 *       - in: query
 *         name: roomCount
 *         schema: { type: integer }
 *       - in: query
 *         name: bathRoomCount
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: minPrice
 *         schema: { type: integer }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, price_asc, price_desc, rating] }
 *     responses:
 *       200:
 *         description: Paginated listings
 *
 * /listings/{listingId}:
 *   get:
 *     summary: Get a listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listing details
 *       404:
 *         description: Listing not found
 *   delete:
 *     summary: Delete a listing
 *     tags: [Listings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Listing deleted
 *       403:
 *         description: Not authorized
 */
```

`packages/server/src/routes/authRoutes.ts` — Add annotations for all 11 auth endpoints.

`packages/server/src/routes/booking.route.ts` — Add annotations for POST, GET, DELETE.

`packages/server/src/routes/favorite.route.ts` — Add annotations for POST, DELETE, GET.

`packages/server/src/routes/health.route.ts` — Add annotation for GET /health.

`packages/server/src/routes/review.route.ts` — Add annotations for POST, GET, DELETE (created in Task 2).

Each endpoint annotation must include: summary, tags, security (if auth required), parameters (path/query), requestBody (if applicable), and responses.

- [ ] **Step 5: Write the README**

Create `README.md` at root with:

```markdown
# Airbnb Clone

Full-stack Airbnb clone built with the MERN stack and TypeScript.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)

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
│ ├── shared/ # @airbnb/shared — Types, constants
│ ├── database/ # @airbnb/database — Mongoose models, Zod schemas
│ ├── server/ # @airbnb/server — Express REST API
│ └── client/ # @airbnb/client — React SPA
├── pnpm-workspace.yaml
└── tsconfig.base.json

````

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
````

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

Interactive API docs available at `/api/docs` when the server is running.

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

````

- [ ] **Step 6: Commit**

```bash
git add README.md packages/server/src/config/swagger.ts packages/server/src/app.ts packages/server/package.json packages/server/src/routes/*.ts pnpm-lock.yaml
git commit -m "docs: add README and Swagger API documentation"
````

---

### Task 2: Reviews/Ratings — Database & Shared Types

**Files:**

- Create: `packages/database/src/models/review.model.ts`
- Create: `packages/database/src/schemas/review.schema.ts`
- Modify: `packages/database/src/models/listing.model.ts`
- Modify: `packages/database/src/index.ts`
- Modify: `packages/shared/src/types/listing.ts`
- Modify: `packages/shared/src/types/review.ts` (create)
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Create Review model**

Create `packages/database/src/models/review.model.ts`:

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  listing: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    listing: {
      type: mongoose.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per listing
ReviewSchema.index({ listing: 1, user: 1 }, { unique: true });
// For fetching reviews by listing, newest first
ReviewSchema.index({ listing: 1, createdAt: -1 });

const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);

export { ReviewModel as Review };
```

- [ ] **Step 2: Create Review Zod schema**

Create `packages/database/src/schemas/review.schema.ts`:

```typescript
import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string({
      required_error: "Comment is required",
      invalid_type_error: "Comment must be a string",
    })
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must be at most 1000 characters"),
});
```

- [ ] **Step 3: Add averageRating and reviewCount to Listing model**

In `packages/database/src/models/listing.model.ts`, add to the `IListing` interface:

```typescript
averageRating: number;
reviewCount: number;
```

Add to the `ListingSchema` definition (after `bookings` field):

```typescript
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
```

- [ ] **Step 4: Export Review from database package**

In `packages/database/src/index.ts`, add:

```typescript
export { Review } from "./models/review.model";
export type { IReview } from "./models/review.model";
export { createReviewSchema } from "./schemas/review.schema";
```

- [ ] **Step 5: Add ReviewType to shared package**

Create `packages/shared/src/types/review.ts`:

```typescript
import { UserType } from "./user";

export type ReviewType = {
  _id: string;
  listing: string;
  user: UserType;
  rating: number;
  comment: string;
  createdAt: string;
};
```

- [ ] **Step 6: Update ListingType in shared package**

In `packages/shared/src/types/listing.ts`, add to `ListingType`:

```typescript
  averageRating?: number;
  reviewCount?: number;
```

- [ ] **Step 7: Export ReviewType from shared index**

In `packages/shared/src/index.ts`, add:

```typescript
export * from "./types/review";
```

- [ ] **Step 8: Commit**

```bash
git add packages/database/src/models/review.model.ts packages/database/src/schemas/review.schema.ts packages/database/src/models/listing.model.ts packages/database/src/index.ts packages/shared/src/types/review.ts packages/shared/src/types/listing.ts packages/shared/src/index.ts
git commit -m "feat: add Review model, schema, and shared types"
```

---

### Task 3: Reviews/Ratings — API (Service, Controller, Route)

**Files:**

- Create: `packages/server/src/services/review.service.ts`
- Create: `packages/server/src/controllers/review.controller.ts`
- Create: `packages/server/src/routes/review.route.ts`
- Modify: `packages/server/src/app.ts`

- [ ] **Step 1: Create review service**

Create `packages/server/src/services/review.service.ts`:

```typescript
import { Review, Booking, Listing } from "@airbnb/database";
import { errorHandler } from "../utils/error";
import { PAGINATION } from "../config/constants";

interface CreateReviewData {
  rating: number;
  comment: string;
}

export const createReviewService = async (
  userId: string,
  listingId: string,
  data: CreateReviewData
) => {
  // Verify user has a completed booking for this listing
  const booking = await Booking.findOne({
    guest: userId,
    listingId: listingId,
  });

  if (!booking) {
    throw errorHandler(
      403,
      "You must have a booking for this listing to leave a review"
    );
  }

  // Check if user already reviewed this listing (also enforced by unique index)
  const existingReview = await Review.findOne({
    listing: listingId,
    user: userId,
  });

  if (existingReview) {
    throw errorHandler(400, "You have already reviewed this listing");
  }

  const review = new Review({
    listing: listingId,
    user: userId,
    rating: data.rating,
    comment: data.comment,
  });

  await review.save();

  // Recalculate listing stats
  await recalculateListingStats(listingId);

  return review.populate("user", "username image");
};

export const getReviewsService = async (
  listingId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ listing: listingId })
      .populate("user", "username image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Review.countDocuments({ listing: listingId }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const deleteReviewService = async (userId: string, reviewId: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw errorHandler(404, "Review not found");
  }

  if (review.user.toString() !== userId) {
    throw errorHandler(403, "You can only delete your own reviews");
  }

  const listingId = review.listing.toString();
  await review.deleteOne();

  // Recalculate listing stats
  await recalculateListingStats(listingId);
};

async function recalculateListingStats(listingId: string) {
  const stats = await Review.aggregate([
    {
      $match: {
        listing: new (await import("mongoose")).Types.ObjectId(listingId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.averageRating
    ? Math.round(stats[0].averageRating * 10) / 10
    : 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  await Listing.findByIdAndUpdate(listingId, { averageRating, reviewCount });
}
```

- [ ] **Step 2: Create review controller**

Create `packages/server/src/controllers/review.controller.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  getReviewsService,
  deleteReviewService,
} from "../services/review.service";

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    const review = await createReviewService(
      req.user!.userId!,
      listingId,
      req.body
    );
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

export async function getReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getReviewsService(listingId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewId } = req.params;
    await deleteReviewService(req.user!.userId!, reviewId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
```

- [ ] **Step 3: Create review route**

Create `packages/server/src/routes/review.route.ts`:

```typescript
import { Router } from "express";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/review.controller";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import { createReviewSchema } from "@airbnb/database";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

/**
 * @swagger
 * /reviews/{listingId}:
 *   post:
 *     summary: Create a review for a listing
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string, minLength: 10, maxLength: 1000 }
 *     responses:
 *       201:
 *         description: Review created
 *       403:
 *         description: Must have a booking to review
 *   get:
 *     summary: Get reviews for a listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated reviews
 *
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete own review
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Review deleted
 *       403:
 *         description: Can only delete own reviews
 */
router.post(
  "/:listingId",
  isAuth,
  validateObjectId("listingId"),
  validateSchema(createReviewSchema),
  createReview
);
router.get("/:listingId", validateObjectId("listingId"), getReviews);
router.delete("/:reviewId", isAuth, validateObjectId("reviewId"), deleteReview);

export default router;
```

- [ ] **Step 4: Mount review route in app.ts**

In `packages/server/src/app.ts`, add the import:

```typescript
import reviewRoutes from "./routes/review.route";
```

Add the route mount (before `app.use(errorHandler)`):

```typescript
app.use("/api/reviews/", reviewRoutes);
```

- [ ] **Step 5: Commit**

```bash
git add packages/server/src/services/review.service.ts packages/server/src/controllers/review.controller.ts packages/server/src/routes/review.route.ts packages/server/src/app.ts
git commit -m "feat: add reviews API endpoints (create, list, delete)"
```

---

### Task 4: Reviews/Ratings — Client Components

**Files:**

- Create: `packages/client/src/apis/Reviews/review.ts`
- Create: `packages/client/src/components/StarRating.tsx`
- Create: `packages/client/src/components/Reviews/ReviewCard.tsx`
- Create: `packages/client/src/components/Reviews/ReviewForm.tsx`
- Create: `packages/client/src/components/Reviews/ReviewsSection.tsx`
- Modify: `packages/client/src/components/Listings/ListingCard.tsx`
- Modify: `packages/client/src/pages/Listings/ListingClient.tsx`
- Modify: `packages/client/src/pages/Listings/Listing.tsx`

- [ ] **Step 1: Create reviews API client**

Create `packages/client/src/apis/Reviews/review.ts`:

```typescript
import { axiosInstance } from "../../providers/AxiosInstance";

export const getReviews = (listingId: string, page: number = 1) => {
  return axiosInstance.get(`/reviews/${listingId}?page=${page}&limit=10`);
};

export const createReview = (
  listingId: string,
  data: { rating: number; comment: string }
) => {
  return axiosInstance.post(`/reviews/${listingId}`, data);
};

export const deleteReview = (reviewId: string) => {
  return axiosInstance.delete(`/reviews/${reviewId}`);
};
```

- [ ] **Step 2: Create StarRating component**

Create `packages/client/src/components/StarRating.tsx`:

```tsx
interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  showNumber?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = "sm",
  showNumber = true,
}) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className="flex items-center gap-1">
      <svg
        className={`${sizeClass} text-yellow-500 fill-current`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
      {showNumber && (
        <span className={`${textSize} font-semibold`}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
```

- [ ] **Step 3: Create ReviewCard component**

Create `packages/client/src/components/Reviews/ReviewCard.tsx`:

```tsx
import { ReviewType } from "@airbnb/shared";
import { formatDistanceToNow } from "date-fns";
import StarRating from "../StarRating";
import Avatar from "../Avatar";

interface ReviewCardProps {
  review: ReviewType;
  onDelete?: (reviewId: string) => void;
  isOwn?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onDelete, isOwn }) => {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-neutral-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={review.user.image} />
          <div>
            <div className="font-semibold text-sm">{review.user.username}</div>
            <div className="text-neutral-500 text-xs">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          {isOwn && onDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="text-rose-500 text-sm hover:underline"
              aria-label="Delete review"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="text-neutral-700 text-sm leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
};

export default ReviewCard;
```

- [ ] **Step 4: Create ReviewForm component**

Create `packages/client/src/components/Reviews/ReviewForm.tsx`:

```tsx
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../Buttons";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (comment.length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ rating, comment });
      setRating(0);
      setComment("");
      toast.success("Review submitted!");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to submit review";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Leave a Review</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? "text-yellow-500 fill-current"
                  : "text-gray-300 fill-current"
              } transition-colors`}
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (at least 10 characters)"
        rows={4}
        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
      />
      <div className="flex justify-end">
        <Button
          label={isLoading ? "Submitting..." : "Submit Review"}
          onClick={handleSubmit}
          disabled={isLoading}
          small
        />
      </div>
    </div>
  );
};

export default ReviewForm;
```

- [ ] **Step 5: Create ReviewsSection component**

Create `packages/client/src/components/Reviews/ReviewsSection.tsx`:

```tsx
import { useCallback, useEffect, useState } from "react";
import { ReviewType, UserType } from "@airbnb/shared";
import {
  getReviews,
  createReview,
  deleteReview,
} from "../../apis/Reviews/review";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import StarRating from "../StarRating";

interface ReviewsSectionProps {
  listingId: string;
  currentUser?: UserType | null;
  averageRating?: number;
  reviewCount?: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  listingId,
  currentUser,
  averageRating = 0,
  reviewCount = 0,
}) => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [displayRating, setDisplayRating] = useState(averageRating);
  const [displayCount, setDisplayCount] = useState(reviewCount);

  const fetchReviews = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        const res = await getReviews(listingId, pageNum);
        const { reviews: fetched, pagination } = res.data;
        setReviews((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(pagination.hasNextPage);
      } catch {
        // silently fail — reviews are not critical
      }
    },
    [listingId]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleSubmitReview = async (data: {
    rating: number;
    comment: string;
  }) => {
    await createReview(listingId, data);
    // Refresh reviews from page 1
    setPage(1);
    await fetchReviews(1);
    // Update displayed stats
    setDisplayCount((prev) => prev + 1);
    setDisplayRating((prev) => {
      const total = prev * displayCount + data.rating;
      return Math.round((total / (displayCount + 1)) * 10) / 10;
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      // Refresh stats
      setPage(1);
      await fetchReviews(1);
      setDisplayCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      // handled by axios interceptor
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const hasReviewed = reviews.some((r) => r.user._id === currentUser?._id);

  return (
    <div className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        {displayCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={displayRating} size="md" />
            <span className="text-neutral-500">
              ({displayCount} review{displayCount !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <p className="text-neutral-500 mb-6">No reviews yet.</p>
      )}

      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          isOwn={review.user._id === currentUser?._id}
          onDelete={handleDeleteReview}
        />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 text-rose-500 font-semibold hover:underline"
        >
          Show more reviews
        </button>
      )}

      {currentUser && !hasReviewed && (
        <div className="mt-6">
          <ReviewForm onSubmit={handleSubmitReview} />
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
```

- [ ] **Step 6: Add rating display to ListingCard**

In `packages/client/src/components/Listings/ListingCard.tsx`, import StarRating:

```typescript
import StarRating from "../StarRating";
```

Add rating display after the category/date div (after `<div className="font-light text-neutral-500">`...`</div>`):

```tsx
{
  data.averageRating !== undefined && data.averageRating > 0 && (
    <div className="flex items-center gap-1">
      <StarRating rating={data.averageRating} size="sm" />
      <span className="text-neutral-500 text-sm">({data.reviewCount})</span>
    </div>
  );
}
```

- [ ] **Step 7: Add ReviewsSection to ListingClient**

In `packages/client/src/pages/Listings/ListingClient.tsx`, import ReviewsSection:

```typescript
import ReviewsSection from "../../components/Reviews/ReviewsSection";
```

Add after the closing `</div>` of the grid (after `md:col-span-3">`...`</div>` block, before the final closing `</div>`s):

```tsx
<div className="mt-8">
  <ReviewsSection
    listingId={listing._id}
    currentUser={currentUser}
    averageRating={listing.averageRating}
    reviewCount={listing.reviewCount}
  />
</div>
```

- [ ] **Step 8: Commit**

```bash
git add packages/client/src/apis/Reviews/ packages/client/src/components/StarRating.tsx packages/client/src/components/Reviews/ packages/client/src/components/Listings/ListingCard.tsx packages/client/src/pages/Listings/ListingClient.tsx
git commit -m "feat: add reviews UI — StarRating, ReviewCard, ReviewForm, ReviewsSection"
```

---

### Task 5: Search Filters Enhancement

**Files:**

- Modify: `packages/database/src/schemas/listings.schema.ts`
- Modify: `packages/server/src/services/listing.service.ts`
- Modify: `packages/client/src/components/Modals/SearchModal.tsx`
- Modify: `packages/client/src/pages/Home/Home.tsx`

- [ ] **Step 1: Add minPrice, maxPrice, sortBy to query schema**

In `packages/database/src/schemas/listings.schema.ts`, add to `getListingsQuerySchema`:

```typescript
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  sortBy: z
    .enum(["newest", "price_asc", "price_desc", "rating"])
    .optional()
    .default("newest"),
```

- [ ] **Step 2: Update listing service for price filter and sorting**

In `packages/server/src/services/listing.service.ts`, add price filtering after the `locationValue` match (around line 65):

```typescript
if (queryParams.minPrice)
  match.price = {
    ...(match.price as object),
    $gte: parseInt(queryParams.minPrice as string),
  };
if (queryParams.maxPrice)
  match.price = {
    ...(match.price as object),
    $lte: parseInt(queryParams.maxPrice as string),
  };
```

Replace the hardcoded sort in the `$facet` stage. Change:

```typescript
      listings: [{ $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit }],
```

to:

```typescript
      listings: [{ $sort: getSortStage(queryParams.sortBy as string) }, { $skip: skip }, { $limit: limit }],
```

Add the helper function at the top of the file (after the imports):

```typescript
function getSortStage(sortBy?: string): Record<string, 1 | -1> {
  switch (sortBy) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "rating":
      return { averageRating: -1 };
    case "newest":
    default:
      return { _id: -1 };
  }
}
```

- [ ] **Step 3: Add PRICE step to SearchModal**

In `packages/client/src/components/Modals/SearchModal.tsx`, update the STEPS enum:

```typescript
enum STEPS {
  LOCATION = 0,
  DATE = 1,
  PRICE = 2,
  INFO = 3,
}
```

Add price state:

```typescript
const [minPrice, setMinPrice] = useState("");
const [maxPrice, setMaxPrice] = useState("");
```

Add minPrice/maxPrice to the query params in `onSubmit` (add after `bathRoomCount`):

```typescript
if (minPrice) updatedQuery.minPrice = minPrice;
if (maxPrice) updatedQuery.maxPrice = maxPrice;
```

Add the PriceContent (after DateContent):

```tsx
const PriceContent = useMemo(
  () => (
    <div className="flex flex-col gap-8">
      <Heading title="Price Range" subTitle="Set your budget per night" />
      <div className="flex gap-4">
        <div className="flex-1">
          <label
            htmlFor="minPrice"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Min Price
          </label>
          <input
            id="minPrice"
            type="number"
            min="0"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="maxPrice"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Max Price
          </label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>
    </div>
  ),
  [minPrice, maxPrice]
);
```

Update `stepComponents` to include PRICE:

```typescript
const stepComponents = useMemo(
  () => ({
    [STEPS.LOCATION]: LocationContent,
    [STEPS.DATE]: DateContent,
    [STEPS.PRICE]: PriceContent,
    [STEPS.INFO]: InfoContent,
  }),
  [LocationContent, DateContent, PriceContent, InfoContent]
);
```

- [ ] **Step 4: Add sort dropdown to Home page**

In `packages/client/src/pages/Home/Home.tsx`, add sort state and handler. Add after the `searchParams` destructuring:

```typescript
const currentSort = searchParams.get("sortBy") || "newest";

const handleSortChange = useCallback(
  (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currentQuery = searchParams ? qs.parse(searchParams.toString()) : {};
    setSearchParams({
      ...currentQuery,
      sortBy: e.target.value,
      page: "1",
    } as Record<string, string>);
  },
  [searchParams, setSearchParams]
);
```

Add the sort dropdown in the JSX, before `<ListingGrid>`:

```tsx
<div className="flex justify-end mb-4">
  <select
    value={currentSort}
    onChange={handleSortChange}
    className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
    aria-label="Sort listings"
  >
    <option value="newest">Newest</option>
    <option value="price_asc">Price: Low to High</option>
    <option value="price_desc">Price: High to Low</option>
    <option value="rating">Highest Rated</option>
  </select>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add packages/database/src/schemas/listings.schema.ts packages/server/src/services/listing.service.ts packages/client/src/components/Modals/SearchModal.tsx packages/client/src/pages/Home/Home.tsx
git commit -m "feat: add price range filter and sort options for listings"
```

---

### Task 6: Code Quality Fixes

**Files:**

- Modify: `packages/server/src/config/passport.ts`
- Modify: `packages/server/src/services/booking.service.ts`
- Modify: `packages/client/src/pages/Listings/ListingClient.tsx`
- Modify: `packages/client/src/pages/Home/Home.tsx`
- Modify: `packages/server/src/routes/booking.route.ts`

- [ ] **Step 1: Fix `any` types in passport.ts**

In `packages/server/src/config/passport.ts`:

Line 11 — change `(user: any, done)` to:

```typescript
passport.serializeUser((user: Express.User, done) => {
```

Line 89 — change `async (accessToken: string, refreshToken: string, profile: any, done: any)` to:

```typescript
      async (accessToken: string, refreshToken: string, profile: GitHubStrategy.Profile, done: GitHubStrategy.VerifyCallback) => {
```

Add the import at the top (the type is from `passport-github2` package — use the namespace):

Actually, `passport-github2` types may not export `Profile` cleanly. Use a more practical fix — import `Profile` from passport:

```typescript
import { Profile } from "passport";
```

And use:

```typescript
      async (accessToken: string, refreshToken: string, profile: Profile, done: (err: Error | null, user?: Express.User) => void) => {
```

- [ ] **Step 2: Fix `any` type in booking.service.ts**

In `packages/server/src/services/booking.service.ts`, line 51:

Change:

```typescript
const mapBookingWithListing = (reservation: any) => ({
```

To:

```typescript
interface PopulatedBooking {
  listingId: { _id: string; [key: string]: unknown } | null;
  [key: string]: unknown;
}

const mapBookingWithListing = (reservation: PopulatedBooking) => ({
```

- [ ] **Step 3: Fix typo in ListingClient.tsx**

In `packages/client/src/pages/Listings/ListingClient.tsx`, line 37:

Change `loginMOdal` to `loginModal` everywhere in the file (3 occurrences: declaration on line 37, and usage on line 61).

- [ ] **Step 4: Replace console.error in Home.tsx**

In `packages/client/src/pages/Home/Home.tsx`, line 51:

Change:

```typescript
console.error("Error fetching listings", error);
```

To:

```typescript
toast.error("Failed to load listings. Please try again.");
```

Add `toast` import at the top:

```typescript
import toast from "react-hot-toast";
```

- [ ] **Step 5: Remove dead commented-out admin route**

In `packages/server/src/routes/booking.route.ts`, remove lines 17-18:

```typescript
//TODO: add admin middleware (I didn't create admin role yet)
// router.get("/", isAdmin, isAuth, getBookings);
```

- [ ] **Step 6: Commit**

```bash
git add packages/server/src/config/passport.ts packages/server/src/services/booking.service.ts packages/client/src/pages/Listings/ListingClient.tsx packages/client/src/pages/Home/Home.tsx packages/server/src/routes/booking.route.ts
git commit -m "fix: resolve any types, typo, console.error, and dead code"
```

---

### Task 7: React Component Tests

**Files:**

- Modify: `packages/client/package.json`
- Create: `packages/client/vitest.config.ts`
- Create: `packages/client/src/test/setup.ts`
- Create: `packages/client/src/components/__tests__/ListingCard.test.tsx`
- Create: `packages/client/src/components/__tests__/HeartButton.test.tsx`
- Create: `packages/client/src/components/__tests__/Modal.test.tsx`
- Create: `packages/client/src/store/__tests__/useStore.test.ts`
- Create: `packages/client/src/store/__tests__/listingsStore.test.ts`
- Create: `packages/client/src/hooks/__tests__/useFavorite.test.tsx`

- [ ] **Step 1: Install test dependencies**

Run:

```bash
cd packages/client && pnpm add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Create vitest config**

Create `packages/client/vitest.config.ts`:

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

- [ ] **Step 3: Create test setup file**

Create `packages/client/src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Add test script to client package.json**

In `packages/client/package.json`, add to "scripts":

```json
"test": "vitest"
```

- [ ] **Step 5: Write Modal tests**

Create `packages/client/src/components/__tests__/Modal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Modal from "../Modals/Modal";

describe("Modal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    title: "Test Modal",
    actionLabel: "Submit",
    body: <div>Modal body content</div>,
  };

  it("renders when isOpen is true", () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Test Modal");
    expect(screen.getByText("Modal body content")).toBeInTheDocument();
  });

  it("is hidden when isOpen is false", () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("modal-title")).not.toBeInTheDocument();
  });

  it("renders title and body content", () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Test Modal");
    expect(screen.getByText("Modal body content")).toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    render(<Modal {...defaultProps} error="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls onSubmit when action button is clicked", async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);
    await user.click(screen.getByText("Submit"));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Write useStore tests**

Create `packages/client/src/store/__tests__/useStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset the module so zustand re-initializes
    vi.resetModules();
  });

  it("sets and gets current user", async () => {
    const { default: useUserStore } = await import("../../store/useStore");

    const mockUser = {
      _id: "1",
      username: "testuser",
      email: "test@test.com",
      image: "",
      role: "guest",
    };

    act(() => {
      useUserStore.getState().setUser(mockUser);
    });

    expect(useUserStore.getState().user).toEqual(mockUser);
  });

  it("persists to localStorage", async () => {
    const { default: useUserStore } = await import("../../store/useStore");

    const mockUser = {
      _id: "1",
      username: "testuser",
      email: "test@test.com",
      image: "",
      role: "guest",
    };

    act(() => {
      useUserStore.getState().setUser(mockUser);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "currentUser",
      JSON.stringify(mockUser)
    );
  });

  it("clears user on logout", async () => {
    const { default: useUserStore } = await import("../../store/useStore");

    act(() => {
      useUserStore.getState().setUser({
        _id: "1",
        username: "testuser",
        email: "test@test.com",
        image: "",
        role: "guest",
      });
    });

    act(() => {
      useUserStore.getState().clearUser();
    });

    expect(useUserStore.getState().user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("currentUser");
  });
});
```

- [ ] **Step 7: Write listingsStore tests**

Create `packages/client/src/store/__tests__/listingsStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import ListingStore from "../../store/listingsStore";

describe("listingsStore", () => {
  beforeEach(() => {
    act(() => {
      ListingStore.getState().setListings([]);
      ListingStore.getState().setPagination(null);
      ListingStore.getState().setCurrentPage(1);
    });
  });

  it("sets and gets listings", () => {
    const mockListings = [
      {
        _id: "1",
        title: "Test Listing",
        description: "A test",
        imageSrc: "img.jpg",
        category: "Beach",
        roomCount: 2,
        bathRoomCount: 1,
        guestCount: 4,
        price: 100,
        location: {
          flag: "🇺🇸",
          label: "US",
          latlng: [0, 0],
          region: "NA",
          value: "US",
        },
        user: {
          _id: "u1",
          username: "host",
          email: "host@test.com",
          image: "",
          role: "host",
        },
        reviews: [],
        bookings: [],
        createdAt: "2024-01-01",
      },
    ];

    act(() => {
      ListingStore.getState().setListings(mockListings as any);
    });

    expect(ListingStore.getState().listings).toHaveLength(1);
    expect(ListingStore.getState().listings[0].title).toBe("Test Listing");
  });

  it("handles empty state", () => {
    expect(ListingStore.getState().listings).toHaveLength(0);
    expect(ListingStore.getState().pagination).toBeNull();
  });

  it("sets current page", () => {
    act(() => {
      ListingStore.getState().setCurrentPage(3);
    });

    expect(ListingStore.getState().currentPage).toBe(3);
  });
});
```

- [ ] **Step 8: Run tests to verify they pass**

Run:

```bash
cd packages/client && pnpm test -- --run
```

Expected: All tests pass.

- [ ] **Step 9: Commit**

```bash
git add packages/client/vitest.config.ts packages/client/src/test/ packages/client/src/components/__tests__/ packages/client/src/store/__tests__/ packages/client/package.json pnpm-lock.yaml
git commit -m "test: add Vitest + RTL component and store tests"
```

---

### Task 8: Accessibility Fixes

**Files:**

- Modify: `packages/client/src/components/Modals/Modal.tsx`
- Modify: `packages/client/src/components/HeartButton.tsx`
- Modify: `packages/client/src/components/Listings/ListingCard.tsx`
- Modify: `packages/client/src/components/Listings/ListingHead.tsx`
- Modify: `packages/client/src/components/layouts/Navbar/Navbar.tsx`
- Modify: `packages/client/src/components/Layout.tsx`

- [ ] **Step 1: Add ARIA, Escape key, and focus trap to Modal**

In `packages/client/src/components/Modals/Modal.tsx`:

Add `useRef` to the React import:

```typescript
import { useCallback, useEffect, useState, useRef } from "react";
```

Add Escape key handler and focus trap after the existing `useEffect`:

```typescript
// Escape key handler
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, handleClose]);

// Focus trap
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!isOpen || !modalRef.current) return;

  const modal = modalRef.current;
  const focusableElements = modal.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  firstElement?.focus();

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  modal.addEventListener("keydown", handleTab);
  return () => modal.removeEventListener("keydown", handleTab);
}, [isOpen, showModal]);
```

Add ARIA attributes to the modal container. Change the inner white box div to:

```tsx
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="
              translate
              h-full
              lg:h-auto
              md:h-auto
              border-0
              rounded-lg
              shadow-lg
              relative
              flex
              flex-col
              w-full
              bg-white
              outline-none
              focus:outline-none
            "
            >
```

Change the title div to use `id="modal-title"`:

```tsx
<div
  id="modal-title"
  data-testid="modal-title"
  className="text-lg font-semibold"
>
  {title}
</div>
```

Add `aria-label="Close"` to the close button:

```tsx
                <button
                  className="..."
                  onClick={handleClose}
                  aria-label="Close"
                >
```

- [ ] **Step 2: Add aria-labels to HeartButton**

In `packages/client/src/components/HeartButton.tsx`, add `aria-label` to the click div:

```tsx
    <div
      onClick={toggleFavorite}
      data-testid="heart-button"
      role="button"
      aria-label={hasFavorited ? "Remove from favorites" : "Add to favorites"}
      className="..."
    >
```

- [ ] **Step 3: Fix alt text on images**

In `packages/client/src/components/Listings/ListingCard.tsx`, change the Image alt:

```tsx
            <Image
              alt={data.title}
              ...
            />
```

In `packages/client/src/components/Listings/ListingHead.tsx`, change the img alt:

```tsx
        <img
          alt={title}
          ...
        />
```

- [ ] **Step 4: Add semantic HTML to Navbar**

In `packages/client/src/components/layouts/Navbar/Navbar.tsx`, wrap the outer div with `<nav>`:

```tsx
<nav aria-label="Main navigation" className="w-full bg-white z-10 shadow-sm">
  <div className="py-4 border-b-[1px]">...</div>
  <Categories />
</nav>
```

- [ ] **Step 5: Add `<main>` wrapper in Layout**

In `packages/client/src/components/Layout.tsx`, wrap the Outlet with `<main>`:

```tsx
          <Navbar user={user} />
          <main id="main-content">
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </main>
```

Add skip link as the first element inside the outer div:

```tsx
      <div>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-rose-500 focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Suspense fallback={<Loading />}>
          ...
```

- [ ] **Step 6: Commit**

```bash
git add packages/client/src/components/Modals/Modal.tsx packages/client/src/components/HeartButton.tsx packages/client/src/components/Listings/ListingCard.tsx packages/client/src/components/Listings/ListingHead.tsx packages/client/src/components/layouts/Navbar/Navbar.tsx packages/client/src/components/Layout.tsx
git commit -m "fix: add accessibility improvements — ARIA, keyboard nav, focus trap, skip link"
```

---

## Verification

After all tasks are complete:

- [ ] Run `pnpm --filter @airbnb/client build` — verify TypeScript compiles and Vite builds
- [ ] Run `pnpm --filter @airbnb/server build` — verify no TS errors
- [ ] Run `pnpm --filter @airbnb/client test -- --run` — verify all component tests pass
- [ ] Verify Swagger UI loads at `http://localhost:3000/api/docs`
