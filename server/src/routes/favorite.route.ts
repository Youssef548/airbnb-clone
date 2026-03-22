import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import {
  addFavorite,
  deleteFavorite,
  getFavoriteListings,
} from "../controllers/favorite.controller";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

router.post("/:listingId", isAuth, validateObjectId("listingId"), addFavorite);
router.delete("/:listingId", isAuth, validateObjectId("listingId"), deleteFavorite);
router.get("/", isAuth, getFavoriteListings);
export default router;
