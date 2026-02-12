'use client';

import { useAuthStore } from '@lib/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@constants/routes';

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(ROUTES.LOGIN);
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold">MotionLab</h1>
            <p className="mt-2 text-gray-500">
                {user?.nickname}님, 환영합니다
            </p>
        </div>
    );
}