import { test, expect } from '@playwright/test';
import { testUser, generateMockBrainwaveData, toCSV } from './fixtures/test-data';
import { setupTestUser, clearTestData } from './helpers/test-helpers';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

test.describe('File Management Tests', () => {
  let tempDir: string;

  test.beforeAll(async () => {
    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hylove-test-'));
  });

  test.afterAll(async () => {
    // Clean up temp files
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test.afterEach(async ({ page }) => {
    await clearTestData(page);
  });

  test('should display file management page', async ({ page }) => {
    await page.goto('files');
    await expect(page.locator('h1:has-text("檔案管理")')).toBeVisible();
  });

  test('should show upload section', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');
    await page.goto('files');

    await expect(page.locator('text="上傳檔案"')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('should show warning when no user is selected', async ({ page }) => {
    await page.goto('files');

    // Should show user warning
    await expect(page.locator('text="請先選擇使用者"').or(page.locator('text="請先設定使用者"'))).toBeVisible();
  });

  test('should display tabs for files and groups', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');
    await page.goto('files');

    await expect(page.locator('button:has-text("所有檔案")')).toBeVisible();
    await expect(page.locator('button:has-text("檔案群組")')).toBeVisible();
  });

  test('should switch between files and groups tabs', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');
    await page.goto('files');

    // Click on groups tab
    await page.locator('button:has-text("檔案群組")').click();

    // Should show group content
    await expect(page.locator('text="檔案群組"')).toBeVisible();

    // Click back to files tab
    await page.locator('button:has-text("所有檔案")').click();

    // Should show files content
    await expect(page.locator('text="已上傳檔案"')).toBeVisible();
  });

  test('should show empty state when no files uploaded', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');
    await page.goto('files');

    await expect(page.locator('text="尚無檔案上傳"')).toBeVisible();
  });

  test('should display uploaded files in localStorage', async ({ page }) => {
    await setupTestUser(page);

    // Setup test files via localStorage
    const mockData = generateMockBrainwaveData(10);
    const beforeFileId = Date.now();

    await page.evaluate(
      ({ mockData, beforeFileId, userId }) => {
        const files = [
          {
            id: beforeFileId,
            fileName: 'test_file.csv',
            alias: '測試檔案',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
      },
      { mockData, beforeFileId, userId: testUser.id }
    );

    await page.goto('files');

    // Should show the file
    await expect(page.locator('text="測試檔案"')).toBeVisible();
  });

  test('should allow editing file alias', async ({ page }) => {
    await setupTestUser(page);

    const mockData = generateMockBrainwaveData(10);
    const fileId = Date.now();

    await page.evaluate(
      ({ mockData, fileId, userId }) => {
        const files = [
          {
            id: fileId,
            fileName: 'original.csv',
            alias: '原始別名',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
      },
      { mockData, fileId, userId: testUser.id }
    );

    await page.goto('files');

    // Click edit alias button
    await page.locator('button:has-text("別稱")').click();

    // Modal should open
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('text="修改檔案別稱"')).toBeVisible();

    // Fill new alias
    const newAlias = '新的別名';
    await page.locator('.modal input[type="text"]').fill(newAlias);

    // Save
    await page.locator('.modal button:has-text("儲存")').click();

    // Modal should close and new alias should be visible
    await expect(page.locator(`.modal`)).not.toBeVisible();
    await expect(page.locator(`text="${newAlias}"`)).toBeVisible();
  });

  test('should allow deleting files', async ({ page }) => {
    await setupTestUser(page);

    const mockData = generateMockBrainwaveData(10);
    const fileId = Date.now();

    await page.evaluate(
      ({ mockData, fileId, userId }) => {
        const files = [
          {
            id: fileId,
            fileName: 'to_delete.csv',
            alias: '要刪除的檔案',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
      },
      { mockData, fileId, userId: testUser.id }
    );

    await page.goto('files');
    await expect(page.locator('text="要刪除的檔案"')).toBeVisible();

    // Handle confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Click delete button
    await page.locator('button:has-text("刪除")').click();

    // File should be removed
    await expect(page.locator('text="要刪除的檔案"')).not.toBeVisible();
    await expect(page.locator('text="尚無檔案上傳"')).toBeVisible();
  });
});

test.describe('File Group Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should show empty state when no groups exist', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');
    await page.goto('files');

    // Switch to groups tab
    await page.locator('button:has-text("檔案群組")').click();

    await expect(page.locator('text="尚無檔案群組"')).toBeVisible();
  });

  test('should show create group button', async ({ page }) => {
    await setupTestUser(page);

    // Add some files first
    const mockData = generateMockBrainwaveData(10);
    await page.evaluate(
      ({ mockData, userId }) => {
        const files = [
          {
            id: Date.now(),
            fileName: 'file1.csv',
            alias: '檔案1',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
      },
      { mockData, userId: testUser.id }
    );

    await page.goto('files');
    await page.locator('button:has-text("檔案群組")').click();

    await expect(page.locator('button:has-text("建立新群組")')).toBeVisible();
  });

  test('should open create group modal', async ({ page }) => {
    await setupTestUser(page);

    const mockData = generateMockBrainwaveData(10);
    await page.evaluate(
      ({ mockData, userId }) => {
        const files = [
          {
            id: Date.now(),
            fileName: 'file1.csv',
            alias: '檔案1',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
          },
          {
            id: Date.now() + 1,
            fileName: 'file2.csv',
            alias: '檔案2',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
      },
      { mockData, userId: testUser.id }
    );

    await page.goto('files');
    await page.locator('button:has-text("檔案群組")').click();
    await page.locator('button:has-text("建立新群組")').click();

    // Modal should open
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('text="建立新群組"')).toBeVisible();
    await expect(page.locator('input[placeholder*="群組名稱"]')).toBeVisible();
  });

  test('should display existing groups', async ({ page }) => {
    await setupTestUser(page);

    const mockData = generateMockBrainwaveData(10);
    const groupId = Date.now().toString();
    const file1Id = Date.now() + 1;
    const file2Id = Date.now() + 2;

    await page.evaluate(
      ({ mockData, groupId, file1Id, file2Id, userId }) => {
        const files = [
          {
            id: file1Id,
            fileName: 'group_file1.csv',
            alias: '群組檔案1',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
            groupId,
          },
          {
            id: file2Id,
            fileName: 'group_file2.csv',
            alias: '群組檔案2',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
            groupId,
          },
        ];
        const groups = [
          {
            id: groupId,
            name: '測試群組',
            createdAt: new Date().toISOString(),
            userId,
            fileIds: [file1Id, file2Id],
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
        localStorage.setItem('fileGroups', JSON.stringify(groups));
      },
      { mockData, groupId, file1Id, file2Id, userId: testUser.id }
    );

    await page.goto('files');
    await page.locator('button:has-text("檔案群組")').click();

    await expect(page.locator('text="測試群組"')).toBeVisible();
    await expect(page.locator('text="2 個檔案"')).toBeVisible();
  });

  test('should allow editing group', async ({ page }) => {
    await setupTestUser(page);

    const mockData = generateMockBrainwaveData(10);
    const groupId = Date.now().toString();
    const fileId = Date.now() + 1;

    await page.evaluate(
      ({ mockData, groupId, fileId, userId }) => {
        const files = [
          {
            id: fileId,
            fileName: 'group_file.csv',
            alias: '群組檔案',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
            groupId,
          },
        ];
        const groups = [
          {
            id: groupId,
            name: '原始群組名稱',
            createdAt: new Date().toISOString(),
            userId,
            fileIds: [fileId],
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
        localStorage.setItem('fileGroups', JSON.stringify(groups));
      },
      { mockData, groupId, fileId, userId: testUser.id }
    );

    await page.goto('files');
    await page.locator('button:has-text("檔案群組")').click();

    // Click edit button
    await page.locator('button:has-text("編輯")').click();

    // Modal should open
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('text="編輯群組"')).toBeVisible();
  });

  test('should allow deleting group', async ({ page }) => {
    await setupTestUser(page);

    const mockData = generateMockBrainwaveData(10);
    const groupId = Date.now().toString();
    const fileId = Date.now() + 1;

    await page.evaluate(
      ({ mockData, groupId, fileId, userId }) => {
        const files = [
          {
            id: fileId,
            fileName: 'group_file.csv',
            alias: '群組檔案',
            uploadedAt: new Date().toISOString(),
            data: mockData,
            userId,
            groupId,
          },
        ];
        const groups = [
          {
            id: groupId,
            name: '要刪除的群組',
            createdAt: new Date().toISOString(),
            userId,
            fileIds: [fileId],
          },
        ];
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
        localStorage.setItem('fileGroups', JSON.stringify(groups));
      },
      { mockData, groupId, fileId, userId: testUser.id }
    );

    await page.goto('files');
    await page.locator('button:has-text("檔案群組")').click();

    await expect(page.locator('text="要刪除的群組"')).toBeVisible();

    // Handle confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Click delete button
    await page.locator('button:has-text("刪除群組")').click();

    // Group should be removed
    await expect(page.locator('text="要刪除的群組"')).not.toBeVisible();
    await expect(page.locator('text="尚無檔案群組"')).toBeVisible();
  });
});

test.describe('User Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await clearTestData(page);
  });

  test('should display user management page', async ({ page }) => {
    await page.goto('users');
    await expect(page.locator('h1:has-text("使用者管理")')).toBeVisible();
  });

  test('should show add user form', async ({ page }) => {
    await page.goto('users');
    await expect(page.locator('text="新增使用者"').or(page.locator('button:has-text("新增")'))).toBeVisible();
  });

  test('should show existing users', async ({ page }) => {
    await setupTestUser(page);
    await page.goto('');
    await page.goto('users');

    await expect(page.locator(`text="${testUser.name}"`)).toBeVisible();
  });

  test('should allow switching current user', async ({ page }) => {
    // Setup multiple users
    await page.evaluate((user) => {
      const users = [
        user,
        {
          id: 'test-user-002',
          name: '第二個使用者',
          phone: '0987654321',
          email: 'test2@example.com',
          company: {
            name: '第二公司',
            address: '新北市',
            id: 'TEST-002',
            phone: '02-22222222',
            fax: '02-22222223',
          },
        },
      ];
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUserId', user.id);
    }, testUser);

    await page.goto('users');

    // Both users should be visible
    await expect(page.locator(`text="${testUser.name}"`)).toBeVisible();
    await expect(page.locator('text="第二個使用者"')).toBeVisible();
  });
});
