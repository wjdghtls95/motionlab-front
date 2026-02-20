'use client';

import { useRouter } from 'next/navigation';
import HistoryCard from './HistoryCard';
import AddAnalysisCard from './AddAnalysisCard';
import { ROUTES } from '@/constants/routes';
import { MOTION_STATUS } from '@/constants/motion-status';
import type { MotionListItem } from '@/types/motion';

interface HistoryCardListProps {
    motions: MotionListItem[];
}

const MICRO_COPIES: Record<string, string> = {
    [MOTION_STATUS.COMPLETED]: '점수를 더 올려보세요!',
    [MOTION_STATUS.PROCESSING]: '곧 결과가 나옵니다',
    [MOTION_STATUS.PENDING]: '곧 결과가 나옵니다',
    [MOTION_STATUS.FAILED]: '다시 시도해보세요',
};

export default function HistoryCardList({ motions }: HistoryCardListProps) {
    const router = useRouter();
    const recent = motions
        .filter((m) => m.status === MOTION_STATUS.COMPLETED)
        .slice(0, 3);

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
