import { axiosInstance } from "../../providers/AxiosInstance";
import { LoginBodyType, RequestBodyType } from "./auth.types";

export const loginRequest = (data: LoginBodyType) => {
    return axiosInstance.post(`/auth/login`, data);
}

export const registerRequest = (data: RequestBodyType) => {
    return axiosInstance.post(`/auth/register`, data);
}