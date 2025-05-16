// routes/authRoutes.js
import express from "express";
import { loginUser, createUser , getMe } from "../controllers/auth.controller";
import validateSchema from "../middleware/validationFactory.middleware";
import { loginUserShema, registerUserSchema } from "../schemas/userSchema";
import { isAuth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/login", validateSchema(loginUserShema), loginUser);
router.post("/register",validateSchema(registerUserSchema), createUser);
router.get("/me" , isAuth, getMe);
export default router
