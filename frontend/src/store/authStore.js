import { create } from "zustand";
import { getMe } from "../api/auth";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token"),

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await getMe();
      set({ user: data });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },
}));

export default useAuthStore;
