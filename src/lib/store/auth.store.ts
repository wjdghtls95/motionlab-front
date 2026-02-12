import { create } from 'zustand';
import { UserInfo } from '@/types/auth';

interface AuthState {
    accessToken: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;

    setAuth: (token: string, user: UserInfo) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,

    setAuth: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),

    clearAuth: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
}));