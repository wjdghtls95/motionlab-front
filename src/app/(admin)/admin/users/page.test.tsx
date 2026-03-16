/**
 * R-031: Admin Users 페이지 시나리오 테스트
 *
 * 시나리오:
 * - 사용자 목록 렌더링
 * - 역할 변경 버튼 노출 조건 (USER → 관리자로 변경, ADMIN → 일반으로 변경)
 * - role 변경 버튼 클릭 시 updateUserRole 올바른 인자로 호출
 * - API 실패 시 에러 메시지 노출
 * - 사용자 수 총계 표시
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminUsersPage from './page';

// --- common mocks ---
vi.mock('@/lib/store/theme.store', () => ({
    useThemeStore: (selector: (s: { theme: string }) => unknown) => selector({ theme: 'light' }),
}));
vi.mock('@/constants/env', () => ({ ENV: { API_URL: 'http://localhost:3000' } }));
vi.mock('@constants/config', () => ({ APP_CONFIG: { API_TIMEOUT: 5000 } }));
vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: { getState: vi.fn(() => ({ accessToken: 'admin-token', refreshToken: null })) },
}));

// --- admin.api mock ---
const mockGetUsers = vi.fn();
const mockUpdateUserRole = vi.fn();
vi.mock('@/lib/api/admin.api', () => ({
    adminApi: {
        getUsers: (...args: unknown[]) => mockGetUsers(...args),
        updateUserRole: (...args: unknown[]) => mockUpdateUserRole(...args),
    },
}));

const mockUsers = [
    {
        id: 1,
        email: 'user@test.com',
        name: '일반유저',
        role: 'USER',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
    },
    {
        id: 2,
        email: 'admin@test.com',
        name: '어드민',
        role: 'ADMIN',
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
    },
] as const;

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    };
}

describe('AdminUsersPage', () => {
    beforeEach(() => {
        mockGetUsers.mockReset();
        mockUpdateUserRole.mockReset();
    });

    it('사용자 목록을 올바르게 렌더링한다', async () => {
        mockGetUsers.mockResolvedValue({ data: mockUsers });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('일반유저')).toBeInTheDocument());
        expect(screen.getByText('어드민')).toBeInTheDocument();
        expect(screen.getByText('user@test.com')).toBeInTheDocument();
        expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });

    it('USER role 유저에게 "관리자로 변경" 버튼이 노출된다', async () => {
        mockGetUsers.mockResolvedValue({ data: mockUsers });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('관리자로 변경')).toBeInTheDocument());
    });

    it('ADMIN role 유저에게 "일반으로 변경" 버튼이 노출된다', async () => {
        mockGetUsers.mockResolvedValue({ data: mockUsers });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('일반으로 변경')).toBeInTheDocument());
    });

    it('"관리자로 변경" 클릭 시 updateUserRole(1, ADMIN)을 호출한다', async () => {
        mockGetUsers.mockResolvedValue({ data: mockUsers });
        mockUpdateUserRole.mockResolvedValue({ data: { ...mockUsers[0], role: 'ADMIN' } });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('관리자로 변경')).toBeInTheDocument());
        fireEvent.click(screen.getByText('관리자로 변경'));

        await waitFor(() => expect(mockUpdateUserRole).toHaveBeenCalledWith(1, 'ADMIN'));
    });

    it('"일반으로 변경" 클릭 시 updateUserRole(2, USER)을 호출한다', async () => {
        mockGetUsers.mockResolvedValue({ data: mockUsers });
        mockUpdateUserRole.mockResolvedValue({ data: { ...mockUsers[1], role: 'USER' } });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('일반으로 변경')).toBeInTheDocument());
        fireEvent.click(screen.getByText('일반으로 변경'));

        await waitFor(() => expect(mockUpdateUserRole).toHaveBeenCalledWith(2, 'USER'));
    });

    it('API 실패 시 에러 메시지를 표시한다', async () => {
        mockGetUsers.mockRejectedValue(new Error('Network Error'));

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() =>
            expect(screen.getByText(/불러오지 못했습니다/)).toBeInTheDocument(),
        );
    });

    it('총 사용자 수를 표시한다', async () => {
        mockGetUsers.mockResolvedValue({ data: mockUsers });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('총 2명')).toBeInTheDocument());
    });

    it('사용자가 없으면 빈 상태 메시지를 표시한다', async () => {
        mockGetUsers.mockResolvedValue({ data: [] });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() =>
            expect(screen.getByText('사용자가 없습니다.')).toBeInTheDocument(),
        );
    });
});
