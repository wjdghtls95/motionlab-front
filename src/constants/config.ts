export const APP_CONFIG = {
    POLLING_INTERVAL: 3000,
    MAX_VIDEO_SIZE_MB: 100,
    ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000,
    ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
} as const;