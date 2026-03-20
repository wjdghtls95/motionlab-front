import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './test/setup.ts',
        exclude: ['test/e2e/**', 'node_modules/**'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@constants': path.resolve(__dirname, 'src/constants'),
            '@lib': path.resolve(__dirname, 'src/lib'),
        },
    },
});
