'use client';

import { useRouter } from 'next/navigation';
import HistoryCard from './HistoryCard';
import AddAnalysisCard from './AddAnalysisCard';
import { ROUTES } from '@/constants/routes';
import { MOTION_STATUS } from '@/constants/motion-status';
import type { MotionListItem } from '@/types/motion';
import {MESSAGES} from "@constants/messages";
import {APP_CONFIG} from "@constants/config";

interface HistoryCardListProps {
    motions: MotionListItem[];
}

const MICRO_COPIES: Record<string, string> = {
    [MOTION_STATUS.COMPLETED]: MESSAGES.MICRO_COPY.COMPLETED,
    [MOTION_STATUS.PROCESSING]: MESSAGES.MICRO_COPY.PROCESSING,
    [MOTION_STATUS.PENDING]: MESSAGES.MICRO_COPY.PROCESSING,
    [MOTION_STATUS.FAILED]: MESSAGES.MICRO_COPY.FAILED,
};

export default function HistoryCardList({ motions }: HistoryCardListProps) {
    const router = useRouter();
    const recent = motions
        .filter((m) => m.status === MOTION_STATUS.COMPLETED)
        .slice(0, APP_CONFIG.RECENT_ANALYSIS_COUNT);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map((motion) => (
                <HistoryCard
                    key={motion.id}
                    motion={motion}
                    onClick={() => router.push(ROUTES.RESULT(motion.id))}
                    microCopy={MICRO_COPIES[motion.status] || ''}
                />
            ))}
            <AddAnalysisCard onClick={() => router.push(ROUTES.UPLOAD)} />
        </div>
    );
}
