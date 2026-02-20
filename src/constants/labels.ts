/**
 * 기술적 각도명 → 사용자 친화적 한국어 라벨
 */
export const ANGLE_LABELS: Record<string, string> = {
    left_arm_angle: '왼팔 각도',
    right_arm_angle: '오른팔 각도',
    left_knee_angle: '왼쪽 무릎 각도',
    right_knee_angle: '오른쪽 무릎 각도',
    spine_angle: '척추 각도',
    hip_shoulder_separation: '엉덩이-어깨 분리 각도',
    left_elbow_angle: '왼팔꿈치 각도',
    right_elbow_angle: '오른팔꿈치 각도',
    left_hip_angle: '왼쪽 골반 각도',
    right_hip_angle: '오른쪽 골반 각도',
    shoulder_tilt: '어깨 기울기',
    hip_tilt: '골반 기울기',
    head_angle: '머리 각도',
    torso_angle: '상체 각도',
} as const;

/**
 * 기술적 이름을 한국어 라벨로 변환. 매핑에 없으면 원문 반환.
 */
export function toKoreanAngleLabel(rawName: string): string {
    // "left_arm_angle 주의" → "왼팔 각도 주의"
    for (const [key, label] of Object.entries(ANGLE_LABELS)) {
        if (rawName.includes(key)) {
            return rawName.replace(key, label);
        }
    }
    return rawName;
}

/**
 * 스포츠 타입 → 한국어 라벨
 */
export const SPORT_LABELS: Record<string, string> = {
    golf: '골프',
    weight: '웨이트',
} as const;

export function toKoreanSportLabel(sportType: string): string {
    return SPORT_LABELS[sportType] || sportType;
}
