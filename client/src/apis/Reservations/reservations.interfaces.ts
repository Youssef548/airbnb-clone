export interface ReservationPostPayload {
    totalPrice: number;
    startDate: string; // Ensuring formatted string (YYYY-MM-DD)
    endDate: string;  // Ensuring formatted string (YYYY-MM-DD)
    listingId: string;
  }