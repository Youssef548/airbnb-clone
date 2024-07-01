import {Router} from "express";
import { createListing, getListings } from "../controllers/listing.controller";
import { isAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", isAuth, createListing);
router.get("/all",  getListings);


export default router;
