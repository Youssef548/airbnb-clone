import { axiosInstance } from "../../providers/AxiosInstance";

export const getReviews = (listingId: string, page: number = 1) => {
  return axiosInstance.get(`/reviews/${listingId}?page=${page}&limit=10`);
};

export const createReview = (
  listingId: string,
  data: { rating: number; comment: string }
) => {
  return axiosInstance.post(`/reviews/${listingId}`, data);
};

export const deleteReview = (reviewId: string) => {
  return axiosInstance.delete(`/reviews/${reviewId}`);
};
