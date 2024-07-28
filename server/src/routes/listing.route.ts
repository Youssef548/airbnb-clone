import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
} from "../controllers/listing.controller";
import { isAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", isAuth, createListing);
router.get("/all", getListings);
router.get("/get/:listingId", getListingById);
router.delete("/delete/:listingId", isAuth, deleteListing);

export default router;
