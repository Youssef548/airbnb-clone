import { axiosInstance } from "../providers/AxiosInstance";
import { FieldValues } from "react-hook-form";


export function loginRequest(data: FieldValues) {
   return axiosInstance.post(`/auth/login`, data)
}
