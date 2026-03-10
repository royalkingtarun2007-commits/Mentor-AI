import { create } from "zustand";

interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),

  checkAuth: async () => {
    try {
      const res = await fetch("http://localhost:8000/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data });
      } else {
        set({ user: null });
      }
    } catch (err) {
      set({ user: null });
    }
  },
}));