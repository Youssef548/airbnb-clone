import { axiosInstance } from "../providers/AxiosInstance";

export  function getListing() {
    return axiosInstance.get(`/listings/all`)
}