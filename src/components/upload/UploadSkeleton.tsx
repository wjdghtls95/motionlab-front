'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useThemeStore } from '@/lib/store/theme.store';

export default function UploadSkeleton() {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const card = isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200';
    const bar = isDark ? 'bg-slate-800' : 'bg-gray-200';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <Skeleton className={`h-4 w-20 ${bar}`} />

            {/* 제목 */}
            <Skeleton className={`h-6 w-32 ${bar}`} />

            {/* 카테고리 카드 2개 */}
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className={`rounded-xl p-6 ${card}`}>
                        <div className="flex items-center gap-4">
                            <Skeleton className={`h-10 w-10 rounded-lg ${bar}`} />
                            <div className="space-y-2 flex-1">
                                <Skeleton className={`h-5 w-20 ${bar}`} />
                                <Skeleton className={`h-3 w-40 ${bar}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
