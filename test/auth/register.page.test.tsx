/**
 * R-078: 회원가입 폼 중복 제출 경합 조건 방지 테스트
 *
 * 시나리오:
 * - 정상 입력 후 제출 시 API 1회 호출
 * - 제출 직후 중복 클릭 시 API는 여전히 1회만 호출됨 (isSubmittingRef 가드)
 * - API 실패 후 isSubmittingRef가 리셋되어 재제출 가능
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RegisterPage from '@/app/(auth)/register/page';

// ── 공통 모킹 ──────────────────────────────────────────────────────────────
vi.mock('@/constants/env', () => ({ ENV: { API_URL: 'http://localhost:3000' } }));
vi.mock('@constants/config', () => ({ APP_CONFIG: { API_TIMEOUT: 5000 } }));
vi.mock('@/constants/routes', () => ({ ROUTES: { LOGIN: '/login' } }));
vi.mock('@/constants/messages', () => ({
    MESSAGES: {
        AUTH: {
            EMAIL_INVALID: '유효한 이메일을 입력해주세요',
            PASSWORD_MATCH: '비밀번호가 일치합니다',
            PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
            REGISTER_SUCCESS: '회원가입 성공',
            REGISTER_FAILED: '회원가입 실패',
        },
    },
}));

vi.mock('@/lib/store/theme.store', () => ({
    useThemeStore: (selector: (s: { theme: string }) => unknown) => selector({ theme: 'light' }),
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

const mockRegister = vi.fn();
vi.mock('@/lib/api/auth.api', () => ({
    authApi: {
        register: (...args: unknown[]) => mockRegister(...args),
    },
}));

// ── 헬퍼 ──────────────────────────────────────────────────────────────────
function fillRegisterForm() {
    fireEvent.change(screen.getByPlaceholderText('이름을 입력하세요'), {
        target: { value: '테스트유저' },
    });
    fireEvent.change(screen.getByPlaceholderText('이메일을 입력하세요'), {
        target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호를 입력하세요'), {
        target: { value: 'Password1!' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호를 다시 입력하세요'), {
        target: { value: 'Password1!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
}

describe('RegisterPage — 중복 제출 방지', () => {
    beforeEach(() => {
        mockRegister.mockReset();
        mockAddToast.mockReset();
        mockPush.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('정상 입력 후 제출 시 authApi.register를 1회 호출하고 로그인 페이지로 이동한다', async () => {
        // 방지: 정상 회원가입 플로우 누락
        mockRegister.mockResolvedValue({ data: {} });

        render(<RegisterPage />);
        fillRegisterForm();

        fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

        await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
        expect(mockRegister).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: 'Password1!',
            name: '테스트유저',
        });
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('제출 직후 중복 클릭 시 API를 1회만 호출한다', async () => {
        // 방지: 마이크로태스크 윈도우에서 중복 API 요청 → 중복 계정 생성 시도
        let resolve: (v: unknown) => void;
        const pending = new Promise((r) => { resolve = r; });
        mockRegister.mockReturnValue(pending);

        render(<RegisterPage />);
        fillRegisterForm();

        const submitButton = screen.getByRole('button', { name: '회원가입' });

        // 첫 번째 클릭 — isSubmittingRef.current = true 설정 (리렌더 전)
        fireEvent.click(submitButton);
        // 상태 미반영 상태에서 즉시 두 번째 클릭
        fireEvent.click(submitButton);

        await act(async () => {
            resolve!({ data: {} });
        });

        expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    it('API 실패 후 isSubmittingRef가 리셋되어 재제출이 가능하다', async () => {
        // 방지: finally에서 ref 미리셋 시 실패 후 영구 제출 잠금
        mockRegister
            .mockRejectedValueOnce(new Error('Network Error'))
            .mockResolvedValueOnce({ data: {} });

        render(<RegisterPage />);
        fillRegisterForm();

        // 첫 번째 제출 → 실패
        fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
        await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));

        // 에러 배너 노출 확인
        await waitFor(() => expect(screen.getByText('회원가입 실패')).toBeInTheDocument());

        // 두 번째 제출 → 성공 (ref가 리셋되어야 가능)
        fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
        await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(2));
        expect(mockPush).toHaveBeenCalledWith('/login');
    });
});
