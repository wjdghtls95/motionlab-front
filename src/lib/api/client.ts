import axios, { AxiosRequestConfig } from 'axios';
import { ENV } from '@/constants/env';
import { useAuthStore } from '@/lib/store/auth.store';
import { APP_CONFIG } from "@constants/config";

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
});

// refresh 요청 전용 인스턴스: 인터셉터가 없어 무한 루프를 방지한다
// export는 테스트에서 mock adapter를 연결하기 위해 필요
export const refreshClient = axios.create({
    baseURL: ENV.API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 토큰 갱신 중 상태 플래그 — 동시 401 요청을 큐에 쌓아 처리
let isRefreshing = false;
type QueueItem = { resolve: (token: string) => void; reject: (error: unknown) => void };
let pendingQueue: QueueItem[] = [];

/** 큐에 쌓인 요청들을 토큰 갱신 결과에 따라 일괄 처리 */
function flushQueue(error: unknown, token: string | null = null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token!);
        }
    });
    pendingQueue = [];
}

apiClient.interceptors.response.use(
    (response) => {
        // 백엔드가 { data: ... } 형태로 감싸는 경우 자동 언래핑
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        const { refreshToken } = useAuthStore.getState();

        // Refresh Token 없으면 즉시 로그아웃
        if (!refreshToken) {
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // 이미 갱신 중이면 큐에 등록하여 완료 후 재시도
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            }).then((newToken) => {
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${newToken}`,
                };
                return apiClient(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // refreshClient를 사용해 인터셉터 재진입 방지
            const response = await refreshClient.post<{ data: { accessToken: string; refreshToken: string } }>(
                '/auth/refresh',
                { refreshToken },
            );
            // refreshClient는 언래핑 인터셉터가 없으므로 .data.data에서 추출
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

            useAuthStore.getState().setAccessToken(newAccessToken, newRefreshToken);
            flushQueue(null, newAccessToken);

            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newAccessToken}`,
            };
            return apiClient(originalRequest);
        } catch (refreshError) {
            flushQueue(refreshError, null);
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default apiClient;