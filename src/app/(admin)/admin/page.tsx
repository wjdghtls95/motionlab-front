'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

/** /admin 접근 시 /admin/users로 redirect */
export default function AdminRootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace(ROUTES.ADMIN.USERS);
    }, [router]);

    return null;
}
