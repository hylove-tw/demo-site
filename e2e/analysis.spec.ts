import { test, expect } from '@playwright/test';
import { analysisPlugins, testUser, generateMockBrainwaveData } from './fixtures/test-data';
import {
  setupTestUser,
  setupTestFiles,
  setupDualTestFiles,
  setupTestEnvironment,
  navigateToAnalysis,
  selectFilesForAnalysis,
  selectDualFilesForAnalysis,
  startAnalysis,
  verifyReportLoaded,
  clearTestData,
  verifyAnalysisCardOnHomePage,
} from './helpers/test-helpers';

test.describe('Analysis Functions E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing test data
    await page.goto('');
    await clearTestData(page);
  });

  test.afterEach(async ({ page }) => {
    await clearTestData(page);
  });

  // Test: Home page displays all analysis cards
  test('should display all analysis plugins on home page', async ({ page }) => {
    await page.goto('');

    // Check that the analysis list section exists
    await expect(page.locator('text="分析功能"').first()).toBeVisible({ timeout: 10000 });

    // Verify some analysis names are visible
    for (const plugin of analysisPlugins.slice(0, 5)) {
      await expect(page.locator(`text="${plugin.name}"`).first()).toBeVisible();
    }
  });

  // Test: Navigate to analysis detail page
  test('should navigate to analysis detail page', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');

    // Click on first analysis card
    const firstPlugin = analysisPlugins[0];
    await page.locator(`a[href="/analysis/${firstPlugin.id}"]`).first().click();

    // Verify navigation
    await expect(page).toHaveURL(`/analysis/${firstPlugin.id}`);
    await expect(page.locator(`h1:has-text("${firstPlugin.name}")`)).toBeVisible();
  });

  // Test: Analysis requires user selection
  test('should show warning when no user is selected', async ({ page }) => {
    await page.goto('analysis/yuanshenyin');

    // Check for user warning
    await expect(page.locator('text="請先選擇使用者"')).toBeVisible();
  });

  // Test: File selection in individual mode
  test('should allow file selection in individual mode', async ({ page }) => {
    const { beforeFileId, afterFileId } = await setupTestEnvironment(page);

    await page.goto('analysis/yuanshenyin');

    // Click individual selection button
    await page.locator('button:has-text("個別選擇")').click();

    // Verify file dropdowns are visible
    const selects = page.locator('select.select-bordered');
    await expect(selects.first()).toBeVisible();

    // Select files
    await selects.nth(0).selectOption({ value: beforeFileId.toString() });
    await selects.nth(1).selectOption({ value: afterFileId.toString() });

    // Verify selections
    await expect(selects.nth(0)).toHaveValue(beforeFileId.toString());
    await expect(selects.nth(1)).toHaveValue(afterFileId.toString());
  });
});

// Individual tests for each analysis plugin
test.describe('元神音 (yuanshenyin) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should display all custom parameter fields', async ({ page }) => {
    await setupTestUser(page);
    await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'yuanshenyin');

    // Verify custom parameter fields are visible
    await expect(page.locator('input[placeholder="未命名的樂譜"]')).toBeVisible();
    await expect(page.locator('input[type="number"][placeholder="60"]')).toBeVisible();

    // Verify time signature select
    await expect(page.locator('select').filter({ hasText: '4/4' }).first()).toBeVisible();

    // Verify instrument selects (3 for high/mid/low range)
    const instrumentSelects = page.locator('select').filter({ hasText: '鋼琴' });
    await expect(instrumentSelects).toHaveCount(3); // 3 instrument selects
  });

  test('should complete analysis with custom parameters', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'yuanshenyin');

    // Fill custom parameters
    await page.locator('input[placeholder="未命名的樂譜"]').fill('Test Music Title');
    await page.locator('input[type="number"][placeholder="60"]').fill('120');

    // Select time signature
    await page.locator('select').filter({ hasText: '4/4' }).first().selectOption('6/8');

    // Scroll down to reveal instrument selects and wait for them
    await page.locator('text="樂器設定"').scrollIntoViewIfNeeded();

    // Select instruments using label text for more reliable selection
    const p1Select = page.locator('select').filter({ hasText: '鋼琴' }).nth(0);
    const p2Select = page.locator('select').filter({ hasText: '鋼琴' }).nth(1);
    const p3Select = page.locator('select').filter({ hasText: '鋼琴' }).nth(2);

    await p1Select.selectOption('guitar'); // P1 - 吉他
    await p2Select.selectOption('violin'); // P2 - 小提琴
    await p3Select.selectOption('cello'); // P3 - 大提琴

    // Select files
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);

    // Start analysis
    await startAnalysis(page);

    // Verify report
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '元神音');
  });
});

test.describe('雙人腦波音樂 (dualmusic) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should display all custom parameter fields', async ({ page }) => {
    await setupTestUser(page);
    await setupDualTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'dualmusic');

    // Verify basic parameter fields
    await expect(page.locator('input[placeholder="未命名的樂譜"]')).toBeVisible();
    await expect(page.locator('input[type="number"][placeholder="60"]')).toBeVisible();

    // Verify time signature select
    await expect(page.locator('select').filter({ hasText: '4/4' }).first()).toBeVisible();

    // Verify player labels
    await expect(page.locator('text="第一演奏者"')).toBeVisible();
    await expect(page.locator('text="第二演奏者"')).toBeVisible();

    // Verify instrument selects (6 total: 3 for first player + 3 for second player)
    const instrumentSelects = page.locator('select.select-underline');
    // 1 time_signature + 6 instruments = 7
    expect(await instrumentSelects.count()).toBeGreaterThanOrEqual(7);
  });

  test('should require 2 files for dual-person analysis', async ({ page }) => {
    await setupTestUser(page);
    await setupDualTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'dualmusic');

    // Click individual selection button
    await page.locator('button:has-text("個別選擇")').click();

    // Verify 2 file dropdowns are visible (they have "請選擇" placeholder)
    const fileSelects = page.locator('select').filter({ hasText: '請選擇' });
    await expect(fileSelects).toHaveCount(2);
  });

  test('should complete analysis with custom parameters', async ({ page }) => {
    await setupTestUser(page);
    const { firstPlayerId, secondPlayerId } = await setupDualTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'dualmusic');

    // Fill custom parameters
    await page.locator('input[placeholder="未命名的樂譜"]').fill('Dual Test Music');
    await page.locator('input[type="number"][placeholder="60"]').fill('90');

    // Select time signature
    await page.locator('select').filter({ hasText: '4/4' }).first().selectOption('6/8');

    // Scroll down to reveal instrument selects
    await page.locator('text="樂器設定"').scrollIntoViewIfNeeded();

    // Select instruments for both players using filter by piano content
    const instrumentSelects = page.locator('select').filter({ hasText: '鋼琴' });

    // First player instruments (indices 0-2)
    await instrumentSelects.nth(0).selectOption('piano'); // First P1
    await instrumentSelects.nth(1).selectOption('guitar'); // First P2
    await instrumentSelects.nth(2).selectOption('bass'); // First P3

    // Second player instruments (indices 3-5)
    await instrumentSelects.nth(3).selectOption('violin'); // Second P1
    await instrumentSelects.nth(4).selectOption('cello'); // Second P2
    await instrumentSelects.nth(5).selectOption('flute'); // Second P3

    // Select 2 files for dual-person analysis
    await selectDualFilesForAnalysis(page, firstPlayerId, secondPlayerId);

    // Start analysis
    await startAnalysis(page);

    // Verify report
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '雙人腦波音樂');
  });
});

test.describe('亨運來 (hengyunlai) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete HR assessment analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '亨運來');
  });
});

test.describe('正念修行 (mindei_normal) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete mindfulness normal analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'mindei_normal');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should be in 利養炁 group', async ({ page }) => {
    await page.goto('analysis/mindei_normal');
    await expect(page.locator('.breadcrumbs')).toContainText('利養炁');
  });
});

test.describe('練炁修行 (mindei_movement) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete mindfulness movement analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'mindei_movement');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '練炁修行');
  });
});

test.describe('練炁品階 (mindei_level) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete mindfulness level analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'mindei_level');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '練炁品階');
  });
});

test.describe('貞天賦 (zhentianfu) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete potential assessment analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'zhentianfu');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '貞天賦');
  });
});

test.describe('情緒管理系統 (emotion_management) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete emotion management analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'emotion_management');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should be in 易 group', async ({ page }) => {
    await page.goto('analysis/emotion_management');
    await expect(page.locator('.breadcrumbs')).toContainText('易');
  });
});

test.describe('寵物評比測試 (pet_test) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete pet test analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'pet_test');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '寵物評比測試');
  });
});

test.describe('品茶/品酒/品咖啡評比測試 (beverage_test) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete beverage test analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'beverage_test');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '品茶/品酒/品咖啡評比測試');
  });
});

test.describe('香水評比測試 (perfume_test) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete perfume test analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'perfume_test');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '香水評比測試');
  });
});

test.describe('音樂演奏/歌曲演唱評比測試 (music_test) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete music test analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'music_test');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '音樂演奏/歌曲演唱評比測試');
  });
});

test.describe('短視頻廣告評比測試 (video_test) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete video test analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'video_test');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '短視頻廣告評比測試');
  });
});

test.describe('珍寶炁 (zhenbaoqi) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete treasure analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'zhenbaoqi');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '珍寶炁');
  });
});

test.describe('情香意 (qingxiangyi) Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should complete perfume recommendation analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'qingxiangyi');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);
    await verifyReportLoaded(page);
  });

  test('should display analysis card on home page', async ({ page }) => {
    await verifyAnalysisCardOnHomePage(page, '情香意');
  });
});

// Report page tests
test.describe('Analysis Report Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should display report content after analysis', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Check report elements
    await expect(page.locator('.breadcrumbs')).toBeVisible();
    await expect(page.locator('button:has-text("返回首頁"), a:has-text("返回首頁")')).toBeVisible();
    await expect(page.locator('button:has-text("再次分析"), a:has-text("再次分析")')).toBeVisible();
  });

  test('should navigate back to home from report', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Click back to home
    await page.locator('a:has-text("返回首頁")').click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to re-analyze from report', async ({ page }) => {
    await setupTestUser(page);
    const { beforeFileId, afterFileId } = await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'hengyunlai');
    await selectFilesForAnalysis(page, beforeFileId, afterFileId);
    await startAnalysis(page);

    // Click re-analyze
    await page.locator('a:has-text("再次分析")').click();
    await expect(page).toHaveURL('/analysis/hengyunlai');
  });
});

// Error handling tests
test.describe('Analysis Error Handling', () => {
  test('should show error for non-existent analysis', async ({ page }) => {
    await page.goto('analysis/non-existent-analysis');
    await expect(page.locator('text="找不到此分析功能"')).toBeVisible();
  });

  test('should prevent analysis without file selection', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');

    await navigateToAnalysis(page, 'hengyunlai');

    // Try to start analysis without selecting files
    const analyzeButton = page.locator('button:has-text("開始分析")');
    await analyzeButton.click();

    // Should show alert (we can check that we're still on the same page)
    await expect(page).toHaveURL(/\/analysis\/hengyunlai/);
  });
});

// File group selection tests
test.describe('File Group Selection', () => {
  test('should switch between individual and group selection modes', async ({ page }) => {
    await setupTestUser(page);
    await setupTestFiles(page);
    await page.goto('');

    await navigateToAnalysis(page, 'hengyunlai');

    // Click group selection button
    await page.locator('button:has-text("群組選擇")').click();

    // Verify group selection UI is shown
    await expect(
      page.locator('text="尚無檔案群組"').or(page.locator('text="選擇檔案群組"'))
    ).toBeVisible();

    // Click back to individual selection
    await page.locator('button:has-text("個別選擇")').click();

    // Verify individual selection dropdowns are shown
    const selects = page.locator('select.select-bordered');
    await expect(selects.first()).toBeVisible();
  });
});
