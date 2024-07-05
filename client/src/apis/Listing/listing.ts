import { axiosInstance } from "../../providers/AxiosInstance";
import { ReservationPostType } from "./listing.types";
export  function getListing() {
    return axiosInstance.get(`/listings/all`)
}

export function getListingById(id: string) {
    return axiosInstance.get(`/listings/get/${id}`)
}

export function createReservation(data: ReservationPostType) {
    return axiosInstance.post(`/reservation/${data.listingId}`, data);
}