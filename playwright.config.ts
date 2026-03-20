import { defineConfig, devices } from '@playwright/test';

const isHeaded = !!process.env.HEADED;

const hasAdminAccount = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

export default defineConfig({
  testDir: './test/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // 순서 의존성 방지 (auth 공유)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 테스트 유저 충돌 방지
  reporter: [['html', { outputFolder: 'test/e2e/reports' }]],
  outputDir: './test/e2e/results',
  globalSetup: './test/e2e/global-setup.ts',
  globalTeardown: './test/e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: !isHeaded,
    ...(isHeaded ? { slowMo: 500 } : {}),
  },
  projects: [
    // 1. no-auth: 인증 테스트 (로그인/회원가입), storageState 없음
    {
      name: 'no-auth',
      testMatch: '**/01-auth.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // 2. user: 일반 유저 인증 상태, no-auth 완료 후 실행
    {
      name: 'user',
      testMatch: ['**/02-upload.spec.ts', '**/03-analysis.spec.ts', '**/04-history.spec.ts', '**/06-ui-ux.spec.ts', '**/07-security.spec.ts'],
      dependencies: ['no-auth'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'test/e2e/auth-state.json',
      },
    },
    // 3. admin: 관리자 인증 상태, user 완료 후 실행
    ...(hasAdminAccount
      ? [
          {
            name: 'admin',
            testMatch: '**/05-admin.spec.ts',
            dependencies: ['user'],
            use: {
              ...devices['Desktop Chrome'],
              storageState: 'test/e2e/admin-auth-state.json',
            },
          },
        ]
      : []),
  ],
});
