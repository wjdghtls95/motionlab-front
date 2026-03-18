import { chromium, FullConfig } from '@playwright/test';

const BASE_URL = 'http://localhost:4000';
const API_URL = 'http://localhost:3000';

async function globalSetup(_config: FullConfig) {
  const timestamp = Date.now();
  const email = `test-${timestamp}@motionlab.com`;
  const password = 'Test1234!@';
  const name = 'E2E Test User';

  // Save test credentials for teardown
  process.env.E2E_TEST_EMAIL = email;
  process.env.E2E_TEST_PASSWORD = password;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Register test user
  const registerRes = await page.request.post(`${API_URL}/auth/register`, {
    data: { email, password, name },
  });
  if (!registerRes.ok()) {
    const body = await registerRes.text();
    throw new Error(`Registration failed: ${registerRes.status()} ${body}`);
  }

  // Login test user
  const loginRes = await page.request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  if (!loginRes.ok()) {
    const body = await loginRes.text();
    throw new Error(`Login failed: ${loginRes.status()} ${body}`);
  }
  const loginData = await loginRes.json();
  const { accessToken, refreshToken, userId, email: userEmail, name: userName, role } = loginData;
  const user = { id: userId, email: userEmail, name: userName, role };

  // Inject auth state into localStorage via page navigation
  await page.goto(BASE_URL);
  await page.evaluate(
    ({ accessToken, refreshToken, user }) => {
      const authState = {
        state: { accessToken, refreshToken, user, isAuthenticated: true },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    },
    { accessToken, refreshToken, user },
  );

  await context.storageState({ path: 'e2e/auth-state.json' });
  await context.close();

  // Save userId for teardown
  process.env.E2E_TEST_USER_ID = String(userId);
  process.env.E2E_TEST_EMAIL = email; // ensure env is set for teardown

  // Admin login (optional — skip if ADMIN_EMAIL not configured)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    const adminLoginRes = await adminPage.request.post(`${API_URL}/auth/login`, {
      data: { email: adminEmail, password: adminPassword },
    });
    if (!adminLoginRes.ok()) {
      console.warn(`[global-setup] Admin login failed: ${adminLoginRes.status()} — admin tests will be skipped`);
      await adminContext.close();
    } else {
      const adminLoginData = await adminLoginRes.json();
      const { accessToken: adminAccessToken, refreshToken: adminRefreshToken, userId: adminUserId, email: adminUserEmail, name: adminUserName, role: adminRole } = adminLoginData;
      const adminUser = { id: adminUserId, email: adminUserEmail, name: adminUserName, role: adminRole };

      await adminPage.goto(BASE_URL);
      await adminPage.evaluate(
        ({ accessToken, refreshToken, user }) => {
          const authState = {
            state: { accessToken, refreshToken, user, isAuthenticated: true },
            version: 0,
          };
          localStorage.setItem('auth-storage', JSON.stringify(authState));
        },
        { accessToken: adminAccessToken, refreshToken: adminRefreshToken, user: adminUser },
      );

      await adminContext.storageState({ path: 'e2e/admin-auth-state.json' });
      await adminContext.close();
      process.env.E2E_ADMIN_USER_ID = String(adminUserId);
    }
  } else {
    console.warn('[global-setup] ADMIN_EMAIL/ADMIN_PASSWORD not set — admin tests will be skipped');
  }

  await browser.close();
}

export default globalSetup;
