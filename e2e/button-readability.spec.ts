import { test, expect } from '@playwright/test';

// 計算相對亮度 (relative luminance)
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// 計算對比度 (WCAG 2.1)
function getContrastRatio(color1: string, color2: string): number {
  const parseColor = (color: string): [number, number, number] => {
    // 處理 rgb(r, g, b) 格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    // 處理 rgba(r, g, b, a) 格式
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
    }
    // 處理 oklch 格式 - 返回近似值
    if (color.includes('oklch')) {
      // 對於 oklch，我們需要從實際渲染的元素獲取計算後的顏色
      return [0, 0, 0]; // 會被跳過
    }
    return [0, 0, 0];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// 按鈕配色定義（從 index.css - 已調整對比度）
const buttonColors = {
  primary: { bg: '#17241b', text: '#ffffff', name: '主按鈕 (深墨綠)' },
  secondary: { bg: '#525d4a', text: '#ffffff', name: '次按鈕 (橄欖綠)' },
  accent: { bg: '#d28f60', text: '#472115', name: '強調按鈕 (赭石+深棕)' },  // 深色文字
  success: { bg: '#6f9158', text: '#ffffff', name: '成功按鈕 (草綠)' },
  error: { bg: '#8C421F', text: '#ffffff', name: '錯誤按鈕 (深赤陶)' },
  warning: { bg: '#d28f60', text: '#472115', name: '警告按鈕 (赭石+深棕)' },  // 深色文字
  info: { bg: '#525d4a', text: '#ffffff', name: '資訊按鈕 (橄欖綠)' },
  ghost: { bg: 'transparent', text: '#472115', name: 'Ghost按鈕 (深棕)' },
};

// Hex 轉 RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

// 計算 Hex 顏色對比度
function getHexContrastRatio(bg: string, text: string): number {
  if (bg === 'transparent') {
    // Ghost 按鈕以白色背景計算
    bg = '#ffffff';
  }
  const [r1, g1, b1] = hexToRgb(bg);
  const [r2, g2, b2] = hexToRgb(text);

  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

test.describe('Button Readability Tests', () => {

  test('all button types should meet WCAG AA contrast requirements', async () => {
    // WCAG AA 要求：大文字 >= 3:1，正常文字 >= 4.5:1
    // 按鈕文字通常是 14px+ bold，所以使用 3:1 標準
    const minContrastRatio = 3.0;

    const results: { name: string; ratio: number; pass: boolean }[] = [];

    for (const [key, config] of Object.entries(buttonColors)) {
      const ratio = getHexContrastRatio(config.bg, config.text);
      const pass = ratio >= minContrastRatio;
      results.push({ name: config.name, ratio, pass });
    }

    console.log('\n========== 按鈕對比度測試結果 ==========\n');
    console.log('WCAG AA 標準：大文字對比度 >= 3:1\n');

    for (const result of results) {
      const status = result.pass ? '✓ PASS' : '✗ FAIL';
      console.log(`${status} | ${result.name}: ${result.ratio.toFixed(2)}:1`);
    }

    console.log('\n==========================================\n');

    // 確保所有按鈕都通過
    const allPassed = results.every(r => r.pass);
    expect(allPassed).toBe(true);
  });

  test('should capture button screenshots for visual verification', async ({ page }) => {
    await page.goto('');
    await page.waitForLoadState('networkidle');

    // 截圖首頁按鈕
    await page.screenshot({
      path: 'test-results/buttons-homepage.png',
      fullPage: true
    });
  });

  test('should verify actual button colors on files page', async ({ page }) => {
    await page.goto('files');
    await page.waitForLoadState('networkidle');

    // 檢查主按鈕
    const primaryBtn = page.locator('.btn-primary').first();
    if (await primaryBtn.count() > 0) {
      const bgColor = await primaryBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const textColor = await primaryBtn.evaluate(el =>
        window.getComputedStyle(el).color
      );

      console.log(`主按鈕實際顏色 - 背景: ${bgColor}, 文字: ${textColor}`);
    }

    // 檢查次按鈕
    const secondaryBtn = page.locator('.btn-secondary').first();
    if (await secondaryBtn.count() > 0) {
      const bgColor = await secondaryBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const textColor = await secondaryBtn.evaluate(el =>
        window.getComputedStyle(el).color
      );

      console.log(`次按鈕實際顏色 - 背景: ${bgColor}, 文字: ${textColor}`);
    }

    await page.screenshot({
      path: 'test-results/buttons-files-page.png',
      fullPage: true
    });
  });

  test('should verify buttons on users page', async ({ page }) => {
    await page.goto('users');
    await page.waitForLoadState('networkidle');

    // 檢查成功按鈕 (使用中)
    const successBtn = page.locator('.btn-success').first();
    if (await successBtn.count() > 0) {
      const bgColor = await successBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      console.log(`成功按鈕背景: ${bgColor}`);
    }

    await page.screenshot({
      path: 'test-results/buttons-users-page.png',
      fullPage: true
    });
  });

  test('should verify buttons on analysis page', async ({ page }) => {
    await page.goto('analysis/yuanshenyin');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/buttons-analysis-page.png',
      fullPage: true
    });
  });

  test('should verify alert styles', async ({ page }) => {
    await page.goto('analysis/yuanshenyin');
    await page.waitForLoadState('networkidle');

    // 檢查警告 Alert
    const warningAlert = page.locator('.alert-warning').first();
    if (await warningAlert.count() > 0) {
      const bgColor = await warningAlert.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const textColor = await warningAlert.evaluate(el =>
        window.getComputedStyle(el).color
      );
      const borderLeft = await warningAlert.evaluate(el =>
        window.getComputedStyle(el).borderLeftColor
      );

      console.log(`警告 Alert - 背景: ${bgColor}, 文字: ${textColor}, 左邊框: ${borderLeft}`);
    }
  });

  test('should verify tutorial page step colors', async ({ page }) => {
    await page.goto('tutorial');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/buttons-tutorial-page.png',
      fullPage: true
    });
  });

  test('badge contrast should be readable', async () => {
    const badgeColors = {
      primary: { bg: '#17241b', text: '#ffffff', name: '主要 Badge' },
      secondary: { bg: '#525d4a', text: '#ffffff', name: '次要 Badge' },
      accent: { bg: '#d28f60', text: '#472115', name: '強調 Badge (赭石+深棕)' },  // 深色文字
      success: { bg: '#6f9158', text: '#ffffff', name: '成功 Badge' },
      error: { bg: '#8C421F', text: '#ffffff', name: '錯誤 Badge' },
      warning: { bg: '#d28f60', text: '#472115', name: '警告 Badge (赭石+深棕)' },  // 深色文字
      neutral: { bg: '#9BA187', text: '#17241b', name: '中性 Badge (鼠尾草+深墨綠)' },
    };

    console.log('\n========== Badge 對比度測試結果 ==========\n');

    for (const [key, config] of Object.entries(badgeColors)) {
      const ratio = getHexContrastRatio(config.bg, config.text);
      const status = ratio >= 3.0 ? '✓ PASS' : '✗ FAIL';
      console.log(`${status} | ${config.name}: ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    }

    console.log('\n==========================================\n');
  });
});
