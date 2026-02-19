'use client';

import { useQuery } from '@tanstack/react-query';
import { sportApi } from '@lib/api/sport.api';

/**
 * 운동 종목 조회 훅
 */
export function useSports() {
    return useQuery({
        queryKey: ['sports'],
        queryFn: async () => {
            const res = await sportApi.getList();
            return res.data;
        },
    });
}
