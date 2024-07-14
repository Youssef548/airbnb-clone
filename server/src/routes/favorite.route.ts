import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import {
  addFavorite,
  deleteFavorite,
  getFavoriteListings,
} from "../controllers/favorite.controller";
const router = Router();

router.post("/:listingId", isAuth, addFavorite);
router.delete("/:listingId", isAuth, deleteFavorite);
router.get("/", isAuth, getFavoriteListings);
export default router;
