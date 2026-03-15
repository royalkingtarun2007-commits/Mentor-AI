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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),

  checkAuth: async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    }
  },
}));