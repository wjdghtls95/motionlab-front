'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, Plus, RefreshCw, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin.api';
import { Sport, sportApi } from '@/lib/api/sport.api';
import { useThemeStore } from '@/lib/store/theme.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toKoreanSportLabel, toKoreanSubCategoryLabel } from '@constants/labels';

/** 서버에서 지원하는 종목 타입 목록 */
const SPORT_TYPE_OPTIONS = [
    { value: 'golf', label: '골프' },
    { value: 'weight', label: '웨이트' },
    { value: 'tennis', label: '테니스' },
    { value: 'soccer', label: '축구' },
    { value: 'basketball', label: '농구' },
    { value: 'baseball', label: '야구' },
    { value: 'running', label: '러닝' },
    { value: 'pilates', label: '필라테스' },
];

export default function AdminSportsPage() {
    const queryClient = useQueryClient();
    const theme = useThemeStore((s) => s.theme);
    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 종목 추가 폼 상태
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSportType, setNewSportType] = useState('golf');
    const [newDescription, setNewDescription] = useState('');

    // 인라인 편집 상태 (편집 중인 sportId → 임시 description)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editDescription, setEditDescription] = useState('');

    const {
        data: sports = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ['sports'],
        queryFn: async () => {
            const res = await sportApi.getList();
            return res.data;
        },
    });

    const { mutate: createSport, isPending: isCreating } = useMutation({
        mutationFn: () => adminApi.createSport(newSportType, newDescription || undefined),
        onSuccess: () => {
            setShowAddForm(false);
            setNewSportType('golf');
            setNewDescription('');
            queryClient.invalidateQueries({ queryKey: ['sports'] });
        },
    });

    const { mutate: updateSport } = useMutation({
        mutationFn: ({ sportId, description }: { sportId: number; description: string }) =>
            adminApi.updateSport(sportId, description),
        onMutate: async ({ sportId, description }) => {
            // 낙관적 업데이트: 설명 즉시 반영
            await queryClient.cancelQueries({ queryKey: ['sports'] });
            const previous = queryClient.getQueryData<Sport[]>(['sports']);
            queryClient.setQueryData<Sport[]>(['sports'], (old = []) =>
                old.map((s) => (s.id === sportId ? { ...s, description } : s)),
            );
            return { previous };
        },
        onError: (_, __, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['sports'], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['sports'] });
            setEditingId(null);
        },
    });

    const { mutate: deactivateSport } = useMutation({
        mutationFn: (sportId: number) => adminApi.deactivateSport(sportId),
        onMutate: async (sportId) => {
            // 낙관적 업데이트: 목록에서 즉시 제거
            await queryClient.cancelQueries({ queryKey: ['sports'] });
            const previous = queryClient.getQueryData<Sport[]>(['sports']);
            queryClient.setQueryData<Sport[]>(['sports'], (old = []) =>
                old.filter((s) => s.id !== sportId),
            );
            return { previous };
        },
        onError: (_, __, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['sports'], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['sports'] });
        },
    });

    const startEdit = (sport: Sport) => {
        setEditingId(sport.id);
        setEditDescription(sport.description ?? '');
    };

    const cancelEdit = () => setEditingId(null);

    const confirmEdit = (sportId: number) => {
        updateSport({ sportId, description: editDescription });
    };

    const thBase = isDark
        ? 'bg-slate-800 text-slate-400 border-b border-slate-700'
        : 'bg-gray-50 text-gray-500 border-b border-gray-200';
    const tdBase = isDark
        ? 'text-slate-300 border-b border-slate-800'
        : 'text-gray-700 border-b border-gray-100';
    const inputBase = isDark
        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    종목 관리
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
                            isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                        새로고침
                    </button>
                    <button
                        onClick={() => setShowAddForm((v) => !v)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            isDark
                                ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                    >
                        <Plus className="w-3 h-3" />
                        종목 추가
                    </button>
                </div>
            </div>

            {/* 종목 추가 폼 */}
            {showAddForm && (
                <div
                    className={`p-4 rounded-lg border space-y-3 ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                    }`}
                >
                    <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        새 종목 추가
                    </h2>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                종목
                            </label>
                            <select
                                value={newSportType}
                                onChange={(e) => setNewSportType(e.target.value)}
                                className={`h-9 px-3 text-sm rounded-md border ${inputBase}`}
                            >
                                {SPORT_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                설명 (선택)
                            </label>
                            <Input
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="종목 설명을 입력하세요"
                                className={`text-sm ${inputBase}`}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className={`px-3 py-1.5 text-xs rounded-md ${
                                isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            취소
                        </button>
                        <Button
                            size="sm"
                            onClick={() => createSport()}
                            disabled={isCreating}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                        >
                            {isCreating ? '추가 중...' : '추가'}
                        </Button>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            )}

            {isError && !isLoading && (
                <div className="text-center py-10">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        종목 목록을 불러오지 못했습니다.
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
                                    종목
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    서브카테고리
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    설명
                                </th>
                                <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${thBase}`}>
                                    액션
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sports.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className={`px-4 py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                                    >
                                        등록된 종목이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                sports.map((sport) => (
                                    <tr
                                        key={sport.id}
                                        className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className={`px-4 py-3 ${tdBase}`}>{sport.id}</td>
                                        <td className={`px-4 py-3 font-medium ${tdBase}`}>
                                            {toKoreanSportLabel(sport.sportType)}
                                        </td>
                                        <td className={`px-4 py-3 ${tdBase}`}>
                                            {toKoreanSubCategoryLabel(sport.subCategory)}
                                        </td>
                                        <td className={`px-4 py-3 ${tdBase} min-w-[200px]`}>
                                            {editingId === sport.id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Input
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        className={`h-7 text-xs ${inputBase}`}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') confirmEdit(sport.id);
                                                            if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => confirmEdit(sport.id)}
                                                        className="text-emerald-500 hover:text-emerald-400 flex-shrink-0"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className={`flex-shrink-0 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 group">
                                                    <span className={`text-xs ${sport.description ? '' : isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                                                        {sport.description || '—'}
                                                    </span>
                                                    <button
                                                        onClick={() => startEdit(sport)}
                                                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 ${tdBase}`}>
                                            <button
                                                onClick={() => deactivateSport(sport.id)}
                                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                                    isDark
                                                        ? 'bg-red-900/40 text-red-400 hover:bg-red-900/70'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                            >
                                                비활성화
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
                총 {sports.length}개 종목
            </p>
        </div>
    );
}
