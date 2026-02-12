export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    UPLOAD: '/upload',
    RESULT: (motionId: number) => `/result/${motionId}`,
} as const;
