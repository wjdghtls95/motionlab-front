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
    TIPS: {
        GENERAL: [
            '분석이 완료되면 각도별 상세 피드백을 확인할 수 있어요',
            '같은 동작을 반복 분석하면 성장 차트에서 변화를 추적할 수 있어요',
            '분석 결과의 개선사항을 참고해 연습하면 더 빠르게 성장할 수 있어요',
        ],
        golf: [
            '백스윙 시 왼팔을 곧게 유지하면 비거리가 평균 15% 향상됩니다',
            '임팩트 순간 머리를 고정하면 정확도가 크게 향상됩니다',
            '다운스윙 시 하체부터 회전을 시작하면 파워가 증가합니다',
            '피니시에서 벨트 버클이 타겟을 향하도록 회전을 완성하세요',
            '어드레스 시 양발 간격은 어깨 너비가 이상적입니다',
        ],
        weight: [
            '스쿼트 시 무릎이 발끝 방향과 일치하는지 확인하세요',
            '데드리프트에서 등을 곧게 유지하면 부상 위험이 줄어듭니다',
            '벤치프레스 시 견갑골을 모으면 어깨 부담이 줄어듭니다',
            '호흡은 힘을 줄 때 내쉬고, 이완할 때 들이쉬세요',
            '운동 전 동적 스트레칭으로 관절 가동 범위를 확보하세요',
        ],
    }
} as const;
