import { test, expect } from '@playwright/test';

// Theme color definitions from index.css
const themeColors = {
  primary: 'rgb(120, 113, 108)',        // #78716c - stone-500
  primaryHover: 'rgb(87, 83, 78)',      // #57534e - stone-600
  primaryLight: 'rgb(245, 245, 244)',   // #f5f5f4 - stone-100

  accent: 'rgb(180, 83, 9)',            // #b45309 - amber-700
  accentLight: 'rgb(254, 243, 199)',    // #fef3c7 - amber-100

  bg: 'rgb(250, 250, 249)',             // #fafaf9 - stone-50
  bgCard: 'rgb(255, 255, 255)',         // #ffffff
  bgSidebar: 'rgb(255, 255, 255)',      // #ffffff
  bgHover: 'rgb(245, 245, 244)',        // #f5f5f4 - stone-100
  bgActive: 'rgb(231, 229, 228)',       // #e7e5e4 - stone-200

  text: 'rgb(41, 37, 36)',              // #292524 - stone-800
  textSecondary: 'rgb(87, 83, 78)',     // #57534e - stone-600
  textMuted: 'rgb(120, 113, 108)',      // #78716c - stone-500
  textLight: 'rgb(168, 162, 158)',      // #a8a29e - stone-400

  border: 'rgb(231, 229, 228)',         // #e7e5e4 - stone-200
  borderLight: 'rgb(245, 245, 244)',    // #f5f5f4 - stone-100

  success: 'rgb(101, 163, 13)',         // #65a30d - lime-600
  successLight: 'rgb(236, 252, 203)',   // #ecfccb - lime-100
  error: 'rgb(220, 38, 38)',            // #dc2626 - red-600
  errorLight: 'rgb(254, 226, 226)',     // #fee2e2 - red-100
};

test.describe('Theme Colors Verification', () => {

  test.describe('Homepage', () => {
    test('should have correct background colors', async ({ page }) => {
      await page.goto('');

      // Main container background
      const mainContainer = page.locator('.flex.h-screen');
      await expect(mainContainer).toHaveCSS('background-color', themeColors.bg);

      // Sidebar background (desktop)
      const sidebar = page.locator('aside.hidden.lg\\:flex');
      await expect(sidebar).toHaveCSS('background-color', themeColors.bgSidebar);
    });

    test('should have correct logo styling', async ({ page }) => {
      await page.goto('');

      // Logo circle with primary color
      const logoCircle = page.locator('aside .rounded-full.bg-primary').first();
      await expect(logoCircle).toHaveCSS('background-color', themeColors.primary);
    });

    test('should have correct navigation text colors', async ({ page }) => {
      await page.goto('');

      // Check muted text in navigation
      const navLinks = page.locator('aside nav a.text-text-muted').first();
      if (await navLinks.count() > 0) {
        await expect(navLinks).toHaveCSS('color', themeColors.textMuted);
      }
    });

    test('should take screenshot', async ({ page }) => {
      await page.goto('');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/homepage-colors.png', fullPage: true });
    });
  });

  test.describe('Files Page', () => {
    test('should have correct theme colors', async ({ page }) => {
      await page.goto('files');

      // Page background
      const mainContainer = page.locator('.flex.h-screen');
      await expect(mainContainer).toHaveCSS('background-color', themeColors.bg);
    });

    test('should take screenshot', async ({ page }) => {
      await page.goto('files');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/files-page-colors.png', fullPage: true });
    });
  });

  test.describe('Users Page', () => {
    test('should have correct theme colors', async ({ page }) => {
      await page.goto('users');

      // Page background
      const mainContainer = page.locator('.flex.h-screen');
      await expect(mainContainer).toHaveCSS('background-color', themeColors.bg);
    });

    test('should take screenshot', async ({ page }) => {
      await page.goto('users');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/users-page-colors.png', fullPage: true });
    });
  });

  test.describe('Tutorial Page', () => {
    test('should have correct theme colors', async ({ page }) => {
      await page.goto('tutorial');

      // Page background
      const mainContainer = page.locator('.flex.h-screen');
      await expect(mainContainer).toHaveCSS('background-color', themeColors.bg);
    });

    test('should take screenshot', async ({ page }) => {
      await page.goto('tutorial');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/tutorial-page-colors.png', fullPage: true });
    });
  });

  test.describe('Analysis Page', () => {
    test('should have correct background and card colors', async ({ page }) => {
      await page.goto('analysis/yuanshenyin');

      // Main container background
      const mainContainer = page.locator('.flex.h-screen');
      await expect(mainContainer).toHaveCSS('background-color', themeColors.bg);
    });

    test('should have correct heading colors', async ({ page }) => {
      await page.goto('analysis/yuanshenyin');

      // Page title should use text color
      const pageTitle = page.locator('h1').first();
      await expect(pageTitle).toHaveCSS('color', themeColors.text);
    });

    test('should take screenshot', async ({ page }) => {
      await page.goto('analysis/yuanshenyin');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/analysis-page-colors.png', fullPage: true });
    });
  });

  test.describe('Sidebar Navigation States', () => {
    test('should have correct active state colors', async ({ page }) => {
      await page.goto('');

      // Active nav item should have active background
      const activeNavItem = page.locator('aside nav a.bg-bg-active').first();
      if (await activeNavItem.count() > 0) {
        await expect(activeNavItem).toHaveCSS('background-color', themeColors.bgActive);
      }
    });

    test('should have correct hover state on navigation', async ({ page }) => {
      await page.goto('');

      // Hover over a non-active nav item
      const navItem = page.locator('aside nav a').filter({ hasText: '檔案' }).first();
      await navItem.hover();

      // Take screenshot of hover state
      await page.screenshot({ path: 'test-results/nav-hover-state.png' });
    });
  });

  test.describe('Button Colors', () => {
    test('should verify primary button color on analysis page', async ({ page }) => {
      await page.goto('analysis/yuanshenyin');

      // Check primary buttons
      const primaryButton = page.locator('button.bg-primary').first();
      if (await primaryButton.count() > 0) {
        await expect(primaryButton).toHaveCSS('background-color', themeColors.primary);
      }
    });
  });

  test.describe('Border Colors', () => {
    test('should have correct border colors on sidebar', async ({ page }) => {
      await page.goto('');

      // Sidebar border
      const sidebar = page.locator('aside.hidden.lg\\:flex');
      await expect(sidebar).toHaveCSS('border-right-color', themeColors.border);
    });
  });

  test.describe('Visual Regression - All Pages', () => {
    const pages = [
      { path: '/', name: 'homepage' },
      { path: '/files', name: 'files' },
      { path: '/users', name: 'users' },
      { path: '/tutorial', name: 'tutorial' },
      { path: '/analysis/yuanshenyin', name: 'analysis-yuanshenyin' },
    ];

    for (const pageInfo of pages) {
      test(`should capture ${pageInfo.name} visual snapshot`, async ({ page }) => {
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');

        // Wait a bit for any animations
        await page.waitForTimeout(500);

        await page.screenshot({
          path: `test-results/visual-${pageInfo.name}.png`,
          fullPage: true
        });
      });
    }
  });
});
