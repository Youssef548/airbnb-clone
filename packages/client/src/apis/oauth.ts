import { axiosInstance } from "../providers/AxiosInstance";

const BASEURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

/**
 * Check which OAuth providers are available
 */
export const checkOAuthAvailability = async (): Promise<{
  google: boolean;
  github: boolean;
}> => {
  try {
    const response = await axiosInstance.get(`/auth/oauth/availability`);
    return response.data;
  } catch (error) {
    console.error("Error checking OAuth availability:", error);
    return { google: false, github: false };
  }
};

/**
 * Initiates Google OAuth login by redirecting to backend OAuth endpoint
 */
export const registerWithGoogle = (): void => {
  window.location.href = `${BASEURL}/auth/google`;
};

/**
 * Initiates GitHub OAuth login by redirecting to backend OAuth endpoint
 */
export const registerWithGithub = (): void => {
  window.location.href = `${BASEURL}/auth/github`;
};

/**
 * Initiates Google OAuth login (alias for consistency)
 */
export const loginWithGoogle = (): void => {
  window.location.href = `${BASEURL}/auth/google`;
};

/**
 * Initiates GitHub OAuth login (alias for consistency)
 */
export const loginWithGithub = (): void => {
  window.location.href = `${BASEURL}/auth/github`;
};
