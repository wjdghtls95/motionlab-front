'use client';

import { useQuery } from '@tanstack/react-query';
import { motionApi } from '@lib/api/motion.api';
import { MOTION_STATUS } from '@constants/motion-status';
import { APP_CONFIG } from '@constants/config';

/**
 * 분석 폴링 훅
 */
export function useMotionPolling(motionId: number | null) {
    return useQuery({
        queryKey: ['motion', motionId],
        queryFn: async () => {
            const res = await motionApi.getDetail(motionId!);
            return res.data;
        },
        enabled: motionId !== null,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === MOTION_STATUS.COMPLETED || status === MOTION_STATUS.FAILED) {
                return false;
            }
            return APP_CONFIG.POLLING_INTERVAL;
        },
    });
}
