import { Router } from "express";
import isAuthMiddleWare from "../middlewares/isAuth.js";
import userPlacesController from "../controllers/userPlaces.controller.js";
const router = Router();

router.post("/add", isAuthMiddleWare, userPlacesController.addPlace);
router.put("/add/:id", isAuthMiddleWare, userPlacesController.updatePlace);
router.get("/", isAuthMiddleWare, userPlacesController.getUserPlaces);
router.get("/:id", isAuthMiddleWare, userPlacesController.getUserPlaceByID);

export default router;
