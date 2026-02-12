export const ENV = {
    API_URL: process.env.NEXT_PUBLIC_API_URL!,
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
} as const;