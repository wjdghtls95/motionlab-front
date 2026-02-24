'use client';

import { useThemeStore } from '@/lib/store/theme.store';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResultSkeleton() {
    const theme = useThemeStore((s) => s.theme);
    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const cardClass = isDark
        ? 'bg-slate-900 border border-slate-800'
        : 'bg-white border border-gray-200';
    const barClass = isDark ? 'bg-slate-800' : 'bg-gray-200';

    return (
        <div className="flex flex-col items-center px-4 py-6 gap-6 max-w-md mx-auto w-full">
            {/* ScoreGauge 영역 - 원형 스켈레톤 */}
            <div className="flex flex-col items-center gap-3 mt-2">
                <Skeleton className={`w-40 h-40 rounded-full ${barClass}`} />
                {/* 점수 텍스트 */}
                <Skeleton className={`w-16 h-6 rounded ${barClass}`} />
                {/* 종목 라벨 */}
                <Skeleton className={`w-28 h-5 rounded-full ${barClass}`} />
            </div>

            {/* AI 피드백 카드 스켈레톤 */}
            <div className={`w-full rounded-xl p-5 ${cardClass}`}>
                <Skeleton className={`w-32 h-5 rounded mb-3 ${barClass}`} />
                <Skeleton className={`w-full h-4 rounded mb-2 ${barClass}`} />
                <Skeleton className={`w-full h-4 rounded mb-2 ${barClass}`} />
                <Skeleton className={`w-3/4 h-4 rounded ${barClass}`} />
            </div>

            {/* 개선점 카드 2개 스켈레톤 */}
            {[1, 2].map((i) => (
                <div key={i} className={`w-full rounded-xl p-4 ${cardClass}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <Skeleton className={`w-8 h-8 rounded-full ${barClass}`} />
                        <Skeleton className={`w-36 h-5 rounded ${barClass}`} />
                    </div>
                    <Skeleton className={`w-full h-4 rounded mb-2 ${barClass}`} />
                    <Skeleton className={`w-5/6 h-4 rounded ${barClass}`} />
                </div>
            ))}

            {/* 각도 비교 바 스켈레톤 */}
            <div className={`w-full rounded-xl p-4 ${cardClass}`}>
                <Skeleton className={`w-28 h-5 rounded mb-3 ${barClass}`} />
                <Skeleton className={`w-full h-6 rounded-full ${barClass}`} />
                <div className="flex justify-between mt-2">
                    <Skeleton className={`w-12 h-4 rounded ${barClass}`} />
                    <Skeleton className={`w-12 h-4 rounded ${barClass}`} />
                </div>
            </div>

            {/* 하단 버튼 스켈레톤 */}
            <div className="w-full flex gap-3 mt-2">
                <Skeleton className={`flex-1 h-11 rounded-xl ${barClass}`} />
                <Skeleton className={`flex-1 h-11 rounded-xl ${barClass}`} />
            </div>
        </div>
    );
}
