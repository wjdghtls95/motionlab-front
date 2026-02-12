import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { MotionDetail, MotionListItem } from '@/types/motion';

export const motionApi = {
    getList: () =>
        apiClient.get<MotionListItem[]>(API_ENDPOINTS.MOTIONS.LIST),

    getDetail: (id: number) =>
        apiClient.get<MotionDetail>(API_ENDPOINTS.MOTIONS.DETAIL(id)),

    upload: (formData: FormData) =>
        apiClient.post(API_ENDPOINTS.MOTIONS.UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};
