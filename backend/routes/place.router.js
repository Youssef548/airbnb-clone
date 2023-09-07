import { Router } from "express";
import placesController from "../controllers/places.controller.js";
const router = Router();

router.get("/", placesController.index);
router.get("/:id", placesController.placeById)

export default router;
