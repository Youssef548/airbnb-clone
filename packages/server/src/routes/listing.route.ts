import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
} from "../controllers/listing.controller";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema, { validateQuery } from "../middleware/validationFactory.middleware";
import { createListingSchema, getListingsQuerySchema } from "@airbnb/database";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

router.post("/", isAuth, authorizeRoles("host"), validateSchema(createListingSchema), createListing);
router.get("/", validateQuery(getListingsQuerySchema), getListings);
router.get("/:listingId", validateObjectId("listingId"), getListingById);
router.delete("/:listingId", isAuth, authorizeRoles("host"), validateObjectId("listingId"), deleteListing);

export default router;
