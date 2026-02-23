export const SCORE_RANGES = {
    EXCELLENT: { min: 90, label: '프로급', color: 'text-green-600', hex: '#16a34a' },
    GOOD: { min: 80, label: '우수', color: 'text-blue-600', hex: '#2563eb' },
    FAIR: { min: 70, label: '양호', color: 'text-yellow-600', hex: '#ca8a04' },
    POOR: { min: 60, label: '개선 필요', color: 'text-orange-600', hex: '#ea580c' },
    BAD: { min: 0, label: '많은 교정 필요', color: 'text-red-600', hex: '#dc2626' },
} as const;
