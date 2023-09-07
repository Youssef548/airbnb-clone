import { Router } from "express";
import userController from "../controllers/user.controller.js";
const router = Router();

router.post("/register", userController.createUser);
router.post("/login", userController.signUser);
router.post("/logout", userController.logoutUser);

export default router;
