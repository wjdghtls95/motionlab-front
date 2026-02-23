'use client';

import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, ComposedChart, Line,
} from 'recharts';
import { useThemeStore } from '@/lib/store/theme.store';
import { CHART_COLORS, GROWTH_CHART_CONFIG } from '@/constants/chart-colors';

interface Series {
    label: string;
    data: number[];
    dates: string[];
    color: string;
}

interface GrowthChartProps {
    series: Series[];
    highlightText?: string;
}

const CFG = GROWTH_CHART_CONFIG;

/* ── 차트 데이터 빌드 (분석 건 = 회차, 최근 N회차) ── */
function buildChartData(series: Series[]) {
    const activeSeries = series.filter((s) => s.data.length > 0);
    const maxLen = Math.min(
        Math.max(...activeSeries.map((s) => s.data.length), 0),
        CFG.MAX_POINTS
    );

    return Array.from({ length: maxLen }, (_, i) => {
        const entry: Record<string, string | number | null> = {
            label: `${i + 1}회차`,
        };
        for (const s of activeSeries) {
            const startIdx = Math.max(0, s.data.length - maxLen);
            const dataIdx = startIdx + i;
            entry[s.label] = dataIdx < s.data.length ? s.data[dataIdx] : null;
        }
        return entry;
    });
}

/* ── 커스텀 툴팁 ── */
function CustomTooltip({ active, payload, label, isDark }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
    label?: string;
    isDark: boolean;
}) {
    if (!active || !payload || payload.length === 0) return null;

    const filtered = payload.filter(
        (p) => p.value !== null && p.value !== undefined
            && !String(p.name).startsWith('area-')
    );
    if (filtered.length === 0) return null;

    return (
        <div className={`rounded-lg px-3 py-2 shadow-lg border ${isDark
            ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
        }`}>
            <p className={`text-[10px] mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{label}</p>
            {filtered.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>{p.name}</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.value}점</span>
                </div>
            ))}
        </div>
    );
}

/* ── 커스텀 dot (기본 상태) ── */
function CustomDot(props: { cx?: number; cy?: number; stroke?: string; value?: number | null }) {
    const { cx, cy, stroke, value } = props;
    if (!cx || !cy || value === null || value === undefined) return null;
    const color = stroke || '#10b981';
    return (
        <circle
            cx={cx} cy={cy}
            r={CFG.DOT_RADIUS}
            fill={color}
            stroke={color}
            strokeWidth={CFG.DOT_STROKE_WIDTH}
            strokeOpacity={0.3}
        />
    );
}

/* ── 커스텀 dot (hover 상태 — 같은 색 글로우) ── */
function CustomActiveDot(props: { cx?: number; cy?: number; stroke?: string }) {
    const { cx, cy, stroke } = props;
    if (!cx || !cy) return null;
    const color = stroke || '#10b981';
    return (
        <g>
            <circle cx={cx} cy={cy} r={CFG.DOT_ACTIVE_GLOW_RADIUS} fill={color} opacity={CFG.DOT_ACTIVE_GLOW_OPACITY} />
            <circle cx={cx} cy={cy} r={CFG.DOT_ACTIVE_RADIUS} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={CFG.DOT_STROKE_WIDTH} strokeOpacity={0.3} />
        </g>
    );
}

/* ── 메인 컴포넌트 ── */
export default function GrowthChart({ series, highlightText }: GrowthChartProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const activeSeries = series.filter((s) => s.data.length > 0);
    if (activeSeries.length === 0) return null;

    const chartData = buildChartData(series);

    const allValues = activeSeries.flatMap((s) => s.data);
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const yMin = Math.max(0, Math.floor((dataMin - CFG.Y_STEP) / CFG.Y_STEP) * CFG.Y_STEP);
    const yMax = Math.min(100, Math.ceil((dataMax + CFG.Y_STEP) / CFG.Y_STEP) * CFG.Y_STEP);

    return (
        <div className="space-y-2">
            <ResponsiveContainer width="100%" height={CFG.HEIGHT}>
                <ComposedChart data={chartData} margin={CFG.MARGIN}>
                    <defs>
                        {activeSeries.map((s) => {
                            const hex = CHART_COLORS[s.color as keyof typeof CHART_COLORS] || s.color;
                            return (
                                <linearGradient key={s.label} id={`gradient-${s.label}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={hex} stopOpacity={CFG.GRADIENT_OPACITY_TOP} />
                                    <stop offset="100%" stopColor={hex} stopOpacity={CFG.GRADIENT_OPACITY_BOTTOM} />
                                </linearGradient>
                            );
                        })}
                    </defs>

                    <CartesianGrid
                        strokeDasharray={CFG.GRID_DASH}
                        stroke={isDark ? '#1e293b' : '#f1f5f9'}
                        vertical={false}
                    />

                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: CFG.FONT_SIZE, fill: isDark ? '#475569' : '#94a3b8' }}
                        dy={8}
                        padding={CFG.X_PADDING}
                    />

                    <YAxis
                        domain={[yMin, yMax]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: CFG.FONT_SIZE, fill: isDark ? '#475569' : '#94a3b8' }}
                        dx={-4}
                        tickCount={CFG.Y_TICK_COUNT}
                    />

                    <Tooltip
                        content={<CustomTooltip isDark={isDark} />}
                        cursor={{
                            stroke: isDark ? '#334155' : '#e2e8f0',
                            strokeWidth: CFG.CURSOR_WIDTH,
                            strokeDasharray: CFG.CURSOR_DASH,
                        }}
                    />

                    {activeSeries.map((s) => {
                        return (
                            <Area
                                key={`area-${s.label}`}
                                type="monotone"
                                dataKey={s.label}
                                name={`area-${s.label}`}
                                stroke="none"
                                fill={`url(#gradient-${s.label})`}
                                connectNulls
                                tooltipType="none"
                                legendType="none"
                                dot={false}
                                activeDot={false}
                                animationDuration={CFG.ANIMATION_DURATION}
                            />
                        );
                    })}

                    {activeSeries.map((s) => {
                        const hex = CHART_COLORS[s.color as keyof typeof CHART_COLORS] || s.color;
                        return (
                            <Line
                                key={s.label}
                                type="monotone"
                                dataKey={s.label}
                                stroke={hex}
                                strokeWidth={CFG.LINE_STROKE_WIDTH}
                                dot={<CustomDot />}
                                activeDot={<CustomActiveDot />}
                                connectNulls
                                animationDuration={CFG.ANIMATION_DURATION}
                                animationEasing={CFG.ANIMATION_EASING}
                            />
                        );
                    })}
                </ComposedChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1 px-1">
                <div className="flex items-center gap-4 flex-wrap">
                    {activeSeries.map((s) => (
                        <div key={s.label} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[s.color as keyof typeof CHART_COLORS] || s.color }} />
                            <span className={isDark ? 'text-slate-400' : 'text-gray-500'} style={{ fontSize: CFG.LEGEND_FONT_SIZE }}>                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
                {highlightText && (
                    <span className={isDark ? 'text-slate-400' : 'text-gray-500'} style={{ fontSize: CFG.LEGEND_FONT_SIZE }}>                        {highlightText}
                    </span>
                )}
            </div>
        </div>
    );
}
