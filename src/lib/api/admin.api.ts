import apiClient from './client';
import { API_ENDPOINTS } from '@constants/api-endpoints';
import { UserRole } from '@/types/auth';

export const adminApi = {
    /** 특정 사용자의 role을 변경한다. */
    updateUserRole: (userId: number, role: UserRole) =>
        apiClient.patch<void>(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId), { role }),
};
