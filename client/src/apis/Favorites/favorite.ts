import { axiosInstance } from "../../providers/AxiosInstance";

export function addFavorite(listingId: string) {
  return axiosInstance.post(`/favorites/${listingId}`);
}
export function deleteFavorite(listingId: string) {
  return axiosInstance.delete(`/favorites/${listingId}`);
}
