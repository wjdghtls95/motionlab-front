export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    UPLOAD: '/upload',
    RESULT: (motionId: number) => `/result/${motionId}`,
    HISTORY: '/history',
    SETTINGS: '/settings',
    PRICING: '/pricing',
    ADMIN: {
        ROOT: '/admin',
        USERS: '/admin/users',
        SPORTS: '/admin/sports',
    },
} as const;
