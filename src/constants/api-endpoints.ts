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
    USERS: {
        LIST: '/users',
    },
    SPORTS: {
        LIST: '/sports',
        DETAIL: (id: number) => `/sports/${id}`,
    },
    ADMIN: {
        UPDATE_USER_ROLE: (userId: number) => `/admin/users/${userId}/role`,
    },
} as const;