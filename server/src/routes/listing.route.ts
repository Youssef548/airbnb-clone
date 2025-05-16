import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
} from "../controllers/listing.controller";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import { createListingSchema } from "../schemas/listings.schema";
import { authorizeRoles } from "../middleware/authorizeRoles";

const router = Router();

router.post("/", isAuth, authorizeRoles("host"), validateSchema(createListingSchema), createListing);
router.get("/", getListings);
router.get("/:listingId", getListingById);
router.delete("/:listingId", isAuth, authorizeRoles("host"), deleteListing);

export default router;
