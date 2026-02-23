/**
 * 차트 색상 매핑 — GrowthChart, HomePage에서 공유
 * 서브카테고리 index 기반으로 자동 배정 (서버 데이터 대응)
 */
export const CHART_COLORS = {
    emerald: '#10b981',
    blue: '#3b82f6',
    amber: '#f59e0b',
    purple: '#a855f7',
    rose: '#f43f5e',
    cyan: '#06b6d4',
} as const;

/** 색상 키 배열 — 서브카테고리 index로 자동 배정 시 사용 */
export const CHART_COLOR_KEYS = Object.keys(CHART_COLORS) as (keyof typeof CHART_COLORS)[];

/** 색상 키 → hex 변환. 폴백: #94a3b8 */
export function getChartColorHex(colorKey: string): string {
    return (CHART_COLORS as Record<string, string>)[colorKey] ?? '#94a3b8';
}
