'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useThemeStore } from '@/lib/store/theme.store';

export default function NotFound() {
    const router = useRouter();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div
            className={`min-h-screen flex flex-col items-center justify-center gap-6 px-4 ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'
                }`}
        >
            <div className="text-center">
                <p className="text-7xl font-bold text-emerald-500">404</p>
                <h1 className="mt-4 text-2xl font-bold">
                    페이지를 찾을 수 없습니다
                </h1>
                <p
                    className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}
                >
                    요청하신 페이지가 존재하지 않거나 이동되었습니다
                </p>
            </div>
            <Button
                onClick={() => router.push(ROUTES.HOME)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-6"
            >
                홈으로 돌아가기
            </Button>
        </div>
    );
}
