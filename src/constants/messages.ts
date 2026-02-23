import { APP_CONFIG } from './config';

export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: '로그인되었습니다',
        LOGIN_FAILED: '이메일 또는 비밀번호를 확인해주세요',
        SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
        REGISTER_SUCCESS: '회원가입이 완료되었습니다',
        REGISTER_FAILED: '회원가입에 실패했습니다. 다시 시도해주세요',
        EMAIL_REQUIRED: '이메일을 입력해주세요',
        PASSWORD_REQUIRED: '비밀번호를 입력해주세요',
        EMAIL_INVALID: '올바른 이메일을 입력해주세요',
        PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
        PASSWORD_MATCH: '일치',
        LOGOUT_CONFIRM_TITLE: '로그아웃',
        LOGOUT_CONFIRM_MESSAGE: '정말 로그아웃 하시겠습니까?',
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
    MICRO_COPY: {
        SCORE_HIGH: '훌륭한 자세예요!',
        SCORE_MID: '점수를 더 올려보세요!',
        SCORE_LOW: '개선사항을 확인해보세요',
        PROCESSING: '곧 결과가 나옵니다',
        FAILED: '다시 시도해보세요',
        COMPLETED: '결과를 확인해보세요'
    },
} as const;
