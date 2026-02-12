import axios from 'axios';
import { ENV } from '@constants/env';

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: Access Token 자동 주입
apiClient.interceptors.request.use((config) => {
    // TODO: Zustand store에서 토큰 가져오기
    return config;
});

// 응답 인터셉터: 401 시 토큰 갱신
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // TODO: Refresh Token으로 갱신 시도
        }
        return Promise.reject(error);
    },
);

export default apiClient;