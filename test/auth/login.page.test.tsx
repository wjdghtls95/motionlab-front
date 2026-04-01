/**
 * R-078: 로그인 폼 중복 제출 경합 조건 방지 테스트
 *
 * 시나리오:
 * - 정상 이메일/비밀번호 입력 후 제출 시 API 1회 호출
 * - 제출 직후 중복 클릭 시 API는 여전히 1회만 호출됨 (isSubmittingRef 가드)
 * - API 실패 후 isSubmittingRef가 리셋되어 재제출 가능
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';

// ── 공통 모킹 ──────────────────────────────────────────────────────────────
vi.mock('@/constants/env', () => ({ ENV: { API_URL: 'http://localhost:3000' } }));
vi.mock('@constants/config', () => ({ APP_CONFIG: { API_TIMEOUT: 5000 } }));
vi.mock('@/constants/routes', () => ({ ROUTES: { HOME: '/', REGISTER: '/register' } }));
vi.mock('@/constants/messages', () => ({
    MESSAGES: {
        AUTH: {
            EMAIL_REQUIRED: '이메일을 입력해주세요',
            PASSWORD_REQUIRED: '비밀번호를 입력해주세요',
            LOGIN_SUCCESS: '로그인 성공',
            LOGIN_FAILED: '로그인 실패',
        },
    },
}));

vi.mock('@/lib/store/theme.store', () => ({
    useThemeStore: (selector: (s: { theme: string }) => unknown) => selector({ theme: 'light' }),
}));

const mockSetAuth = vi.fn();
vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: (selector: (s: { setAuth: typeof mockSetAuth }) => unknown) =>
        selector({ setAuth: mockSetAuth }),
}));

const mockAddToast = vi.fn();
vi.mock('@/lib/store/toast.store', () => ({
    useToastStore: (selector: (s: { addToast: typeof mockAddToast }) => unknown) =>
        selector({ addToast: mockAddToast }),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

const mockLogin = vi.fn();
vi.mock('@/lib/api/auth.api', () => ({
    authApi: {
        login: (...args: unknown[]) => mockLogin(...args),
    },
}));

// ── 헬퍼 ──────────────────────────────────────────────────────────────────
function fillLoginForm() {
    fireEvent.change(screen.getByPlaceholderText('이메일을 입력하세요'), {
        target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호를 입력하세요'), {
        target: { value: 'password123' },
    });
}

const LOGIN_RESPONSE = {
    data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        userId: 1,
        email: 'user@example.com',
        name: '테스트유저',
        role: 'USER',
    },
};

describe('LoginPage — 중복 제출 방지', () => {
    beforeEach(() => {
        mockLogin.mockReset();
        mockSetAuth.mockReset();
        mockAddToast.mockReset();
        mockPush.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('정상 입력 후 제출 시 authApi.login을 1회 호출하고 홈으로 이동한다', async () => {
        // 방지: 정상 로그인 플로우 누락
        mockLogin.mockResolvedValue(LOGIN_RESPONSE);

        render(<LoginPage />);
        fillLoginForm();

        fireEvent.click(screen.getByRole('button', { name: '로그인' }));

        await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
        expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' });
        expect(mockSetAuth).toHaveBeenCalledWith(
            'access-token',
            'refresh-token',
            { id: 1, email: 'user@example.com', name: '테스트유저', role: 'USER' },
        );
        expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('제출 직후 중복 클릭 시 API를 1회만 호출한다', async () => {
        // 방지: 마이크로태스크 윈도우에서 중복 API 요청 → 토큰 이중 발급
        let resolve: (v: unknown) => void;
        const pending = new Promise((r) => { resolve = r; });
        mockLogin.mockReturnValue(pending);

        render(<LoginPage />);
        fillLoginForm();

        const submitButton = screen.getByRole('button', { name: '로그인' });

        // 첫 번째 클릭 — isSubmittingRef.current = true 설정 (리렌더 전)
        fireEvent.click(submitButton);
        // 상태 미반영 상태에서 즉시 두 번째 클릭
        fireEvent.click(submitButton);

        await act(async () => {
            resolve!(LOGIN_RESPONSE);
        });

        // isSubmittingRef로 인해 두 번째 클릭은 차단됨
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('API 실패 후 isSubmittingRef가 리셋되어 재제출이 가능하다', async () => {
        // 방지: finally에서 ref 미리셋 시 실패 후 영구 제출 잠금
        mockLogin
            .mockRejectedValueOnce(new Error('Network Error'))
            .mockResolvedValueOnce(LOGIN_RESPONSE);

        render(<LoginPage />);
        fillLoginForm();

        // 첫 번째 제출 → 실패
        fireEvent.click(screen.getByRole('button', { name: '로그인' }));
        await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));

        // 에러 배너 노출 확인
        await waitFor(() => expect(screen.getByText('로그인 실패')).toBeInTheDocument());

        // 두 번째 제출 → 성공 (ref가 리셋되어야 가능)
        fireEvent.click(screen.getByRole('button', { name: '로그인' }));
        await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(2));
        expect(mockPush).toHaveBeenCalledWith('/');
    });
});
