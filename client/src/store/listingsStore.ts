import create from "zustand";
import { safeListingType } from "../types/Listing";
import { Dispatch, SetStateAction } from "react";

export type ListingStoreType = {
  listings: safeListingType[];
  setListings: Dispatch<SetStateAction<safeListingType[]>>;
};

const ListingStore = create<ListingStoreType>((set) => ({
  listings: [],
  setListings: (listings) => {
    set((state) => ({
      listings:
        typeof listings === "function" ? listings(state.listings) : listings,
    }));
  },
}));

export default ListingStore;
