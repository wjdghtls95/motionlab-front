'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ArrowUpDown, Check } from 'lucide-react';
import HistorySkeleton from '@/components/history/HistorySkeleton';
import { Button } from '@/components/ui/button';
import HistoryCard from '@/components/dashboard/HistoryCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { motionApi } from '@/lib/api/motion.api';
import { useThemeStore } from '@/lib/store/theme.store';
import { ROUTES } from '@/constants/routes';
import { MOTION_STATUS } from '@/constants/motion-status';
import type { MotionListItem } from '@/types/motion';
import {toKoreanSportLabel, toKoreanSubCategoryLabel} from "@constants/labels";
import {useSports} from "@lib/hooks/use-sports";

type SortOrder = 'newest' | 'oldest';

export default function HistoryPage() {
    const router = useRouter();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const { data: sports } = useSports();

    // 동적 서브카테고리 맵
    const { sportTabs, subCategoryMap } = useMemo(() => {
        if (!sports) return { sportTabs: [] as string[], subCategoryMap: {} as Record<string, { key: string; label: string }[]> };

        const tabs: string[] = [];
        const map: Record<string, { key: string; label: string }[]> = {};

        for (const sport of sports) {
            if (!map[sport.sportType]) {
                map[sport.sportType] = [];
                tabs.push(sport.sportType);
            }
            map[sport.sportType].push({
                key: sport.subCategory,
                label: toKoreanSubCategoryLabel(sport.subCategory),
            });
        }

        return { sportTabs: tabs, subCategoryMap: map };
    }, [sports]);

    const [sport, setSport] = useState<string | null>(null);
    const [sub, setSub] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    const { data: motions, isLoading, isError, refetch } = useQuery({
        queryKey: ['motions'],
        queryFn: async () => {
            const res = await motionApi.getList();
            return res.data.items;
        },
    });

    // 완료된 분석만 표시
    const filtered = useMemo(() => {
        if (!motions) return [];
        let result = motions.filter((m) => m.status === MOTION_STATUS.COMPLETED);

        if (sport) result = result.filter((m) => m.sportType === sport);
        if (sub) result = result.filter((m) => m.subCategory?.toUpperCase() === sub);

        result.sort((a, b) => {
            const da = new Date(a.createAt).getTime();
            const db = new Date(b.createAt).getTime();
            return sortOrder === 'newest' ? db - da : da - db;
        });

        return result;
    }, [motions, sport, sub, sortOrder]);

    // 서브카테고리 그룹핑 (종목 선택 + 서브 미선택 시)
    const grouped = useMemo(() => {
        if (!sport || sub) return null;
        const groups: Record<string, MotionListItem[]> = {};
        for (const m of filtered) {
            const k = m.subCategory?.toUpperCase() || 'OTHER';
            if (!groups[k]) groups[k] = [];
            groups[k].push(m);
        }
        const order = subCategoryMap[sport]?.map((s) => s.key) || [];
        order.push('OTHER');
        return Object.entries(groups).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
    }, [filtered, sport, sub, subCategoryMap]);

    const handleSport = (s: string | null) => {
        setSport(s);
        setSub(null);
    };

    const btnClass = (active: boolean, size: 'md' | 'sm' = 'md') =>
        `${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-xs'} font-medium rounded-lg transition-all ${active
            ? 'bg-emerald-500 text-white'
            : isDark
                ? size === 'sm' ? 'text-slate-500 border border-slate-700 hover:border-slate-500' : 'text-slate-400 hover:bg-slate-800'
                : size === 'sm' ? 'text-gray-400 border border-gray-200 hover:border-gray-400' : 'text-gray-500 hover:bg-gray-100'
        }`;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
            <div className="flex items-center justify-between">
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    내 분석
                </h1>
                <button onClick={() => setSortOrder((o) => o === 'newest' ? 'oldest' : 'newest')}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}`}>
                    <ArrowUpDown className="w-3 h-3" />
                    {sortOrder === 'newest' ? '최신순' : '오래된순'}
                </button>
            </div>

            {/* 캐스케이딩 필터 */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {/* 전체 */}
                <button onClick={() => handleSport(null)}
                    className={btnClass(sport === null)}>
                    전체 {sport === null && <Check className="w-3 h-3 inline ml-0.5" />}
                </button>

                {/* 종목 */}
                {sportTabs.map((tab) => (
                    <button key={tab} onClick={() => handleSport(tab)}
                            className={btnClass(sport === tab)}>
                        {toKoreanSportLabel(tab)} {sport === tab && <Check className="w-3 h-3 inline ml-0.5" />}
                    </button>
                ))}

                {/* 서브카테고리 칩 — 종목 선택 시만 */}
                {sport && (
                    <>
                        <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`} />
                        {subCategoryMap[sport]?.map((s) => (
                            <button key={s.key} onClick={() => setSub(sub === s.key ? null : s.key)}
                                className={btnClass(sub === s.key, 'sm')}>
                                {s.label}
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* Loading */}
            {isLoading && <HistorySkeleton />}

            {isError && (
                <div className="text-center py-10">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>데이터를 불러오지 못했습니다</p>
                    <Button onClick={() => refetch()} variant="outline" className="mt-3 text-sm">
                        <RefreshCw className="w-4 h-4 mr-1" /> 다시 시도
                    </Button>
                </div>
            )}

            {/* List */}
            {!isLoading && !isError && (
                filtered.length > 0 ? (
                    grouped ? (
                        <div className="space-y-6">
                            {grouped.map(([subKey, items]) => (
                                <div key={subKey}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                                            {toKoreanSubCategoryLabel(subKey)}
                                        </h3>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
                                            {items.length}건
                                        </span>
                                        <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {items.map((m) => (
                                            <HistoryCard key={m.id} motion={m}
                                                onClick={() => router.push(ROUTES.RESULT(m.id))} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filtered.map((m) => (
                                <HistoryCard key={m.id} motion={m}
                                    onClick={() => router.push(ROUTES.RESULT(m.id))} />
                            ))}
                        </div>
                    )
                ) : (
                    <EmptyState />
                )
            )}
        </div>
    );
}
