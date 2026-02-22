'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useThemeStore } from '@/lib/store/theme.store';

export default function HistorySkeleton() {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const card = isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200';
    const bar = isDark ? 'bg-slate-800' : 'bg-gray-200';

    return (
        <div className="space-y-5">
            {/* 필터 영역 */}
            <div className="flex gap-1.5">
                <Skeleton className={`h-8 w-14 rounded-lg ${bar}`} />
                <Skeleton className={`h-8 w-14 rounded-lg ${bar}`} />
                <Skeleton className={`h-8 w-16 rounded-lg ${bar}`} />
            </div>

            {/* 카드 그리드 6개 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={`rounded-xl p-5 ${card}`}>
                        <div className="flex items-center justify-between">
                            <Skeleton className={`h-4 w-16 ${bar}`} />
                            <Skeleton className={`h-7 w-10 ${bar}`} />
                        </div>
                        <Skeleton className={`h-3 w-14 mt-2 ${bar}`} />
                        <Skeleton className={`h-3 w-28 mt-1 ${bar}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}
