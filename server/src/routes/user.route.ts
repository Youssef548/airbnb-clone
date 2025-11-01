import { Router } from "express";
import { isAuth } from "../middleware/auth.middleware";
import validateSchema from "../middleware/validationFactory.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  uploadAvatarSchema,
} from "../schemas/user.schema";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  uploadAvatar,
  getUserStats,
  getPublicUserProfile,
} from "../controllers/user.controller";

const router = Router();

// Authenticated routes
router.get("/profile", isAuth, getUserProfile);
router.patch("/profile", isAuth, validateSchema(updateProfileSchema), updateUserProfile);
router.post("/change-password", isAuth, validateSchema(changePasswordSchema), changePassword);
router.delete("/account", isAuth, validateSchema(deleteAccountSchema), deleteUserAccount);
router.post("/avatar", isAuth, validateSchema(uploadAvatarSchema), uploadAvatar);
router.get("/stats", isAuth, getUserStats);

// Public routes
router.get("/:userId", getPublicUserProfile);

export default router;
