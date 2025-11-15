import { axiosInstance } from "../../providers/AxiosInstance";
import { ReservationPostPayload } from "./reservations.interfaces";
import { ReservationPostType, ReservationsGetType } from "./reservations.types";

export function createReservation(data: ReservationPostType) {
  const { startDate, endDate, ...rest } = data;

  const requestData: ReservationPostPayload = {
    ...rest,
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };

  return axiosInstance.post<ReservationPostPayload>("/booking", requestData);
}


export function getReservation(params: ReservationsGetType) {
  return axiosInstance.get(`/booking`, {
    params: { ...params },
  });
}

export function deleteReservation(id: string) {
  return axiosInstance.delete(`/booking/${id}`);
}
