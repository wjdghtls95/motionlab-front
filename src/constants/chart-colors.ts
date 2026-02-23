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

export const MINI_CHART_CONFIG = {
    HEIGHT: 70,
    MARGIN: { top: 12, right: 16, left: 16, bottom: 4 },
    DOT_RADIUS: 4,
    DOT_ACTIVE_RADIUS: 6,
    DOT_STROKE_WIDTH: 2,
    DOT_EDGE_OFFSET: 4,        // 첫·마지막 점의 좌우 밀기 px
    GRADIENT_OPACITY_TOP: 0.2,
    GRADIENT_OPACITY_BOTTOM: 0,
    STROKE_WIDTH: 2,
    ANIMATION_DURATION: 600,
} as const;

export const GROWTH_CHART_CONFIG = {
    HEIGHT: 200,
    MARGIN: { top: 10, right: 16, left: -10, bottom: 0 },
    X_PADDING: { left: 20, right: 20 },
    MAX_POINTS: 6,
    DOT_RADIUS: 4,
    DOT_ACTIVE_RADIUS: 5,
    DOT_ACTIVE_GLOW_RADIUS: 8,
    DOT_ACTIVE_GLOW_OPACITY: 0.2,
    DOT_STROKE_WIDTH: 2,
    LINE_STROKE_WIDTH: 2.5,
    GRADIENT_OPACITY_TOP: 0.15,
    GRADIENT_OPACITY_BOTTOM: 0,
    GRID_DASH: '3 3',
    CURSOR_DASH: '4 4',
    CURSOR_WIDTH: 1,
    Y_STEP: 5,
    Y_TICK_COUNT: 4,
    FONT_SIZE: 11,
    LEGEND_FONT_SIZE: 11,
    ANIMATION_DURATION: 800,
    ANIMATION_EASING: 'ease-out' as const,
} as const;