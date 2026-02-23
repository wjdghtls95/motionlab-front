'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroCard from '@/components/dashboard/HeroCard';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import GrowthChart from '@/components/dashboard/GrowthChart';
import HistoryCardList from '@/components/dashboard/HistoryCardList';
import EmptyState from '@/components/dashboard/EmptyState';
import { motionApi } from '@/lib/api/motion.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useThemeStore } from '@/lib/store/theme.store';
import { MOTION_STATUS } from '@/constants/motion-status';
import { ROUTES } from '@/constants/routes';
import {useSports} from "@lib/hooks/use-sports";
import {CHART_COLORS} from "@constants/chart-colors";
import {toKoreanSportLabel, toKoreanSubCategoryLabel} from "@constants/labels";

export default function HomePage() {
    const user = useAuthStore((s) => s.user);
    const router = useRouter();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const { data: sports } = useSports();

    const { sportTabs, subCategories } = useMemo(() => {
        if (!sports) return { sportTabs: [], subCategories: {} as Record<string, { key: string; label: string; color: string }[]> };

        const colorPool = Object.keys(CHART_COLORS);
        const grouped: Record<string, { key: string; label: string; color: string }[]> = {};
        const tabs: string[] = [];

        for (const sport of sports) {
            if (!grouped[sport.sportType]) {
                grouped[sport.sportType] = [];
                tabs.push(sport.sportType);
            }
            const colorIndex = grouped[sport.sportType].length % colorPool.length;
            grouped[sport.sportType].push({
                key: sport.subCategory,
                label: toKoreanSubCategoryLabel(sport.subCategory),
                color: colorPool[colorIndex],
            });
        }

        return { sportTabs: tabs, subCategories: grouped };
    }, [sports]);

    const [activeSport, setActiveSport] = useState<string>('golf');

    const { data: motions, isLoading, isError, refetch } = useQuery({
        queryKey: ['motions'],
        queryFn: async () => {
            const res = await motionApi.getList();
            return res.data.items;
        },
    });

    const hasMotions = motions && motions.length > 0;

    // 멀티라인 시리즈 빌드
    const chartData = useMemo(() => {
        if (!motions) return null;

        const completed = motions.filter(
            (m) => m.status === MOTION_STATUS.COMPLETED && typeof m.overallScore === 'number',
        );

        const buildSeries = (sport: string) => {
            const sportMotions = completed.filter((m) => m.sportType === sport);
            const subs = subCategories[sport] || [];

            const series = subs.map((sub) => {
                const items = sportMotions
                    .filter((m) => m.subCategory?.toUpperCase() === sub.key.toUpperCase())
                    .sort((a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime())
                    .slice(-5);

                return {
                    label: sub.label,
                    data: items.map((m) => m.overallScore as number),
                    dates: items.map((m) => m.createAt.split('T')[0]),
                    color: sub.color,
                };
            }).filter((s) => s.data.length > 0);

            // 최고 기록 찾기
            let highlightText = '';
            
            if (series.length > 0) {
                let bestLabel = '';
                let bestScore = 0;

                for (const s of series) {
                    const max = Math.max(...s.data);
                    if (max > bestScore) {
                        bestScore = max;
                        bestLabel = s.label;
                    }
                }
                highlightText = `최고: ${bestLabel} ${bestScore}점`;
            }

            return { series, highlightText };
        };

        const result: Record<string, ReturnType<typeof buildSeries>> = {};
        for (const tab of sportTabs) {
            result[tab] = buildSeries(tab);
        }

        return result;
    }, [motions, sportTabs, subCategories]);

    const activeData = chartData?.[activeSport];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            <HeroCard name={user?.name || '사용자'} />

            {isLoading && <DashboardSkeleton />}

            {isError && (
                <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>데이터를 불러오지 못했습니다</p>
                    <Button onClick={() => refetch()} variant="outline" className="mt-3 text-sm">
                        <RefreshCw className="w-4 h-4 mr-1" /> 다시 시도
                    </Button>
                </div>
            )}

            {!isLoading && !isError && (
                <>
                    {/* 성장 기록 — 멀티라인 */}
                    {hasMotions && (
                        <section>
                            <h2 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                나의 성장 기록
                            </h2>

                            <div className="flex gap-1 mb-2">
                                {sportTabs.map((tab) => (
                                    <button key={tab} onClick={() => setActiveSport(tab)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeSport === tab
                                                ? 'bg-emerald-500 text-white'
                                                : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'
                                            }`}>
                                        {toKoreanSportLabel(tab)}
                                    </button>
                                ))}
                            </div>

                            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'}`}>
                                {activeData && activeData.series.length > 0 ? (
                                    <GrowthChart series={activeData.series} highlightText={activeData.highlightText} />
                                ) : (
                                    <div className="text-center py-5 space-y-2">
                                        <Upload className={`w-4 h-4 mx-auto ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                            아직 {toKoreanSportLabel(activeSport)} 분석 기록이 없어요
                                        </p>
                                        <Button onClick={() => router.push(ROUTES.UPLOAD)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-4 h-7">
                                            영상 분석하기
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 최근 분석 */}
                    <section>
                        <h2 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            최근 분석
                        </h2>
                        {hasMotions ? <HistoryCardList motions={motions} /> : <EmptyState />}
                    </section>
                </>
            )}
        </div>
    );
}