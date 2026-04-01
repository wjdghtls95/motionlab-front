'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
 * - setTimeout으로 타임아웃 시점에 강제 리렌더하여 UI 즉시 전환 보장
 */
export function useMotionPolling(motionId: number | null) {
    const [isTimedOut, setIsTimedOut] = useState(false);

    const query = useQuery({
        queryKey: ['motion', motionId],
        queryFn: async () => {
            const res = await motionApi.getDetail(motionId!);
            return res.data;
        },
        enabled: motionId !== null,
        // 404는 재시도해도 의미 없으므로 즉시 중단한다
        retry: (failureCount, error) => {
            if (axios.isAxiosError(error) && error.response?.status === 404) return false;
            return failureCount < 3;
        },
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status && TERMINAL_STATUSES.includes(status as TerminalStatus)) {
                return false;
            }
            if (isTimedOut) {
                return false;
            }
            return APP_CONFIG.POLLING_INTERVAL;
        },
    });

    // 타임아웃 시점에 강제 리렌더하여 UI 즉시 전환 보장
    useEffect(() => {
        if (!motionId) return;

        const timer = setTimeout(() => {
            const status = query.data?.status;
            const isTerminal = status !== undefined && TERMINAL_STATUSES.includes(status as TerminalStatus);
            if (!isTerminal) {
                setIsTimedOut(true);
            }
        }, APP_CONFIG.MAX_POLL_DURATION_MS);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motionId]);

    // terminal 상태 도달 시 타임아웃 플래그 해제
    const status = query.data?.status;
    const isTerminal = status !== undefined && TERMINAL_STATUSES.includes(status as TerminalStatus);
    const isNotFound = query.isError && axios.isAxiosError(query.error) && query.error.response?.status === 404;

    return { ...query, isTimedOut: isTimedOut && !isTerminal, isNotFound };
}
