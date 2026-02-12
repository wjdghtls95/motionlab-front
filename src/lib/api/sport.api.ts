import apiClient from './client';
import { API_ENDPOINTS } from '@constants/api-endpoints';

export interface Sport {
    id: number;
    sportType: string;
    subCategory: string;
    description: string;
    isActive: boolean;
}

export const sportApi = {
    getList: () =>
        apiClient.get<Sport[]>(API_ENDPOINTS.SPORTS.LIST),
};