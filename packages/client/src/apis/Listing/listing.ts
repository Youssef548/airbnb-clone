import { axiosInstance } from "../../providers/AxiosInstance";
import { IListingParams, ListingRequestBody } from "./listing.types";

export function createListing(data: ListingRequestBody) { 
  return axiosInstance.post(`/listings`, data);
}

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
