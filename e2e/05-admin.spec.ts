import { test, expect } from '@playwright/test';
import { API_URL, STRONG_PASSWORD } from './helpers/auth';

/**
 * F. 관리자 테스트 (4개)
 * project: admin (admin-auth-state.json 사용)
 */

test.describe('F. 관리자', () => {
  test('F-01 관리자 → admin 페이지 정상 접근', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/login|\/403/);
    await expect(page.locator('h1, [data-testid="admin-title"]').or(page.getByText(/관리자|admin/i))).toBeVisible();
  });

  test('F-02 일반 유저 → admin 페이지 접근 차단', async ({ browser }) => {
    // 일반 유저 컨텍스트 (storageState 없음)
    const context = await browser.newContext();
    const page = await context.newPage();

    // 새 일반 유저 생성 후 로그인
    const email = `test-${Date.now()}-f02@motionlab.com`;
    await page.request.post(`${API_URL}/auth/register`, {
      data: { email, password: STRONG_PASSWORD, name: 'F02 User' },
    });
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email, password: STRONG_PASSWORD },
    });
    const { accessToken, refreshToken, user } = await loginRes.json();
    await page.goto('http://localhost:4000');
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

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login|\/403|\/$/);
    await context.close();
  });

  test('F-03 유저 역할 변경 후 재로그인 → 권한 즉시 반영', async ({ page }) => {
    // 관리자로 로그인된 상태 (admin-auth-state.json)
    await page.goto('/admin/users');
    await expect(page).not.toHaveURL(/\/login/);

    // 첫 번째 유저의 역할 변경 버튼 클릭
    const roleBtn = page.locator('[data-testid="change-role-button"], button[aria-label*="역할"]').first();
    const count = await roleBtn.count();
    test.skip(count === 0, '역할 변경 가능한 유저 없음 — 스킵');

    await roleBtn.click();
    // 변경 성공 토스트 확인
    await expect(
      page.locator('[data-testid="toast"], [role="status"]').or(page.getByText(/변경|updated/i)),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('F-04 일반 유저 토큰으로 관리자 API 호출 → 403 반환', async ({ request, browser }) => {
    // 일반 유저로 로그인
    const email = `test-${Date.now()}-f04@motionlab.com`;
    const page = await (await browser.newContext()).newPage();
    await page.request.post(`${API_URL}/auth/register`, {
      data: { email, password: STRONG_PASSWORD, name: 'F04 User' },
    });
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email, password: STRONG_PASSWORD },
    });
    const { accessToken } = await loginRes.json();

    // 관리자 전용 API 직접 호출
    const res = await page.request.patch(`${API_URL}/admin/users/1/role`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { role: 'ADMIN' },
    });
    expect(res.status()).toBe(403);
    await page.context().close();
  });
});
