'use client';

import { useThemeStore } from '@/lib/store/theme.store';

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

const COLORS: Record<string, string> = {
    emerald: '#10b981',
    blue: '#3b82f6',
    amber: '#f59e0b',
    purple: '#a855f7',
    rose: '#f43f5e',
    cyan: '#06b6d4',
};

export default function GrowthChart({ series, highlightText }: GrowthChartProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const activeSeries = series.filter((s) => s.data.length > 0);
    if (activeSeries.length === 0) return null;

    // 전체 데이터 범위
    const allValues = activeSeries.flatMap((s) => s.data);
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const pad = Math.max(5, (dataMax - dataMin) * 0.2) || 10;
    const min = Math.max(0, dataMin - pad);
    const max = Math.min(100, dataMax + pad);
    const range = max - min || 1;

    // 전체 날짜 통합 → X축
    const allDates = [...new Set(activeSeries.flatMap((s) => s.dates))].sort();
    const maxPoints = Math.min(allDates.length, 6);
    const xDates = allDates.slice(-maxPoints);

    const W = 360;
    const H = 90;
    const padX = 30;
    const padY = 14;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    const xPos = (dateStr: string) => {
        const idx = xDates.indexOf(dateStr);
        if (idx === -1) return null;
        return padX + (xDates.length === 1 ? chartW / 2 : (idx / (xDates.length - 1)) * chartW);
    };

    // X축 라벨 (MM/DD)
    const xLabels = xDates.map((d) => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return (
        <div className="space-y-1.5">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {/* Grid */}
                {[0, 0.5, 1].map((r) => {
                    const y = padY + chartH * (1 - r);
                    const val = Math.round(min + range * r);
                    return (
                        <g key={r}>
                            <line x1={padX} y1={y} x2={W - padX} y2={y}
                                stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth={0.5}
                                strokeDasharray={r === 0 ? undefined : '2,3'} />
                            <text x={padX - 4} y={y + 3} textAnchor="end"
                                fill={isDark ? '#475569' : '#94a3b8'} fontSize={7}>{val}</text>
                        </g>
                    );
                })}

                {/* X axis labels */}
                {xDates.map((d, i) => {
                    const x = xPos(d);
                    if (x === null) return null;
                    return (
                        <text key={d} x={x} y={H - 1} textAnchor="middle"
                            fill={isDark ? '#475569' : '#94a3b8'} fontSize={7}>{xLabels[i]}</text>
                    );
                })}

                {/* Lines */}
                {activeSeries.map((s) => {
                    const stroke = COLORS[s.color] || s.color;
                    const points = s.dates
                        .map((d, i) => ({ x: xPos(d), y: padY + chartH - ((s.data[i] - min) / range) * chartH, val: s.data[i] }))
                        .filter((p) => p.x !== null) as { x: number; y: number; val: number }[];

                    if (points.length === 0) return null;

                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                    return (
                        <g key={s.label}>
                            {points.length >= 2 && (
                                <path d={pathD} fill="none" stroke={stroke}
                                    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
                            )}
                            {points.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r={3} fill={stroke} />
                                    <circle cx={p.x} cy={p.y} r={1.2} fill="white" />
                                    <text x={p.x} y={p.y - 6} textAnchor="middle"
                                        fill={stroke} fontSize={7} fontWeight={700}>{p.val}</text>
                                </g>
                            ))}
                        </g>
                    );
                })}
            </svg>

            {/* Legend + highlight */}
            <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                    {activeSeries.map((s) => (
                        <div key={s.label} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[s.color] || s.color }} />
                            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{s.label}</span>
                        </div>
                    ))}
                </div>
                {highlightText && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                        {highlightText}
                    </span>
                )}
            </div>
        </div>
    );
}
