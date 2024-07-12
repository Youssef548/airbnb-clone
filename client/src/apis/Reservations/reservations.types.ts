export type ReservationPostType = {
  totalPrice: number;
  startDate: Date;
  endDate: Date;
  listingId: string;
};

export type ReservationsGetType = {
  listingId?: string;
  userId?: string;
  authorId?: string;
};
