import { axiosInstance } from "../../providers/AxiosInstance";
import { IListingParams } from "./listing.types";
export function getListing(searchParams: IListingParams) {
  return axiosInstance.get(`/listings/all`, {
    params: { ...searchParams },
  });
}

export function getListingById(id: string) {
  return axiosInstance.get(`/listings/get/${id}`);
}

export function deleteListing(id: string) {
  return axiosInstance.delete(`/listings/delete/${id}`);
}
