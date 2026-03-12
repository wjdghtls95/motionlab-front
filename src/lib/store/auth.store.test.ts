import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import { UserInfo } from '@/types/auth';

const mockUser: UserInfo = {
    id: 1,
    email: 'test@motionlab.com',
    name: '테스트유저',
    role: 'USER',
};

beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useAuthStore.getState().clearAuth();
});

describe('AuthStore', () => {
    describe('setAuth', () => {
        it('accessToken, refreshToken, user를 저장하고 isAuthenticated를 true로 설정한다', () => {
            useAuthStore.getState().setAuth('access-token-123', 'refresh-token-abc', mockUser);

            const state = useAuthStore.getState();
            expect(state.accessToken).toBe('access-token-123');
            expect(state.refreshToken).toBe('refresh-token-abc');
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
        });
    });

    describe('setAccessToken', () => {
        it('기존 user 정보는 유지하면서 accessToken과 refreshToken만 갱신한다', () => {
            useAuthStore.getState().setAuth('old-access', 'old-refresh', mockUser);
            useAuthStore.getState().setAccessToken('new-access', 'new-refresh');

            const state = useAuthStore.getState();
            expect(state.accessToken).toBe('new-access');
            expect(state.refreshToken).toBe('new-refresh');
            // user 정보는 그대로 유지
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
        });
    });

    describe('clearAuth', () => {
        it('로그아웃 시 모든 인증 상태를 초기화한다', () => {
            useAuthStore.getState().setAuth('access-token', 'refresh-token', mockUser);
            useAuthStore.getState().clearAuth();

            const state = useAuthStore.getState();
            expect(state.accessToken).toBeNull();
            expect(state.refreshToken).toBeNull();
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
        });
    });

    describe('admin role', () => {
        it('ADMIN role 유저를 정상적으로 저장한다', () => {
            const adminUser: UserInfo = { ...mockUser, role: 'ADMIN' };
            useAuthStore.getState().setAuth('admin-token', 'admin-refresh', adminUser);

            expect(useAuthStore.getState().user?.role).toBe('ADMIN');
        });
    });
});
