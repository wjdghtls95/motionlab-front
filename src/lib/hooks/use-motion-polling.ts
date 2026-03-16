'use client';

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motionApi } from '@lib/api/motion.api';
import { MOTION_STATUS } from '@constants/motion-status';
import { APP_CONFIG } from '@constants/config';

const TERMINAL_STATUSES = [MOTION_STATUS.COMPLETED, MOTION_STATUS.FAILED] as const;

type TerminalStatus = typeof TERMINAL_STATUSES[number];

/**
 * 분석 폴링 훅
 *
 * - COMPLETED 또는 FAILED 상태가 되면 폴링 중단
 * - 마운트 후 MAX_POLL_DURATION_MS(10분) 경과 시 폴링 중단 → isTimedOut: true
 */
export function useMotionPolling(motionId: number | null) {
    // eslint-disable-next-line react-hooks/purity
    const startedAt = useRef(Date.now());

    const query = useQuery({
        queryKey: ['motion', motionId],
        queryFn: async () => {
            const res = await motionApi.getDetail(motionId!);
            return res.data;
        },
        enabled: motionId !== null,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status && TERMINAL_STATUSES.includes(status as TerminalStatus)) {
                return false;
            }
            if (Date.now() - startedAt.current > APP_CONFIG.MAX_POLL_DURATION_MS) {
                return false;
            }
            return APP_CONFIG.POLLING_INTERVAL;
        },
    });

    const status = query.data?.status;
    const isTerminal = status !== undefined && TERMINAL_STATUSES.includes(status as TerminalStatus);
    // eslint-disable-next-line react-hooks/purity
    const isTimedOut = !isTerminal && Date.now() - startedAt.current > APP_CONFIG.MAX_POLL_DURATION_MS;

    return { ...query, isTimedOut };
}
