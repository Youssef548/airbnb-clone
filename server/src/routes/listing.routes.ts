import {Router} from "express";
import { createListing } from "../controllers/listing.controller";
import { isAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", isAuth, createListing);


export default router;
