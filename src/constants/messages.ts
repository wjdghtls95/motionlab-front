import { APP_CONFIG } from './config';

export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: '로그인되었습니다',
        LOGIN_FAILED: '이메일 또는 비밀번호를 확인해주세요',
        SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
    },
    UPLOAD: {
        SIZE_EXCEEDED: `영상 크기는 ${APP_CONFIG.MAX_VIDEO_SIZE_MB}MB 이하만 가능합니다`,
        INVALID_TYPE: 'MP4 또는 MOV 파일만 업로드 가능합니다',
        SELECT_REQUIRED: '종목과 영상 파일을 모두 선택해주세요',
        UPLOAD_FAILED: '업로드에 실패했습니다. 다시 시도해주세요',
        UPLOADING: '업로드 중...',
    },
    ANALYSIS: {
        PROCESSING: 'AI가 영상을 분석 중입니다...',
        COMPLETED: '분석이 완료되었습니다',
        FAILED: '분석에 실패했습니다. 다시 시도해주세요',
    },
} as const;
