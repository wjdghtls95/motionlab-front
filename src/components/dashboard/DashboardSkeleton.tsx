'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useThemeStore } from '@/lib/store/theme.store';

export default function DashboardSkeleton() {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const card = isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200';
    const bar = isDark ? 'bg-slate-800' : 'bg-gray-200';

    return (
        <div className="space-y-8">
            {/* HeroCard skeleton */}
            <div className={`rounded-2xl p-6 sm:p-8 ${card}`}>
                <Skeleton className={`h-7 w-48 ${bar}`} />
                <Skeleton className={`h-4 w-64 mt-3 ${bar}`} />
                <Skeleton className={`h-12 w-40 mt-5 rounded-xl ${bar}`} />
            </div>

            {/* 성장 기록 skeleton */}
            <div className="space-y-2">
                <Skeleton className={`h-4 w-24 ${bar}`} />
                <div className="flex gap-1">
                    <Skeleton className={`h-7 w-14 rounded-md ${bar}`} />
                    <Skeleton className={`h-7 w-16 rounded-md ${bar}`} />
                </div>
                <div className={`rounded-xl p-4 ${card}`}>
                    <Skeleton className={`h-[90px] w-full rounded-lg ${bar}`} />
                    <div className="flex items-center gap-2 mt-2">
                        <Skeleton className={`h-2 w-2 rounded-full ${bar}`} />
                        <Skeleton className={`h-3 w-10 ${bar}`} />
                    </div>
                </div>
            </div>

            {/* 최근 분석 skeleton */}
            <div className="space-y-3">
                <Skeleton className={`h-4 w-16 ${bar}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`rounded-xl p-5 ${card}`}>
                            <div className="flex items-center justify-between">
                                <Skeleton className={`h-4 w-16 ${bar}`} />
                                <Skeleton className={`h-8 w-10 ${bar}`} />
                            </div>
                            <Skeleton className={`h-3 w-14 mt-2 ${bar}`} />
                            <Skeleton className={`h-3 w-32 mt-1 ${bar}`} />
                        </div>
                    ))}
                    {/* AddAnalysis card 자리 */}
                    <div className={`rounded-xl p-5 border-2 border-dashed flex items-center justify-center ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                        <Skeleton className={`h-8 w-8 rounded-full ${bar}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
