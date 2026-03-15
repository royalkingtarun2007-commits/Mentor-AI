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

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("access_token");
      if (!token) { set({ user: null }); return; }
      const res = await fetch(`${API_URL}/me`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data });
      } else {
        localStorage.removeItem("access_token");
        set({ user: null });
      }
    } catch {
      set({ user: null });
    }
  },
}));