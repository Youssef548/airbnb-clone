import create from "zustand";
import { UserType } from "../types/user";
import { checkAuth } from "../apis/auth/auth";

export type UserStore = {
  user: undefined | null | UserType;
  setUser: (user: UserType | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
};

const useUserStore = create<UserStore>((set) => ({
  user: (() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) as UserType : null;
  })(),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem('currentUser');
    set({ user: null });
  },
  fetchUser: async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        set({ user: null });
        return;
      }
      const res = await checkAuth(authToken);
      const { data } = res;
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        set({ user: data.user });
      } else {
        localStorage.removeItem('currentUser');
        set({ user: null });
      }
    } catch (e) {
      console.log(e);
      localStorage.removeItem('currentUser');
      set({ user: null });
    }
  }
}));

export default useUserStore;