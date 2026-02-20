import axios from 'axios';
import { ENV } from '@/constants/env';
import { useAuthStore } from '@/lib/store/auth.store';

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        // 백엔드가 { data: ... } 형태로 감싸는 경우 자동 언래핑
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default apiClient;