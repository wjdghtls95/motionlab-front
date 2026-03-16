'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { adminApi, AdminUser } from '@/lib/api/admin.api';
import { UserRole } from '@/types/auth';
import { useThemeStore } from '@/lib/store/theme.store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: '관리자',
    USER: '일반',
};

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const theme = useThemeStore((s) => s.theme);
    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const {
        data: users = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => {
            const res = await adminApi.getUsers();
            return res.data;
        },
    });

    const { mutate: toggleRole } = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
            adminApi.updateUserRole(userId, role),
        onMutate: async ({ userId, role }) => {
            // 낙관적 업데이트: 서버 응답 전에 UI에 반영
            await queryClient.cancelQueries({ queryKey: ['admin', 'users'] });
            const previous = queryClient.getQueryData<AdminUser[]>(['admin', 'users']);
            queryClient.setQueryData<AdminUser[]>(['admin', 'users'], (old = []) =>
                old.map((u) => (u.id === userId ? { ...u, role } : u)),
            );
            return { previous };
        },
        onError: (_, __, context) => {
            // 실패 시 이전 상태로 복원
            if (context?.previous) {
                queryClient.setQueryData(['admin', 'users'], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });

    const handleRoleToggle = (user: AdminUser) => {
        const next: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        toggleRole({ userId: user.id, role: next });
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    const thBase = isDark
        ? 'bg-slate-800 text-slate-400 border-b border-slate-700'
        : 'bg-gray-50 text-gray-500 border-b border-gray-200';
    const tdBase = isDark
        ? 'text-slate-300 border-b border-slate-800'
        : 'text-gray-700 border-b border-gray-100';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    사용자 관리
                </h1>
                <button
                    onClick={() => refetch()}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
                        isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                    새로고침
                </button>
            </div>

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            )}

            {isError && !isLoading && (
                <div className="text-center py-10">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        사용자 목록을 불러오지 못했습니다.
                    </p>
                    <Button onClick={() => refetch()} variant="outline" className="mt-3 text-sm">
                        <RefreshCw className="w-4 h-4 mr-1" /> 다시 시도
                    </Button>
                </div>
            )}

            {!isLoading && !isError && (
                <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    ID
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    이름
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    이메일
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    역할
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    가입일
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    액션
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className={`px-4 py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                                    >
                                        사용자가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className={`px-4 py-3 ${tdBase}`}>{user.id}</td>
                                        <td className={`px-4 py-3 font-medium ${tdBase}`}>{user.name}</td>
                                        <td className={`px-4 py-3 ${tdBase}`}>{user.email}</td>
                                        <td className={`px-4 py-3 ${tdBase}`}>
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className={`px-4 py-3 ${tdBase}`}>{formatDate(user.createdAt)}</td>
                                        <td className={`px-4 py-3 ${tdBase}`}>
                                            <button
                                                onClick={() => handleRoleToggle(user)}
                                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                                    user.role === 'ADMIN'
                                                        ? isDark
                                                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        : isDark
                                                            ? 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900'
                                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                            >
                                                {user.role === 'ADMIN'
                                                    ? `${ROLE_LABELS.USER}으로 변경`
                                                    : `${ROLE_LABELS.ADMIN}로 변경`}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                총 {users.length}명
            </p>
        </div>
    );
}

/** 역할 뱃지 컴포넌트 */
function RoleBadge({ role }: { role: UserRole }) {
    const isAdmin = role === 'ADMIN';
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isAdmin
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}
        >
            {ROLE_LABELS[role]}
        </span>
    );
}
