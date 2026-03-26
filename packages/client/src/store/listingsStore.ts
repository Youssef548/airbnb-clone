import create from "zustand";
import { safeListingType } from "@airbnb/shared";
import { Dispatch, SetStateAction } from "react";
import { PaginationData } from "../apis/Listing/listing.types";

export type ListingStoreType = {
  listings: safeListingType[];
  setListings: Dispatch<SetStateAction<safeListingType[]>>;
  pagination: PaginationData | null;
  setPagination: (pagination: PaginationData | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const ListingStore = create<ListingStoreType>((set) => ({
  listings: [],
  setListings: (listings) => {
    set((state) => ({
      listings:
        typeof listings === "function" ? listings(state.listings) : listings,
    }));
  },
  pagination: null,
  setPagination: (pagination) => set({ pagination }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}));

export default ListingStore;
