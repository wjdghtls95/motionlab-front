/**
 * R-082: useMotionPolling 타임아웃 UI 전환 테스트
 * R-010: 폴링 종료 조건 테스트
 * R-043: 404 Not Found 처리 테스트
 *
 * 시나리오:
 * - motionId null 이면 폴링 비활성화
 * - PENDING 상태에서 타임아웃 미경과 시 isTimedOut: false
 * - PENDING 상태에서 MAX_POLL_DURATION_MS 경과 시 isTimedOut: true (setTimeout 기반)
 * - COMPLETED 상태 도달 후 타이머 경과해도 isTimedOut: false
 * - FAILED 상태 도달 후 타이머 경과해도 isTimedOut: false
 * - 데이터를 정상적으로 반환한다
 * - API 404 응답 시 isNotFound: true, 재시도 없음
 * - 404 외 에러 시 isNotFound: false
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';

// ── 공통 모킹 ──────────────────────────────────────────────────────────────
vi.mock('@/constants/env', () => ({ ENV: { API_URL: 'http://localhost:3000' } }));
vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: {
        getState: vi.fn(() => ({ accessToken: 'token', refreshToken: null, clearAuth: vi.fn() })),
    },
}));

const mockGetDetail = vi.fn();
vi.mock('@lib/api/motion.api', () => ({
    motionApi: { getDetail: (...args: unknown[]) => mockGetDetail(...args) },
}));

const MOCK_POLLING_INTERVAL = 100;
const MOCK_MAX_POLL_DURATION_MS = 300;

vi.mock('@constants/config', () => ({
    APP_CONFIG: {
        API_TIMEOUT: 5000,
        POLLING_INTERVAL: MOCK_POLLING_INTERVAL,
        MAX_POLL_DURATION_MS: MOCK_MAX_POLL_DURATION_MS,
    },
}));

vi.mock('@constants/motion-status', () => ({
    MOTION_STATUS: {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED',
        RETRYING: 'RETRYING',
    },
}));

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false, retryDelay: 0 } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: qc }, children);
    };
}

describe('useMotionPolling', () => {
    beforeEach(() => {
        // shouldAdvanceTime: true — 실제 시간도 함께 흐르게 하여 TanStack Query 내부 타이머와 충돌 방지
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        mockGetDetail.mockReset();
    });

    it('motionId가 null이면 쿼리가 비활성화된다', async () => {
        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(null), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe('idle');
        expect(mockGetDetail).not.toHaveBeenCalled();
    });

    it('API 데이터를 정상적으로 반환한다', async () => {
        mockGetDetail.mockResolvedValue({ data: { status: 'PENDING', id: 1 } });

        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(1), {
            wrapper: createWrapper(),
        });

        await act(() => vi.advanceTimersByTimeAsync(0));
        await waitFor(() => expect(result.current.data?.status).toBe('PENDING'));
        expect(mockGetDetail).toHaveBeenCalledWith(1);
    });

    it('타임아웃 미경과(PENDING) → isTimedOut: false', async () => {
        mockGetDetail.mockResolvedValue({ data: { status: 'PENDING', id: 1 } });

        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(1), {
            wrapper: createWrapper(),
        });

        await act(() => vi.advanceTimersByTimeAsync(0));
        await waitFor(() => expect(result.current.data?.status).toBe('PENDING'));
        expect(result.current.isTimedOut).toBe(false);
    });

    it('MAX_POLL_DURATION_MS 경과(PENDING) → isTimedOut: true', async () => {
        mockGetDetail.mockResolvedValue({ data: { status: 'PENDING', id: 1 } });

        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(1), {
            wrapper: createWrapper(),
        });

        await act(() => vi.advanceTimersByTimeAsync(0));
        await waitFor(() => expect(result.current.data?.status).toBe('PENDING'));

        // 타임아웃 타이머 경과
        await act(() => vi.advanceTimersByTimeAsync(MOCK_MAX_POLL_DURATION_MS + 1));

        expect(result.current.isTimedOut).toBe(true);
    });

    it('COMPLETED 상태 도달 후 타이머 경과해도 isTimedOut: false', async () => {
        mockGetDetail.mockResolvedValue({ data: { status: 'COMPLETED', id: 1 } });

        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(1), {
            wrapper: createWrapper(),
        });

        await act(() => vi.advanceTimersByTimeAsync(0));
        await waitFor(() => expect(result.current.data?.status).toBe('COMPLETED'));

        await act(() => vi.advanceTimersByTimeAsync(MOCK_MAX_POLL_DURATION_MS + 1));

        expect(result.current.isTimedOut).toBe(false);
    });

    it('FAILED 상태 도달 후 타이머 경과해도 isTimedOut: false', async () => {
        mockGetDetail.mockResolvedValue({ data: { status: 'FAILED', id: 1 } });

        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(1), {
            wrapper: createWrapper(),
        });

        await act(() => vi.advanceTimersByTimeAsync(0));
        await waitFor(() => expect(result.current.data?.status).toBe('FAILED'));

        await act(() => vi.advanceTimersByTimeAsync(MOCK_MAX_POLL_DURATION_MS + 1));

        expect(result.current.isTimedOut).toBe(false);
    });

    it('API 404 응답 시 isNotFound: true, 재시도 없음', async () => {
        const notFoundError = new axios.AxiosError('Not Found', 'ERR_BAD_REQUEST', undefined, undefined, {
            status: 404,
            data: {},
            statusText: 'Not Found',
            headers: {},
            config: {} as never,
        });
        mockGetDetail.mockRejectedValue(notFoundError);

        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(999), {
            wrapper: createWrapper(),
        });

        await act(() => vi.advanceTimersByTimeAsync(0));
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.isNotFound).toBe(true);
        // 404는 재시도 없으므로 1회만 호출됨
        expect(mockGetDetail).toHaveBeenCalledTimes(1);
    });

    it('404 외 에러(500) 시 isNotFound: false', async () => {
        const serverError = new axios.AxiosError('Internal Server Error', 'ERR_BAD_RESPONSE', undefined, undefined, {
            status: 500,
            data: {},
            statusText: 'Internal Server Error',
            headers: {},
            config: {} as never,
        });
        mockGetDetail.mockRejectedValue(serverError);

        const { useMotionPolling } = await import('@/lib/hooks/use-motion-polling');
        const { result } = renderHook(() => useMotionPolling(1), {
            wrapper: createWrapper(),
        });

        await act(() => vi.advanceTimersByTimeAsync(0));
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.isNotFound).toBe(false);
    });
});
