import { axiosInstance } from "../providers/AxiosInstance";

export  function getUserDataRequest() {
    return axiosInstance.get("/auth/get-user");
} 