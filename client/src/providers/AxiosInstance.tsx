import axios, { AxiosInstance, AxiosError } from "axios";
import { handleUnauthorized } from "../utils/handleUnAuthorized";

// Create an Axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
});

// Add auth token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors and refresh tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        handleUnauthorized(); // No refresh token → force logout
        return Promise.reject(error);
      }

      try {
        // Use axiosInstance to ensure baseURL is included
        const response = await axiosInstance.post("/api/refresh", { refreshToken });
        localStorage.setItem("authToken", response.data.authToken);

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.authToken}`;
        
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Failed to refresh token", err);
        handleUnauthorized(); // Refresh failed → force logout
      }
    }

    return Promise.reject(error);
  }
);
