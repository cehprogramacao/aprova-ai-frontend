import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'STUDENT' | 'TEACHER';
  experienceLevel: string;
  examName?: string;
  examDate?: string;
  targetRole?: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  isDark: boolean;
  _hasHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  toggleDark: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isDark: true,
      _hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      toggleDark: () => set((s) => ({ isDark: !s.isDark })),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'aprova-ai-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
