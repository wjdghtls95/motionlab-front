/**
 * R-030: AdminLayout guard 동작 테스트
 *
 * 시나리오:
 * - ADMIN 유저 → children 렌더링
 * - USER 유저 → 홈(/)으로 redirect
 * - 비로그인 → /login으로 redirect
 * - hydration 전 → 로딩 스피너 표시
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AdminLayout from '@/app/(admin)/layout';

// --- next/navigation mock ---
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
}));

// --- theme store mock (항상 light 모드) ---
vi.mock('@/lib/store/theme.store', () => ({
    useThemeStore: (selector: (s: { theme: string }) => unknown) =>
        selector({ theme: 'light' }),
}));

// --- Navbar, Sidebar, Toast 컴포넌트 mock ---
vi.mock('@/components/common/Navbar', () => ({ default: () => <nav>Navbar</nav> }));
vi.mock('@/components/common/Sidebar', () => ({ default: () => <aside>Sidebar</aside> }));
vi.mock('@/components/common/Toast', () => ({ default: () => <div>Toast</div> }));

// --- auth store mock helpers ---
let hydrationCallback: (() => void) | null = null;
let isHydrated = false;

const mockOnFinishHydration = vi.fn((cb: () => void) => {
    hydrationCallback = cb;
    return () => {};
});
const mockHasHydrated = vi.fn(() => isHydrated);

let mockAuthState = {
    isAuthenticated: false,
    user: null as { role: string } | null,
};

vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: Object.assign(
        (selector: (s: typeof mockAuthState) => unknown) => selector(mockAuthState),
        {
            persist: {
                onFinishHydration: (cb: () => void) => mockOnFinishHydration(cb),
                hasHydrated: () => mockHasHydrated(),
            },
        },
    ),
}));

function setHydrated(state: typeof mockAuthState) {
    isHydrated = true;
    mockAuthState = state;
    if (hydrationCallback) hydrationCallback();
}

describe('AdminLayout', () => {
    beforeEach(() => {
        mockRouterPush.mockReset();
        mockRouterReplace.mockReset();
        hydrationCallback = null;
        isHydrated = false;
        mockAuthState = { isAuthenticated: false, user: null };
        mockOnFinishHydration.mockClear();
        mockHasHydrated.mockClear();
    });

    it('hydration 전에는 로딩 스피너를 표시한다', () => {
        isHydrated = false;
        render(<AdminLayout><div>Admin Content</div></AdminLayout>);
        expect(screen.getByText('로딩 중...')).toBeInTheDocument();
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('ADMIN 유저는 children을 렌더링한다', async () => {
        await act(async () => {
            render(<AdminLayout><div>Admin Content</div></AdminLayout>);
            setHydrated({ isAuthenticated: true, user: { role: 'ADMIN' } });
        });

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
        expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('비로그인 유저는 /login으로 redirect한다', async () => {
        await act(async () => {
            render(<AdminLayout><div>Admin Content</div></AdminLayout>);
            setHydrated({ isAuthenticated: false, user: null });
        });

        expect(mockRouterPush).toHaveBeenCalledWith('/login');
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('USER role 유저는 홈(/)으로 redirect한다', async () => {
        await act(async () => {
            render(<AdminLayout><div>Admin Content</div></AdminLayout>);
            setHydrated({ isAuthenticated: true, user: { role: 'USER' } });
        });

        expect(mockRouterPush).toHaveBeenCalledWith('/');
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
});
