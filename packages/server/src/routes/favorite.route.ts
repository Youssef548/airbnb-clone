import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import {
  addFavorite,
  deleteFavorite,
  getFavoriteListings,
} from "../controllers/favorite.controller";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

/**
 * @swagger
 * /favorites/{listingId}:
 *   post:
 *     summary: Add a listing to favorites
 *     tags: [Favorites]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listing added to favorites
 *       401:
 *         description: Authentication required
 *   delete:
 *     summary: Remove a listing from favorites
 *     tags: [Favorites]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listing removed from favorites
 *       401:
 *         description: Authentication required
 *
 * /favorites:
 *   get:
 *     summary: Get current user's favorite listings
 *     tags: [Favorites]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Paginated favorite listings
 *       401:
 *         description: Authentication required
 */
router.post("/:listingId", isAuth, validateObjectId("listingId"), addFavorite);
router.delete(
  "/:listingId",
  isAuth,
  validateObjectId("listingId"),
  deleteFavorite
);
router.get("/", isAuth, getFavoriteListings);
export default router;
