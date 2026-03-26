import axios, { AxiosInstance, AxiosError } from "axios";
import { handleUnauthorized } from "../utils/handleUnAuthorized";

// Create an Axios instance with credentials (cookies sent automatically)
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
  withCredentials: true,
});

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  }
);
