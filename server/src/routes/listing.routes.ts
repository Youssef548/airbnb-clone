import { Router } from "express";
import {
  createListing,
  getListingById,
  getListings,
} from "../controllers/listing.controller";
import { isAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", isAuth, createListing);
router.get("/all", getListings);
router.get("/get/:listingId", isAuth, getListingById);

export default router;
