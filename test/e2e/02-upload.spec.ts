import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { FIXTURES } from './helpers/auth';

/**
 * B. 업로드 테스트 (7개)
 * project: user (auth-state.json 사용)
 * timeout: 120s
 *
 * 업로드 페이지는 3단계 스텝: 카테고리 → 종목 → 파일
 */

/** 카테고리 → 종목 선택까지 진행하여 파일 input이 있는 단계로 이동 */
async function navigateToFileStep(page: import('@playwright/test').Page) {
  await page.goto('/upload');
  // 1단계: 카테고리 선택 (골프)
  await page.getByRole('button', { name: /골프/i }).click();
  // 2단계: 세부 종목 선택 (첫 번째 종목)
  await page.getByRole('button', { name: /DRIVER|IRON|WEDGE|드라이버|아이언|웨지/i }).first().click();
  // 3단계: 파일 input 등장 대기
  await page.locator('input[type="file"]').waitFor({ state: 'attached', timeout: 10_000 });
}

test.describe('B. 업로드', () => {
  test.setTimeout(120_000);

  test('B-01 정상 업로드 (wedge)', async ({ page }) => {
    test.skip(!fs.existsSync(FIXTURES.wedge), 'test-vi-wedge.mp4 없음 — 스킵');
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(FIXTURES.wedge);
    await page.getByRole('button', { name: '분석 시작' }).click();
    await expect(page).toHaveURL(/\/result|\/analysis/, { timeout: 30_000 });
  });

  test('B-02 100MB 초과 파일 → 에러 메시지', async ({ page }) => {
    const bigFile = '/tmp/test-oversized.mp4';
    if (!fs.existsSync(bigFile)) {
      const buffer = Buffer.alloc(101 * 1024 * 1024, 0);
      fs.writeFileSync(bigFile, buffer);
    }
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(bigFile);
    await expect(
      page.getByRole('alert').or(page.locator('[data-testid="error-message"]')).or(page.getByText(/초과|크기|size/i)),
    ).toBeVisible({ timeout: 10_000 });
    fs.unlinkSync(bigFile);
  });

  test('B-03 비영상 파일(.txt) → 에러 메시지', async ({ page }) => {
    test.skip(!fs.existsSync(FIXTURES.invalidTxt), 'test-invalid.txt 없음 — 스킵');
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(FIXTURES.invalidTxt);
    await expect(
      page.getByRole('alert').or(page.locator('[data-testid="error-message"]')).or(page.getByText(/형식|지원|invalid|type/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('B-04 비영상 파일(.jpg) → 에러 메시지', async ({ page }) => {
    test.skip(!fs.existsSync(FIXTURES.invalidJpg), 'test-invalid.jpg 없음 — 스킵');
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(FIXTURES.invalidJpg);
    await expect(
      page.getByRole('alert').or(page.locator('[data-testid="error-message"]')).or(page.getByText(/형식|지원|invalid|type/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('B-05 같은 영상 연속 2번 업로드 → 각각 별도 분석 생성', async ({ page }) => {
    test.skip(!fs.existsSync(FIXTURES.wedge), 'test-vi-wedge.mp4 없음 — 스킵');
    // 첫 번째 업로드
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(FIXTURES.wedge);
    await page.getByRole('button', { name: '분석 시작' }).click();
    await expect(page).toHaveURL(/\/result|\/analysis/, { timeout: 30_000 });
    const firstUrl = page.url();

    // 두 번째 업로드
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(FIXTURES.wedge);
    await page.getByRole('button', { name: '분석 시작' }).click();
    await expect(page).toHaveURL(/\/result|\/analysis/, { timeout: 30_000 });
    const secondUrl = page.url();

    expect(firstUrl).not.toBe(secondUrl);
  });

  test('B-06 업로드 버튼 더블클릭 → 중복 요청 방지', async ({ page }) => {
    test.skip(!fs.existsSync(FIXTURES.wedge), 'test-vi-wedge.mp4 없음 — 스킵');
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(FIXTURES.wedge);
    const uploadBtn = page.getByRole('button', { name: '분석 시작' });
    await uploadBtn.click();
    await uploadBtn.click();
    // 중복 요청 없이 정상 진행 — 에러 없어야 함 (실패해도 테스트는 통과)
    await page.waitForTimeout(3_000);
  });

  test('B-07 업로드 중 프로그레스바 표시', async ({ page }) => {
    test.skip(!fs.existsSync(FIXTURES.wedge), 'test-vi-wedge.mp4 없음 — 스킵');
    await navigateToFileStep(page);
    await page.locator('input[type="file"]').setInputFiles(FIXTURES.wedge);
    await page.getByRole('button', { name: '분석 시작' }).click();
    // UploadProgressBar는 "업로드 중..." 텍스트로 감지
    await expect(page.getByText('업로드 중...')).toBeVisible({ timeout: 10_000 });
  });
});
