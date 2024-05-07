// userStore.ts
import create from "zustand";
import { UserType } from "../types/user";

// Define the state type
export type UserStore = {
 user: undefined | null | UserType; // Assuming the user object has a name and age
 setUser: (user: UserType) => void;
 clearUser: () => void;
};

// Create the store with the defined state type
const useUserStore = create<UserStore>((set) => ({
 user: null,
 setUser: (user) => set({ user }),
 clearUser: () => set({ user: null }),
}));

export default useUserStore;
