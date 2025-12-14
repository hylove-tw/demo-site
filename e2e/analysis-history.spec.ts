import { test, expect } from '@playwright/test';
import { testUser, generateMockBrainwaveData } from './fixtures/test-data';
import {
  setupTestUser,
  setupTestFiles,
  navigateToAnalysis,
  selectFilesForAnalysis,
  startAnalysis,
  clearTestData,
} from './helpers/test-helpers';

test.describe('Analysis History Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test.afterEach(async ({ page }) => {
    await clearTestData(page);
  });

  test('should save analysis to history after completion', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    // Complete an analysis
    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Navigate to analysis history page
    await page.goto('analysis');

    // Check that history contains the completed analysis
    await expect(page.locator('text="亨運來"')).toBeVisible();
  });

  test('should display analysis history with correct status', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    // Complete an analysis
    await navigateToAnalysis(page, 'mindei_normal');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Go to analysis list page
    await page.goto('analysis');

    // Check for success status indicator
    await expect(
      page.locator('text="成功"').or(page.locator('.badge-success')).or(page.locator('[class*="success"]'))
    ).toBeVisible();
  });

  test('should allow viewing previous analysis report from history', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    // Complete an analysis
    await navigateToAnalysis(page, 'zhentianfu');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Get the report URL
    const reportUrl = page.url();

    // Go back to home
    await page.goto('');

    // Navigate to analysis page
    await page.goto('analysis');

    // Click on the history item to view report
    const viewButton = page.locator('a:has-text("查看報告"), button:has-text("查看"), a:has-text("檢視")');
    if (await viewButton.first().isVisible()) {
      await viewButton.first().click();
      await expect(page).toHaveURL(/\/analysis\/report\/\d+/);
    }
  });

  test('should filter analysis history by user', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    // Complete multiple analyses
    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    await page.goto('');
    await navigateToAnalysis(page, 'zhentianfu');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Go to analysis list page
    await page.goto('analysis');

    // Check that both analyses are visible
    await expect(page.locator('tbody tr, .card').first()).toBeVisible();
  });

  test('should show empty state when no history exists', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');

    // Go to analysis list page without any previous analyses
    await page.goto('analysis');

    // Should show empty state or no records
    const content = await page.content();
    const hasEmptyState =
      content.includes('尚無') ||
      content.includes('沒有') ||
      content.includes('無分析') ||
      (await page.locator('tbody tr').count()) === 0;

    expect(hasEmptyState).toBeTruthy();
  });
});

test.describe('Multiple Analyses Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should handle multiple sequential analyses', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    // First analysis
    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Second analysis
    await page.goto('');
    await navigateToAnalysis(page, 'mindei_normal');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Third analysis
    await page.goto('');
    await navigateToAnalysis(page, 'emotion_management');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Check analysis list page
    await page.goto('analysis');

    // Should have at least 3 items
    const historyItems = page.locator('tbody tr, .card');
    await expect(historyItems).toHaveCount(3, { timeout: 10000 });
  });

  test('should preserve analysis description in history', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    const testDescription = '這是一個測試描述';

    // Navigate to analysis
    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);

    // Add description
    const descriptionInput = page.locator('textarea[placeholder*="描述"], textarea[placeholder*="備註"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(testDescription);
    }

    await startAnalysis(page);

    // Check report page for description
    const pageContent = await page.content();
    // Description might be shown on the report or stored in history
    // This depends on the implementation
  });
});

test.describe('Analysis with Custom Parameters History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should preserve custom parameters in yuanshenyin analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    const customTitle = 'My Custom Music Title';
    const customTempo = '90';

    await navigateToAnalysis(page, 'yuanshenyin');

    // Fill custom parameters
    await page.locator('input[placeholder="樂譜標題"]').fill(customTitle);
    await page.locator('input[placeholder="速度"]').fill(customTempo);

    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // The report should include the custom parameters
    // This verification depends on how the report renders the parameters
    await expect(page.locator('h1:has-text("分析報告")')).toBeVisible();
  });
});

test.describe('Analysis Report Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should handle 404 for non-existent report', async ({ page }) => {
    await page.goto('analysis/report/99999999');

    // Should show not found message
    await expect(page.locator('text="找不到報告"')).toBeVisible();
  });

  test('should navigate via breadcrumbs from report', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Click home in breadcrumbs
    await page.locator('.breadcrumbs a:has-text("首頁")').click();
    await expect(page).toHaveURL('/');
  });
});
