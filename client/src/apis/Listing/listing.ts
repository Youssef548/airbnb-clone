import { axiosInstance } from "../../providers/AxiosInstance";
import { IListingParams } from "./listing.types";
export function getListing(searchParams: IListingParams) {
  return axiosInstance.get(`/listings`, {
    params: { ...searchParams },
  });
}

export function getListingById(id: string) {
  return axiosInstance.get(`/listings/${id}`);
}

export function deleteListing(id: string) {
  return axiosInstance.delete(`/listings/${id}`);
}
