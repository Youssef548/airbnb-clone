export type ReservationType = {
    listingId: string; // Assuming listingId is represented as a string
    userId: string; // Assuming userId is represented as a string
    checkInDate: Date;
    checkOutDate: Date;
    status: 'confirmed' | 'pending' | 'cancelled';
    totalPrice: Number; 
}