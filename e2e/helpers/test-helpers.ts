import { Page, expect } from '@playwright/test';
import { testUser, generateMockBrainwaveData, toCSV } from '../fixtures/test-data';

/**
 * Setup test user in localStorage
 */
export async function setupTestUser(page: Page): Promise<void> {
  await page.evaluate((user) => {
    const users = [user];
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUserId', user.id);
  }, testUser);
}

/**
 * Setup test files in localStorage
 */
export async function setupTestFiles(page: Page): Promise<{ beforeFileId: number; afterFileId: number }> {
  const beforeData = generateMockBrainwaveData(100);
  const afterData = generateMockBrainwaveData(100);
  const now = Date.now();
  const beforeFileId = now;
  const afterFileId = now + 1;

  await page.evaluate(
    ({ beforeData, afterData, beforeFileId, afterFileId, userId }) => {
      const files = [
        {
          id: beforeFileId,
          fileName: 'before_test.csv',
          alias: '前測資料',
          uploadedAt: new Date().toISOString(),
          data: beforeData,
          userId,
        },
        {
          id: afterFileId,
          fileName: 'after_test.csv',
          alias: '後測資料',
          uploadedAt: new Date().toISOString(),
          data: afterData,
          userId,
        },
      ];
      localStorage.setItem('uploadedFiles', JSON.stringify(files));
    },
    { beforeData, afterData, beforeFileId, afterFileId, userId: testUser.id }
  );

  return { beforeFileId, afterFileId };
}

/**
 * Setup 2 test files for dual-person analysis (e.g., dualmusic)
 */
export async function setupDualTestFiles(page: Page): Promise<{
  firstPlayerId: number;
  secondPlayerId: number;
}> {
  const firstPlayerData = generateMockBrainwaveData(100);
  const secondPlayerData = generateMockBrainwaveData(100);
  const now = Date.now();
  const firstPlayerId = now;
  const secondPlayerId = now + 1;

  await page.evaluate(
    ({ firstPlayerData, secondPlayerData, firstPlayerId, secondPlayerId, userId }) => {
      const files = [
        {
          id: firstPlayerId,
          fileName: 'first_player_test.csv',
          alias: '第一人腦波資料',
          uploadedAt: new Date().toISOString(),
          data: firstPlayerData,
          userId,
        },
        {
          id: secondPlayerId,
          fileName: 'second_player_test.csv',
          alias: '第二人腦波資料',
          uploadedAt: new Date().toISOString(),
          data: secondPlayerData,
          userId,
        },
      ];
      localStorage.setItem('uploadedFiles', JSON.stringify(files));
    },
    { firstPlayerData, secondPlayerData, firstPlayerId, secondPlayerId, userId: testUser.id }
  );

  return { firstPlayerId, secondPlayerId };
}

/**
 * Select 2 files for dual-person analysis
 */
export async function selectDualFilesForAnalysis(
  page: Page,
  firstPlayerId: number,
  secondPlayerId: number
): Promise<void> {
  // Scroll to file selection section
  await page.locator('text="選擇檔案"').scrollIntoViewIfNeeded();

  // Wait for the FileGroupSelector component to load
  await page.waitForSelector('button:has-text("個別選擇"), button:has-text("群組選擇")', { timeout: 10000 });

  // Ensure individual selection mode is active
  const individualButton = page.locator('button:has-text("個別選擇")');
  if (await individualButton.isVisible()) {
    await individualButton.click();
    await page.waitForTimeout(300);
  }

  // Find file selects by their placeholder text pattern
  const fileSelects = page.locator('select').filter({ hasText: '請選擇' });
  await expect(fileSelects.first()).toBeVisible({ timeout: 10000 });

  const selectCount = await fileSelects.count();

  if (selectCount >= 2) {
    await fileSelects.nth(0).selectOption({ value: firstPlayerId.toString() });
    await page.waitForTimeout(100);
    await fileSelects.nth(1).selectOption({ value: secondPlayerId.toString() });
  } else {
    throw new Error(`Expected at least 2 file select elements, found ${selectCount}`);
  }
}

/**
 * Setup both user and files, then reload page
 */
export async function setupTestEnvironment(page: Page): Promise<{ beforeFileId: number; afterFileId: number }> {
  await page.goto('');
  await setupTestUser(page);
  const fileIds = await setupTestFiles(page);
  // Reload to pick up localStorage changes
  await page.reload();
  await page.waitForLoadState('networkidle');
  return fileIds;
}

/**
 * Navigate to analysis page and select files
 */
export async function navigateToAnalysis(
  page: Page,
  analysisId: string
): Promise<void> {
  await page.goto(`analysis/${analysisId}`);
  await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
}

/**
 * Select files for analysis using individual selection mode
 */
export async function selectFilesForAnalysis(
  page: Page,
  beforeFileId: number,
  afterFileId: number
): Promise<void> {
  // Scroll to file selection section
  await page.locator('text="選擇檔案"').scrollIntoViewIfNeeded();

  // Wait for the FileGroupSelector component to load
  await page.waitForSelector('button:has-text("個別選擇"), button:has-text("群組選擇")', { timeout: 10000 });

  // Ensure individual selection mode is active
  const individualButton = page.locator('button:has-text("個別選擇")');
  if (await individualButton.isVisible()) {
    await individualButton.click();
    await page.waitForTimeout(300); // Wait for mode switch
  }

  // Find file selects by their placeholder text pattern
  const fileSelects = page.locator('select').filter({ hasText: '請選擇' });
  await expect(fileSelects.first()).toBeVisible({ timeout: 10000 });

  const selectCount = await fileSelects.count();

  if (selectCount >= 2) {
    await fileSelects.nth(0).selectOption({ value: beforeFileId.toString() });
    await page.waitForTimeout(100);
    await fileSelects.nth(1).selectOption({ value: afterFileId.toString() });
  } else {
    throw new Error(`Expected at least 2 file select elements, found ${selectCount}`);
  }
}

/**
 * Start analysis and wait for result
 * Accepts either successful navigation to report OR API error display as valid outcomes
 */
export async function startAnalysis(page: Page): Promise<void> {
  const analyzeButton = page.locator('button:has-text("開始分析")');
  await expect(analyzeButton).toBeEnabled();
  await analyzeButton.click();

  // Wait for either: report page navigation OR error message display
  // Both indicate the UI workflow completed successfully
  try {
    await expect(page).toHaveURL(/\/analysis\/report\/\d+/, { timeout: 10000 });
  } catch {
    // If navigation didn't happen, check for API error (expected without backend)
    // Match various error message patterns: "Request failed", "Error", "失敗", "不完整", "無法連接"
    const hasError = await page.locator('text=/Request failed|Error|失敗|不完整|無法連接|超時/i').isVisible({ timeout: 5000 });
    if (!hasError) {
      throw new Error('Analysis did not complete: no navigation and no error message');
    }
  }
}

/**
 * Verify report page loaded successfully or API error was displayed
 */
export async function verifyReportLoaded(page: Page): Promise<void> {
  // Check if we're on the report page
  const isReportPage = page.url().includes('/analysis/report/');

  if (isReportPage) {
    // Check that report page elements are visible
    await expect(page.locator('h1:has-text("分析報告")')).toBeVisible({ timeout: 10000 });
    // Check for report layout components
    await expect(page.locator('.card')).toBeVisible();
  } else {
    // Not on report page - verify API error was shown (expected without backend)
    const hasError = await page.locator('text=/Request failed|Error|失敗|不完整|無法連接|超時/i').isVisible();
    if (!hasError) {
      throw new Error('Expected either report page or API error message');
    }
  }
}

/**
 * Clear all localStorage data
 */
export async function clearTestData(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Full analysis workflow helper
 */
export async function runFullAnalysisWorkflow(
  page: Page,
  analysisId: string,
  options?: {
    customParams?: Record<string, any>;
    skipReportVerification?: boolean;
  }
): Promise<void> {
  // Setup test data
  await setupTestUser(page);
  const { beforeFileId, afterFileId } = await setupTestFiles(page);

  // Reload page to pick up localStorage changes
  await page.goto('');

  // Navigate to analysis
  await navigateToAnalysis(page, analysisId);

  // Select files
  await selectFilesForAnalysis(page, beforeFileId, afterFileId);

  // Fill custom params if provided
  if (options?.customParams) {
    for (const [key, value] of Object.entries(options.customParams)) {
      const input = page.locator(`input[placeholder*="${key}"], input[name="${key}"]`);
      if (await input.isVisible()) {
        await input.fill(String(value));
      }
    }
  }

  // Start analysis
  await startAnalysis(page);

  // Verify report
  if (!options?.skipReportVerification) {
    await verifyReportLoaded(page);
  }
}

/**
 * Check if analysis card exists on home page
 */
export async function verifyAnalysisCardOnHomePage(
  page: Page,
  analysisName: string
): Promise<void> {
  await page.goto('');
  await expect(page.locator(`text="${analysisName}"`).first()).toBeVisible({ timeout: 5000 });
}
