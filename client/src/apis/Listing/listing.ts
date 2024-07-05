import { axiosInstance } from "../../providers/AxiosInstance";
export  function getListing() {
    return axiosInstance.get(`/listings/all`)
}

export function getListingById(id: string) {
    return axiosInstance.get(`/listings/get/${id}`)
}

