/**
 * R-031: Admin Sports 페이지 시나리오 테스트
 *
 * 시나리오:
 * - 종목 목록 렌더링
 * - "종목 추가" 버튼 클릭 시 폼 노출
 * - 종목 추가 폼 제출 시 createSport 호출
 * - 비활성화 버튼 클릭 시 deactivateSport 호출
 * - API 실패 시 에러 메시지 노출
 * - 종목 수 총계 표시
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminSportsPage from '@/app/(admin)/admin/sports/page';

// --- common mocks ---
vi.mock('@/lib/store/theme.store', () => ({
    useThemeStore: (selector: (s: { theme: string }) => unknown) => selector({ theme: 'light' }),
}));
vi.mock('@/constants/env', () => ({ ENV: { API_URL: 'http://localhost:3000' } }));
vi.mock('@constants/config', () => ({ APP_CONFIG: { API_TIMEOUT: 5000 } }));
vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: { getState: vi.fn(() => ({ accessToken: 'admin-token', refreshToken: null })) },
}));

// --- sport.api mock ---
const mockGetList = vi.fn();
vi.mock('@/lib/api/sport.api', () => ({
    sportApi: {
        getList: (...args: unknown[]) => mockGetList(...args),
    },
}));

// --- admin.api mock ---
const mockCreateSport = vi.fn();
const mockUpdateSport = vi.fn();
const mockDeactivateSport = vi.fn();
vi.mock('@/lib/api/admin.api', () => ({
    adminApi: {
        createSport: (...args: unknown[]) => mockCreateSport(...args),
        updateSport: (...args: unknown[]) => mockUpdateSport(...args),
        deactivateSport: (...args: unknown[]) => mockDeactivateSport(...args),
    },
}));

const mockSports = [
    { id: 1, sportType: 'golf', subCategory: 'DRIVER', description: '드라이버 스윙', isActive: true },
    { id: 2, sportType: 'weight', subCategory: 'SQUAT', description: '스쿼트', isActive: true },
] as const;

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    };
}

describe('AdminSportsPage', () => {
    beforeEach(() => {
        mockGetList.mockReset();
        mockCreateSport.mockReset();
        mockUpdateSport.mockReset();
        mockDeactivateSport.mockReset();
    });

    it('종목 목록을 올바르게 렌더링한다', async () => {
        mockGetList.mockResolvedValue({ data: mockSports });

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('골프')).toBeInTheDocument());
        expect(screen.getByText('웨이트')).toBeInTheDocument();
        expect(screen.getByText('드라이버 스윙')).toBeInTheDocument();
    });

    it('"종목 추가" 버튼 클릭 시 추가 폼이 노출된다', async () => {
        mockGetList.mockResolvedValue({ data: mockSports });

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('골프')).toBeInTheDocument());

        fireEvent.click(screen.getByText('종목 추가'));
        expect(screen.getByText('새 종목 추가')).toBeInTheDocument();
    });

    it('"취소" 버튼 클릭 시 추가 폼이 숨겨진다', async () => {
        mockGetList.mockResolvedValue({ data: mockSports });

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('골프')).toBeInTheDocument());

        fireEvent.click(screen.getByText('종목 추가'));
        expect(screen.getByText('새 종목 추가')).toBeInTheDocument();

        fireEvent.click(screen.getByText('취소'));
        expect(screen.queryByText('새 종목 추가')).not.toBeInTheDocument();
    });

    it('추가 폼 제출 시 createSport를 호출한다', async () => {
        mockGetList.mockResolvedValue({ data: mockSports });
        mockCreateSport.mockResolvedValue({ data: { id: 3, sportType: 'tennis' } });
        // 추가 성공 후 목록 재조회
        mockGetList.mockResolvedValue({ data: mockSports });

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('골프')).toBeInTheDocument());

        fireEvent.click(screen.getByText('종목 추가'));
        fireEvent.click(screen.getByText('추가'));

        await waitFor(() => expect(mockCreateSport).toHaveBeenCalled());
    });

    it('"비활성화" 버튼 클릭 시 deactivateSport를 호출한다', async () => {
        mockGetList.mockResolvedValue({ data: mockSports });
        mockDeactivateSport.mockResolvedValue({ data: {} });

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('골프')).toBeInTheDocument());

        const deactivateButtons = screen.getAllByText('비활성화');
        fireEvent.click(deactivateButtons[0]);

        await waitFor(() => expect(mockDeactivateSport).toHaveBeenCalledWith(1));
    });

    it('API 실패 시 에러 메시지를 표시한다', async () => {
        mockGetList.mockRejectedValue(new Error('Network Error'));

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() =>
            expect(screen.getByText(/불러오지 못했습니다/)).toBeInTheDocument(),
        );
    });

    it('종목 수 총계를 표시한다', async () => {
        mockGetList.mockResolvedValue({ data: mockSports });

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() => expect(screen.getByText('총 2개 종목')).toBeInTheDocument());
    });

    it('종목이 없으면 빈 상태 메시지를 표시한다', async () => {
        mockGetList.mockResolvedValue({ data: [] });

        render(<AdminSportsPage />, { wrapper: createWrapper() });

        await waitFor(() =>
            expect(screen.getByText('등록된 종목이 없습니다.')).toBeInTheDocument(),
        );
    });
});
