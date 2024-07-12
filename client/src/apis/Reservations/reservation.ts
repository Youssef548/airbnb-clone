import { axiosInstance } from "../../providers/AxiosInstance";
import { ReservationPostType, ReservationsGetType } from "./reservations.types";

export function createReservation(data: ReservationPostType) {
  return axiosInstance.post(`/booking/create`, data);
}

export function getReservation(params: ReservationsGetType) {
  return axiosInstance.get(`/booking/bookings`, {
    params: { ...params },
  });
}
