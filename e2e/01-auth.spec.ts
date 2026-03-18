import { test, expect } from '@playwright/test';
import { STRONG_PASSWORD, WEAK_PASSWORD, testEmail } from './helpers/auth';

/**
 * A. 인증 테스트 (7개)
 * project: no-auth (storageState 없음)
 *
 * 회원가입 폼 필드 순서: 이름 → 이메일 → 비밀번호 → 비밀번호 확인 → 이용약관 체크박스
 */

/** 회원가입 폼 공통 입력 helper */
async function fillRegisterForm(
  page: import('@playwright/test').Page,
  opts: { email: string; password: string; confirmPassword?: string; name?: string; checkTerms?: boolean },
) {
  await page.goto('/register');
  await page.getByLabel(/이름/i).fill(opts.name ?? '테스트유저');
  await page.getByLabel(/^이메일/i).fill(opts.email);
  // 비밀번호 / 비밀번호 확인 두 개의 label이 "/비밀번호/i"에 매칭되므로 nth로 구분
  await page.getByLabel(/비밀번호/).nth(0).fill(opts.password);
  if (opts.confirmPassword !== undefined) {
    await page.getByLabel(/비밀번호 확인/i).fill(opts.confirmPassword);
  }
  if (opts.checkTerms !== false) {
    // 이용약관 체크박스
    await page.getByRole('checkbox').check();
  }
}

test.describe('A. 인증', () => {
  test('A-01 유효한 이메일 + 강한 비밀번호 회원가입', async ({ page }) => {
    const email = testEmail('a01');
    await fillRegisterForm(page, { email, password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD });
    await page.getByRole('button', { name: /회원가입/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('A-02 중복 이메일 회원가입', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? `test-0@motionlab.com`;
    await fillRegisterForm(page, { email, password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD });
    await page.getByRole('button', { name: /회원가입/i }).click();
    await expect(
      page.getByRole('alert').or(page.locator('[data-testid="error-message"]')).or(page.getByText(/이미 사용 중|already/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('A-03 약한 비밀번호 회원가입 → 에러 메시지 표시', async ({ page }) => {
    const email = testEmail('a03');
    await fillRegisterForm(page, {
      email,
      password: WEAK_PASSWORD,
      confirmPassword: WEAK_PASSWORD,
      checkTerms: true,
    });
    // 클라이언트 측 비밀번호 강도 검증 — 인라인 에러 메시지 표시 또는 버튼 disabled 유지
    const inlineError = page.getByText(/8자|대문자|소문자|특수문자|비밀번호/i).last();
    const btnDisabled = page.getByRole('button', { name: /회원가입/i });
    // 인라인 에러가 있거나 버튼이 여전히 disabled여야 함
    const hasInlineError = await inlineError.isVisible().catch(() => false);
    const isDisabled = await btnDisabled.isDisabled().catch(() => false);
    expect(hasInlineError || isDisabled, '약한 비밀번호 → 에러 또는 버튼 비활성화 기대').toBe(true);
  });

  test('A-04 정상 로그인', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? '';
    test.skip(!email, 'E2E_TEST_EMAIL not set');
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill(email);
    await page.getByLabel(/비밀번호/i).fill(STRONG_PASSWORD);
    await page.getByRole('button', { name: /로그인/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));
    expect(authStorage).not.toBeNull();
    const parsed = JSON.parse(authStorage!);
    expect(parsed.state.isAuthenticated).toBe(true);
  });

  test('A-05 잘못된 비밀번호 로그인', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? `test-0@motionlab.com`;
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill(email);
    await page.getByLabel(/비밀번호/i).fill('WrongPass999!');
    await page.getByRole('button', { name: /로그인/i }).click();
    await expect(
      page.getByRole('alert').or(page.locator('[data-testid="error-message"]')).or(page.getByText(/올바르지|잘못|incorrect/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('A-06 토큰 만료 후 API 호출 → 자동 리프레시 → 재시도 성공', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL ?? '';
    test.skip(!email, 'E2E_TEST_EMAIL not set');
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill(email);
    await page.getByLabel(/비밀번호/i).fill(STRONG_PASSWORD);
    await page.getByRole('button', { name: /로그인/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    // 만료된 accessToken으로 교체
    await page.evaluate(() => {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) return;
      const state = JSON.parse(raw);
      state.state.accessToken = 'expired.token.value';
      localStorage.setItem('auth-storage', JSON.stringify(state));
    });

    // 보호된 페이지 접근 → 인터셉터가 401 감지 → 리프레시 → 재시도
    await page.goto('/history');
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('A-07 비로그인 → 보호된 페이지 접근 → 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/history');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
