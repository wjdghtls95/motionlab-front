export const APP_CONFIG = {
    /* ── 앱 기본 ── */
    APP_NAME: 'MotionLab',

    /* ── 네트워크 ── */
    POLLING_INTERVAL: 3000,             // 분석 상태 폴링 주기 (ms)
    API_TIMEOUT: 30000,                 // API 요청 타임아웃 (ms)

    /* ── 인증 ── */
    ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 액세스 토큰 만료 (15분)

    /* ── 업로드 ── */
    MAX_VIDEO_SIZE_MB: 100,             // 최대 영상 크기 (MB)
    ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],

    /* ── 분석 ── */
    ANALYSIS_WARNING_SECONDS: 60,       // 분석 지연 경고 표시 (초)
    ANALYSIS_ESTIMATED_SECONDS: 20,     // 예상 분석 시간 (초, 프로그레스 바 기준)
    RECENT_ANALYSIS_COUNT: 3,           // 홈 최근 분석 표시 개수

    /* ── 팁 카드 ── */
    TIP_ROTATION_INTERVAL: 5000,        // 자동 팁 전환 주기 (ms)
    TIP_AUTO_RESUME_DELAY: 10000,       // 수동 조작 후 자동 전환 재개 대기 (ms)
    PROGRESS_UPDATE_INTERVAL: 500,      // 프로그레스 바 업데이트 주기 (ms)

    /* ── 각도 분석 ── */
    LOW_ANGLE_SCALE: 0,                 // 각도 바 최소값
    MAX_ANGLE_SCALE: 180,               // 각도 바 최대값
} as const;