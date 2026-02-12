export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
    },
    MOTIONS: {
        LIST: '/motions',
        DETAIL: (id: number) => `/motions/${id}`,
        UPLOAD: '/motions/upload',
    },
    SPORTS: {
        LIST: '/sports',
    },
} as const;