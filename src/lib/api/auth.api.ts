import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { LoginRequest, RegisterRequest, LoginResponse } from '@/types/auth';

export const authApi = {
    login: (data: LoginRequest) =>
        apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data),

    register: (data: RegisterRequest) =>
        apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data),
};