import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { MotionDetail, MotionListItem } from '@/types/motion';

interface PaginatedResponse<T> {
    items: T[];
    pagination: { total: number; page: number; limit: number };
}

export const motionApi = {
    getList: () =>
        apiClient.get<PaginatedResponse<MotionListItem>>(API_ENDPOINTS.MOTIONS.LIST),

    getDetail: (id: number) =>
        apiClient.get<MotionDetail>(API_ENDPOINTS.MOTIONS.DETAIL(id)),

    upload: (formData: FormData, onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void) =>
        apiClient.post(API_ENDPOINTS.MOTIONS.UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress,
        }),
};
