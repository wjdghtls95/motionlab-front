import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { LoginRequest, RegisterRequest, LoginResponse, RefreshResponse } from '@/types/auth';

export const authApi = {
    login: (data: LoginRequest) =>
        apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data),

    register: (data: RegisterRequest) =>
        apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data),

    /** Refresh Token으로 새로운 Access Token 발급 */
    refresh: (refreshToken: string) =>
        apiClient.post<RefreshResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
};