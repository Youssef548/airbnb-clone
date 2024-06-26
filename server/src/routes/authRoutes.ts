// routes/authRoutes.js
import express from "express";
import { loginUser, createUser } from "../controllers/auth.controller";
import validateSchema from "../middleware/validationFactory.middleware";
import { loginUserShema, registerUserSchema } from "../schemas/userSchema";

const router = express.Router();

router.post("/login", validateSchema(loginUserShema), loginUser);
router.post("/register",validateSchema(registerUserSchema), createUser);

export default router
