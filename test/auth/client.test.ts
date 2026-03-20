/**
 * R-008: Access Token 갱신 로직 인터셉터 테스트
 *
 * 테스트 대상: src/lib/api/client.ts (401 인터셉터 Queue 패턴)
 * 시나리오: 만료, 동시 요청, refresh 실패, 비-401 오류 등 실제 운영 상황 검증
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

// --- store mock ---
const mockClearAuth = vi.fn();
const mockSetAccessToken = vi.fn();
const mockGetState = vi.fn();

vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: { getState: mockGetState },
}));
vi.mock('@/constants/env', () => ({
    ENV: { API_URL: 'http://localhost:3000' },
}));
vi.mock('@constants/config', () => ({
    APP_CONFIG: { API_TIMEOUT: 5000 },
}));

// window.location.href 설정 가능하도록
const locationMock = { href: '' };
Object.defineProperty(window, 'location', { value: locationMock, writable: true });

describe('apiClient 401 인터셉터', () => {
    let apiClientMock: MockAdapter;
    let refreshClientMock: MockAdapter;
    let apiClient: typeof import('@/lib/api/client').default;
    let refreshClient: (typeof import('@/lib/api/client'))['refreshClient'];

    beforeEach(async () => {
        vi.resetModules();
        locationMock.href = '';
        mockClearAuth.mockReset();
        mockSetAccessToken.mockReset();
        mockGetState.mockReset();

        // 매 테스트마다 모듈 재로드 → isRefreshing / pendingQueue 초기화
        const clientModule = await import('@/lib/api/client');
        apiClient = clientModule.default;
        refreshClient = clientModule.refreshClient;

        apiClientMock = new MockAdapter(apiClient);
        refreshClientMock = new MockAdapter(refreshClient);
    });

    afterEach(() => {
        apiClientMock.restore();
        refreshClientMock.restore();
    });

    it('refresh token이 없으면 즉시 로그아웃하고 /login으로 이동한다', async () => {
        mockGetState.mockReturnValue({ refreshToken: null, clearAuth: mockClearAuth });
        apiClientMock.onGet('/protected').reply(401);

        await expect(apiClient.get('/protected')).rejects.toMatchObject({
            response: { status: 401 },
        });

        expect(mockClearAuth).toHaveBeenCalledTimes(1);
        expect(locationMock.href).toBe('/login');
    });

    it('401이 아닌 에러(예: 500)는 refresh 시도 없이 그대로 reject한다', async () => {
        mockGetState.mockReturnValue({ refreshToken: 'some-token', clearAuth: mockClearAuth });
        apiClientMock.onGet('/server-error').reply(500);

        await expect(apiClient.get('/server-error')).rejects.toMatchObject({
            response: { status: 500 },
        });

        expect(mockClearAuth).not.toHaveBeenCalled();
        expect(locationMock.href).toBe('');
    });

    it('만료된 Access Token이 있으면 Authorization 헤더에 싣고 요청한다', async () => {
        mockGetState.mockReturnValue({ accessToken: 'expired-token' });
        let capturedHeader = '';
        apiClientMock.onGet('/check-header').reply((config) => {
            capturedHeader = config.headers?.Authorization ?? '';
            return [200, { data: {} }];
        });

        await apiClient.get('/check-header');

        expect(capturedHeader).toBe('Bearer expired-token');
    });

    it('401 발생 시 refresh 성공하면 원래 요청을 재시도하고 정상 응답을 반환한다', async () => {
        mockGetState.mockReturnValue({
            refreshToken: 'old-refresh',
            setAccessToken: mockSetAccessToken,
            clearAuth: mockClearAuth,
        });

        let protectedCount = 0;
        apiClientMock.onGet('/protected').reply(() => {
            protectedCount++;
            return protectedCount === 1
                ? [401]
                : [200, { data: { result: 'success' } }];
        });

        refreshClientMock.onPost('/auth/refresh').reply(200, {
            data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
        });

        const response = await apiClient.get('/protected');

        expect(mockSetAccessToken).toHaveBeenCalledWith('new-access', 'new-refresh');
        expect(response.data).toEqual({ result: 'success' });
        expect(mockClearAuth).not.toHaveBeenCalled();
    });

    it('refresh 자체가 실패(401)하면 로그아웃하고 /login으로 이동한다', async () => {
        mockGetState.mockReturnValue({
            refreshToken: 'invalid-refresh',
            setAccessToken: mockSetAccessToken,
            clearAuth: mockClearAuth,
        });

        apiClientMock.onGet('/protected').reply(401);
        refreshClientMock.onPost('/auth/refresh').reply(401);

        await expect(apiClient.get('/protected')).rejects.toBeDefined();

        expect(mockClearAuth).toHaveBeenCalledTimes(1);
        expect(locationMock.href).toBe('/login');
    });

    it('동시에 여러 401이 발생해도 refresh는 한 번만 호출된다', async () => {
        mockGetState.mockReturnValue({
            refreshToken: 'shared-refresh',
            setAccessToken: mockSetAccessToken,
            clearAuth: mockClearAuth,
        });

        const callCounts: Record<string, number> = {
            '/api/a': 0,
            '/api/b': 0,
            '/api/c': 0,
        };
        ['/api/a', '/api/b', '/api/c'].forEach((url) => {
            apiClientMock.onGet(url).reply(() => {
                callCounts[url]++;
                return callCounts[url] === 1
                    ? [401]
                    : [200, { data: {} }];
            });
        });

        let refreshCount = 0;
        refreshClientMock.onPost('/auth/refresh').reply(() => {
            refreshCount++;
            return [200, { data: { accessToken: 'new-token', refreshToken: 'new-refresh' } }];
        });

        await Promise.all([
            apiClient.get('/api/a'),
            apiClient.get('/api/b'),
            apiClient.get('/api/c'),
        ]);

        // refresh는 정확히 1회만 호출
        expect(refreshCount).toBe(1);
        expect(mockSetAccessToken).toHaveBeenCalledTimes(1);
    });
});
