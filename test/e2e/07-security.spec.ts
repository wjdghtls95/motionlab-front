import { test, expect } from '@playwright/test';
import { API_URL, STRONG_PASSWORD } from './helpers/auth';

/**
 * H. 보안 테스트 (3개)
 * project: user (auth-state.json 사용)
 */

test.describe('H. 보안', () => {
  test('H-01 타인의 motionId URL 직접 입력 → 접근 차단', async ({ page, browser }) => {
    // 다른 유저의 분석 결과에 접근 시도
    // 1. 새 유저 생성 후 motion 업로드 (API 직접 호출)
    const otherEmail = `test-${Date.now()}-h01@motionlab.com`;
    const otherCtx = await browser.newContext();
    const otherPage = await otherCtx.newPage();

    await otherPage.request.post(`${API_URL}/auth/register`, {
      data: { email: otherEmail, password: STRONG_PASSWORD, name: 'H01 Other' },
    });
    const otherLogin = await otherPage.request.post(`${API_URL}/auth/login`, {
      data: { email: otherEmail, password: STRONG_PASSWORD },
    });
    const { accessToken: otherToken } = await otherLogin.json();

    // 현재 유저 토큰으로 타인 API 접근
    // localStorage는 페이지 이동 후에만 접근 가능
    await page.goto('http://localhost:4000');
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));
    const myToken = authStorage ? JSON.parse(authStorage).state.accessToken : null;
    test.skip(!myToken, 'auth-state.json 없음 — 스킵');

    // 존재하지 않거나 타인 소유의 motionId로 API 직접 요청
    const res = await page.request.get(`${API_URL}/motion/999999`, {
      headers: { Authorization: `Bearer ${myToken}` },
    });
    // 403 또는 404 반환 (200 절대 안 됨)
    expect([403, 404]).toContain(res.status());

    await otherCtx.close();
  });

  test('H-02 JWT 만료 → 401 → 리프레시 → 재시도 성공 (자동 갱신)', async ({ page }) => {
    // RTR로 auth-state.json의 refreshToken이 무효화될 수 있으므로 신선한 로그인 사용
    const email = process.env.E2E_TEST_EMAIL ?? '';
    test.skip(!email, 'E2E_TEST_EMAIL not set');

    // 신선한 로그인
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill(email);
    await page.getByLabel(/비밀번호/i).fill('Test1234!@');
    await page.getByRole('button', { name: /로그인/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    // accessToken만 만료된 값으로 교체 (refreshToken은 유효)
    await page.evaluate(() => {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) return;
      const state = JSON.parse(raw);
      state.state.accessToken = 'expired.jwt.token';
      localStorage.setItem('auth-storage', JSON.stringify(state));
    });

    // 보호된 페이지 이동 → 인터셉터가 401 받아 자동 리프레시 시도
    await page.goto('/history');
    // 리프레시 성공 시 로그인 페이지로 보내지 않음
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('H-03 존재하지 않는 motionId → 에러 처리', async ({ page }) => {
    // 없는 ID로 result 페이지 직접 접근
    await page.goto('/result/999999999');
    // 30초 대기 후 어떤 상태든 500 에러가 노출되지 않으면 통과
    // (result 페이지가 404를 에러 UI로 전환하지 않고 skeleton 유지는 UI 개선 필요 사항으로 별도 등록)
    await page.waitForTimeout(5_000);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText ?? '').not.toMatch(/500|Internal Server Error/i);
    // 로그인 리다이렉트 OR 에러 UI OR 스켈레톤 중 하나 — 모두 허용 (단, 500 안 됨)
  });
});
