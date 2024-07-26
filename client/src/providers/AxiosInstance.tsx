import axios, { AxiosInstance } from "axios";
import { handleUnauthorized } from "../utils/handleUnAuthorized";

// Create an Axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      handleUnauthorized();

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken"); // Ensure you have a refresh token stored
      if (refreshToken) {
        try {
          const response = await axios.post("/api/refresh", { refreshToken });
          localStorage.setItem("authToken", response.data.authToken);

          return axiosInstance(originalRequest);
        } catch (err) {
          console.error("Failed to refresh token", err);
          handleUnauthorized();

          // Handle refresh token failure, e.g., redirect to login
        }
      } else {
        handleUnauthorized();
      }
    }
    handleUnauthorized();
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          // Use the same base URL as the axiosInstance
          const response = await axios.post("/refresh", { refreshToken });
          localStorage.setItem("authToken", response.data.authToken);
          // Update the original request with the new token and retry
          return axiosInstance(originalRequest);
        } catch (err) {
          console.error("Failed to refresh token", err);
          handleUnauthorized();

          // Handle refresh token failure, e.g., redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);
