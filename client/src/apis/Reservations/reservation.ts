import { axiosInstance } from "../../providers/AxiosInstance";
import { ReservationPostType } from "./reservations.types";

export function createReservation(data: ReservationPostType) {
  return axiosInstance.post(`/booking/create`, data);
}
