import { axiosInstance } from "../../providers/AxiosInstance";
import { LoginBodyType, RequestBodyType } from "./auth.types";

export const loginRequest = (data: LoginBodyType) => {
  return axiosInstance.post(`/auth/login`, data);
};

export const registerRequest = (data: RequestBodyType) => {
  return axiosInstance.post(`/auth/register`, data);
};

export const checkAuth = () => {
  return axiosInstance.get(`/auth/me`);
};

export const logoutRequest = () => {
  return axiosInstance.post(`/auth/logout`);
};

export const exchangeOAuthCode = (code: string) => {
  return axiosInstance.post(`/auth/oauth/exchange`, { code });
};
