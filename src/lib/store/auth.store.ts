import { create } from 'zustand';
import { persist } from "zustand/middleware";
import { UserInfo } from '@/types/auth';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;

    setAuth: (accessToken: string, refreshToken: string, user: UserInfo) => void;
    /** Access Token만 갱신 (refresh 성공 후 호출) */
    setAccessToken: (accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            setAuth: (accessToken, refreshToken, user) =>
                set({ accessToken, refreshToken, user, isAuthenticated: true }),
            setAccessToken: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),
            clearAuth: () =>
                set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        },
    ),
);