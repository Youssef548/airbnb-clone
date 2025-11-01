import bcrypt from "bcryptjs";
import { User } from "../models/User.model";
import { errorHandler } from "../utils/error";

interface UpdateProfileData {
  username?: string;
  email?: string;
  image?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get user profile by ID
 */
export const getUserProfileService = async (userId: string) => {
  const user = await User.findById(userId)
    .select("-password")
    .populate("favoriteListingsIds", "title imageSrc price")
    .populate("listings", "title imageSrc price")
    .populate("bookings", "startDate endDate totalPrice")
    .populate("reviews", "rating comment");

  if (!user) {
    throw errorHandler(404, "User not found");
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
    favoriteListingsIds: user.favoriteListingsIds,
    listings: user.listings,
    bookings: user.bookings,
    reviews: user.reviews,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

/**
 * Update user profile
 */
export const updateUserProfileService = async (
  userId: string,
  data: UpdateProfileData
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw errorHandler(404, "User not found");
  }

  // Check if email is being changed and if it's already in use
  if (data.email && data.email !== user.email) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw errorHandler(400, "Email already in use");
    }
    user.email = data.email;
    // Reset email verification if email changes
    user.emailVerified = undefined;
  }

  // Update username
  if (data.username) {
    user.username = data.username;
  }

  // Update image/avatar
  if (data.image !== undefined) {
    user.image = data.image;
  }

  const updatedUser = await user.save();

  return {
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    image: updatedUser.image,
    role: updatedUser.role,
    emailVerified: updatedUser.emailVerified,
    createdAt: updatedUser.createdAt.toISOString(),
    updatedAt: updatedUser.updatedAt.toISOString(),
  };
};

/**
 * Change user password
 */
export const changePasswordService = async (
  userId: string,
  data: ChangePasswordData
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw errorHandler(404, "User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    data.currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw errorHandler(400, "Current password is incorrect");
  }

  // Check if new password is different from current
  const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
  if (isSamePassword) {
    throw errorHandler(400, "New password must be different from current password");
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  user.password = hashedPassword;

  await user.save();

  return "Password changed successfully";
};

/**
 * Delete user account
 */
export const deleteUserAccountService = async (
  userId: string,
  password: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw errorHandler(404, "User not found");
  }

  // Verify password before deletion
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw errorHandler(400, "Password is incorrect");
  }

  // TODO: In a production app, you might want to:
  // 1. Soft delete instead of hard delete
  // 2. Delete or anonymize user's listings, bookings, reviews
  // 3. Send confirmation email

  await user.deleteOne();

  return "Account deleted successfully";
};

/**
 * Upload avatar (placeholder - will be enhanced with Cloudinary)
 */
export const uploadAvatarService = async (
  userId: string,
  imageUrl: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw errorHandler(404, "User not found");
  }

  // TODO: Integrate with Cloudinary for actual image upload
  // For now, we'll just accept an image URL
  user.image = imageUrl;

  const updatedUser = await user.save();

  return {
    image: updatedUser.image,
    message: "Avatar uploaded successfully",
  };
};

/**
 * Get user statistics (for profile dashboard)
 */
export const getUserStatsService = async (userId: string) => {
  const user = await User.findById(userId)
    .populate("listings")
    .populate("bookings")
    .populate("reviews");

  if (!user) {
    throw errorHandler(404, "User not found");
  }

  return {
    totalListings: user.listings?.length || 0,
    totalBookings: user.bookings?.length || 0,
    totalReviews: user.reviews?.length || 0,
    totalFavorites: user.favoriteListingsIds?.length || 0,
    memberSince: user.createdAt.toISOString(),
  };
};
