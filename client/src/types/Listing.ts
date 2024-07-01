export type ListingType = {
    _id: string;
    title: string;
    description: string;
    imageSrc: string;
    category: string;
    roomCount: number;
    bathRoomCount: number;
    guestCount: number;
    price: number;
    location: string;
    userId: string; // Assuming userId is represented as a string in client-side code
    reviews: string[]; // Array of review IDs represented as strings
    bookings: string[]; 
}