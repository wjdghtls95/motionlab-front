import apiClient from './client';
import { API_ENDPOINTS } from '@constants/api-endpoints';
import { UserRole } from '@/types/auth';
import { Sport } from './sport.api';

export interface AdminUser {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export const adminApi = {
    /** 특정 사용자의 role을 변경한다. (관리자 전용) */
    updateUserRole: (userId: number, role: UserRole) =>
        apiClient.patch<AdminUser>(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId), { role }),

    /** 모든 사용자 목록을 조회한다. (관리자 전용) */
    getUsers: () =>
        apiClient.get<AdminUser[]>(API_ENDPOINTS.USERS.LIST),

    /** 새 운동 종목을 생성한다. (관리자 전용) */
    createSport: (sportType: string, description?: string) =>
        apiClient.post<Sport>(API_ENDPOINTS.SPORTS.LIST, { sportType, description }),

    /** 운동 종목 설명을 수정한다. (관리자 전용) */
    updateSport: (sportId: number, description: string) =>
        apiClient.patch<Sport>(API_ENDPOINTS.SPORTS.DETAIL(sportId), { description }),

    /** 운동 종목을 비활성화한다 (Soft Delete). (관리자 전용) */
    deactivateSport: (sportId: number) =>
        apiClient.delete<Sport>(API_ENDPOINTS.SPORTS.DETAIL(sportId)),
};
