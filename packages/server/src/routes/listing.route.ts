import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
} from "../controllers/listing.controller";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema, {
  validateQuery,
} from "../middleware/validationFactory.middleware";
import { createListingSchema, getListingsQuerySchema } from "@airbnb/database";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

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
 *         description: Paginated listings with pagination metadata
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
 *         description: Listing details with populated user
 *       404:
 *         description: Listing not found
 *   delete:
 *     summary: Delete a listing (host only, must be owner)
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
 *         description: Not authorized to delete this listing
 */
router.post(
  "/",
  isAuth,
  authorizeRoles("host"),
  validateSchema(createListingSchema),
  createListing
);
router.get("/", validateQuery(getListingsQuerySchema), getListings);
router.get("/:listingId", validateObjectId("listingId"), getListingById);
router.delete(
  "/:listingId",
  isAuth,
  authorizeRoles("host"),
  validateObjectId("listingId"),
  deleteListing
);

export default router;
