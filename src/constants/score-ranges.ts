export const SCORE_RANGES = {
    EXCELLENT: { min: 90, label: '프로급', color: 'text-green-600' },
    GOOD: { min: 80, label: '우수', color: 'text-blue-600' },
    FAIR: { min: 70, label: '양호', color: 'text-yellow-600' },
    POOR: { min: 60, label: '개선 필요', color: 'text-orange-600' },
    BAD: { min: 0, label: '많은 교정 필요', color: 'text-red-600' },
} as const;
