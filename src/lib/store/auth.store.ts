import { create } from 'zustand';
import { persist } from "zustand/middleware";
import { UserInfo } from '@/types/auth';

interface AuthState {
    accessToken: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;

    setAuth: (token: string, user: UserInfo) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            setAuth: (token, user) =>
                set({ accessToken: token, user, isAuthenticated: true }),
            clearAuth: () =>
                set({ accessToken: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        },
    ),
);