import create from "zustand";
import { UserType } from "../types/user";

export type UserStore = {
  user: undefined | null | UserType;
  setUser: (user: UserType | null) => void;
  clearUser: () => void;
};

const useUserStore = create<UserStore>((set) => ({
  user: (() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) as UserType : null;
  })(),
  setUser: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem('currentUser');
    set({ user: null });
  },
}));

export default useUserStore;