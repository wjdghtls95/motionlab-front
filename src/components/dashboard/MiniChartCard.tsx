'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useThemeStore } from '@/lib/store/theme.store';
import { MINI_CHART_CONFIG } from '@/constants/chart-colors';

interface MiniChartCardProps {
    label: string;
    data: number[];
    color: string;
    totalCount: number;
}

interface DotProps {
    cx?: number;
    cy?: number;
    index?: number;
}

function MiniTooltip({ active, payload, isDark }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    isDark: boolean;
}) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className={`rounded-md px-2 py-1 text-xs font-bold shadow ${isDark
            ? 'bg-slate-800 text-white border border-slate-700'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}>
            {payload[0].value}점
        </div>
    );
}

function MiniDot(props: {
    cx?: number; cy?: number; index?: number;
    dataLength: number; color: string
}) {
    const { cx, cy, index, color } = props;
    if (cx === undefined || cy === undefined || index === undefined) return null;

    return (
        <circle
            cx={cx}
            cy={cy}
            r={MINI_CHART_CONFIG.DOT_RADIUS}
            fill={color}
            stroke={color}
            strokeWidth={MINI_CHART_CONFIG.DOT_STROKE_WIDTH}
            strokeOpacity={0.3}
        />
    );
}

export default function MiniChartCard({ label, data, color, totalCount }: MiniChartCardProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (data.length === 0) return null;

    const max = Math.max(...data);
    const avg = Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 10) / 10;
    const chartData = data.map((val, i) => ({ idx: i + 1, score: val }));

    return (
        <div className={`rounded-xl p-4 transition-all ${isDark
            ? 'bg-slate-900 border border-slate-800 hover:border-slate-700'
            : 'bg-white border border-gray-200 hover:border-gray-300'
        }`}>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                        {label}
                    </span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
                    {totalCount}회
                </span>
            </div>

            {/* 스파크라인 */}
            <div className="mb-3">
                <ResponsiveContainer width="100%" height={MINI_CHART_CONFIG.HEIGHT}>
                    <AreaChart data={chartData} margin={MINI_CHART_CONFIG.MARGIN}>
                        <defs>
                            <linearGradient id={`mini-gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={MINI_CHART_CONFIG.GRADIENT_OPACITY_TOP} />
                                <stop offset="100%" stopColor={color} stopOpacity={MINI_CHART_CONFIG.GRADIENT_OPACITY_BOTTOM} />
                            </linearGradient>
                        </defs>
                        <Tooltip content={<MiniTooltip isDark={isDark} />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke={color}
                            strokeWidth={MINI_CHART_CONFIG.STROKE_WIDTH}
                            fill={`url(#mini-gradient-${label})`}
                            dot={(dotProps: DotProps) => (
                                <MiniDot
                                    key={dotProps.index}
                                    {...dotProps}
                                    dataLength={chartData.length}
                                    color={color}
                                />
                            )}
                            activeDot={(dotProps: DotProps) => {
                                const { cx, cy } = dotProps;
                                if (!cx || !cy) return null;
                                return (
                                    <g>
                                        <circle cx={cx} cy={cy} r={MINI_CHART_CONFIG.DOT_ACTIVE_RADIUS + 2} fill={color} opacity={0.2} />
                                        <circle cx={cx} cy={cy} r={MINI_CHART_CONFIG.DOT_ACTIVE_RADIUS} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={MINI_CHART_CONFIG.DOT_STROKE_WIDTH} strokeOpacity={0.3} />
                                    </g>
                                );
                            }}
                            animationDuration={MINI_CHART_CONFIG.ANIMATION_DURATION}
                            connectNulls
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 통계 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>최고</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{max}</p>
                    </div>
                    <div className={`w-px h-6 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                    <div>
                        <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>평균</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{avg}</p>
                    </div>
                </div>
                {data.length >= 2 && (() => {
                    const diff = data[data.length - 1] - data[data.length - 2];
                    if (diff === 0) return null;
                    return (
                        <div className={`text-xs font-medium ${diff > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                            {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}점
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
