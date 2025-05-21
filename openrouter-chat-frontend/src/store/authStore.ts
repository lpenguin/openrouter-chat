import { create } from 'zustand';
import type { AuthUser } from '../schemas/authUserSchema';

interface AuthStore {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  setAuthUser: (authUser) => set({ authUser })
}));
