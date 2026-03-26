import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import ListingStore from "../../store/listingsStore";

describe("listingsStore", () => {
  beforeEach(() => {
    act(() => {
      ListingStore.getState().setListings([]);
      ListingStore.getState().setPagination(null);
      ListingStore.getState().setCurrentPage(1);
    });
  });

  it("sets and gets listings", () => {
    const mockListings = [
      {
        _id: "1",
        title: "Test Listing",
        description: "A test",
        imageSrc: "img.jpg",
        category: "Beach",
        roomCount: 2,
        bathRoomCount: 1,
        guestCount: 4,
        price: 100,
        location: {
          flag: "🇺🇸",
          label: "US",
          latlng: [0, 0],
          region: "NA",
          value: "US",
        },
        user: {
          _id: "u1",
          username: "host",
          email: "host@test.com",
          image: "",
          role: "host",
        },
        reviews: [],
        bookings: [],
        createdAt: "2024-01-01",
      },
    ];

    act(() => {
      ListingStore.getState().setListings(mockListings as any);
    });

    expect(ListingStore.getState().listings).toHaveLength(1);
    expect(ListingStore.getState().listings[0].title).toBe("Test Listing");
  });

  it("handles empty state", () => {
    expect(ListingStore.getState().listings).toHaveLength(0);
    expect(ListingStore.getState().pagination).toBeNull();
  });

  it("sets current page", () => {
    act(() => {
      ListingStore.getState().setCurrentPage(3);
    });
    expect(ListingStore.getState().currentPage).toBe(3);
  });
});
