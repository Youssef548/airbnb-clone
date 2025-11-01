import { Request, Response, NextFunction } from "express";
import {
  getUserProfileService,
  updateUserProfileService,
  changePasswordService,
  deleteUserAccountService,
  uploadAvatarService,
  getUserStatsService,
} from "../services/user.service";

interface CustomRequest extends Request {
  user: { userId: string };
}

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function getUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const profile = await getUserProfileService(cusReq.user.userId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               image:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input or email already in use
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function updateUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const updatedProfile = await updateUserProfileService(
      cusReq.user.userId,
      req.body
    );
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or weak new password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const message = await changePasswordService(cusReq.user.userId, req.body);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function deleteUserAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const message = await deleteUserAccountService(
      cusReq.user.userId,
      req.body.password
    );
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid image URL
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const result = await uploadAvatarService(
      cusReq.user.userId,
      req.body.imageUrl
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function getUserStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cusReq = req as CustomRequest;
    const stats = await getUserStatsService(cusReq.user.userId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get public user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public user profile
 *       404:
 *         description: User not found
 */
export async function getPublicUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await getUserProfileService(req.params.userId);

    // Return only public information
    const publicProfile = {
      _id: profile._id,
      username: profile.username,
      image: profile.image,
      role: profile.role,
      createdAt: profile.createdAt,
    };

    res.status(200).json(publicProfile);
  } catch (error) {
    next(error);
  }
}
