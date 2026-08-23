// scripts/e2e-music-export-cache.mjs
//
// Real end-to-end verification that refreshing a report page reuses a
// previously-completed MP3 export instead of resynthesizing from scratch
// (see src/utils/musicExportCache.ts), and reuses that task's rendered
// score instead of re-rendering it too (src/utils/musicScoreCache.ts — a
// user report after the MP3 fix shipped: "✓ MP3 已合成" appeared instantly
// while "渲染樂譜中…" kept spinning, since only the MP3 side had been
// cached). Unit tests exercise this logic in isolation; this script drives
// the actual built app in a real browser, only mocking the music-gen HTTP
// boundary, and asserts on real network request counts — which is what
// actually caught a real bug unit tests missed (yuanshenyinv2.tsx's
// renderReport wrapper silently dropping the cache key before it ever
// reached MusicReportEditor).
//
// Usage:
//   npm run build && npx serve -s build -l 4173 &
//   node scripts/e2e-music-export-cache.mjs
//
// Requires a cached Playwright Chromium at the path below (adjust if yours
// differs) and a server for the built app at http://localhost:4173.

import { chromium } from 'playwright';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:4173';
const CHROMIUM_PATH = process.env.E2E_CHROMIUM_PATH
    || '/home/weifan/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

const REPORT_ID = 999999001;
const MINIMAL_MUSICXML = '<?xml version="1.0"?><score-partwise><part-list><score-part id="P1"><part-name>P1</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes><note><rest/><duration>4</duration></note></measure></part></score-partwise>';

const history = [{
    id: REPORT_ID,
    analysisId: 'yuanshenyin-v2',
    analysisName: '元神音創意平台',
    selectedFileIds: [1, 2],
    result: {
        musicXML: MINIMAL_MUSICXML,
        _beforeBrainData: { alpha: 1 },
        _afterBrainData: { alpha: 2 },
    },
    customParams: {
        title: 'E2E 快取測試', bpm: 90, genre: 'reggae', beat: 'reggae',
        p1: 'flute', p2: 'piano', p3: 'cello',
    },
    description: 'E2E cache test',
    timestamp: new Date().toISOString(),
    userId: 'e2e-user',
    status: '成功',
}];

let failures = 0;
function assertEqual(label, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    if (!ok) failures++;
}

const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on('pageerror', (err) => console.log('PAGE EXCEPTION:', err.message));

let generateCount = 0;
let renderScoreCount = 0;
const taskPolls = [];

await page.route('**/api/music-gen/api/v1/presets', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));

await page.route('**/api/music-gen/api/v1/generate', (route) => {
    generateCount++;
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ task_id: 'e2e-task-abc' }) });
});

await page.route('**/api/music-gen/api/v1/tasks/*', (route) => {
    const taskId = route.request().url().split('/').pop();
    taskPolls.push(taskId);
    if (taskId === 'e2e-task-abc') {
        return route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                status: 'completed',
                stem_urls: { p1: '/x/p1.mp3', p2: '/x/p2.mp3', p3: '/x/p3.mp3', drums: '/x/drums.mp3' },
            }),
        });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'not found' }) });
});

await page.route('**/api/music-gen/api/v1/render-score', (route) => {
    renderScoreCount++;
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ pages: ['<svg xmlns="http://www.w3.org/2000/svg"></svg>'] }) });
});

await page.route('**/api/music-gen/api/v1/score/**', (route) =>
    route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'no saved score' }) }));

// Seed localStorage (needs a same-origin page loaded first), then navigate
// to the report page it describes.
await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate((h) => localStorage.setItem('analysisHistory', JSON.stringify(h)), history);

const READY_SELECTOR = 'text=輸出混音結果'; // StemMixer's own button — only
// renders once exportState.status === 'completed'. Do NOT use 混音器 alone:
// that substring also appears in the plugin's static description text,
// which is present on the page immediately regardless of export state.

console.log('=== STEP 1: first load ===');
await page.goto(`${BASE_URL}/analysis/report/${REPORT_ID}`, { waitUntil: 'networkidle' });
await page.waitForSelector(READY_SELECTOR, { timeout: 20000 });
// The mixer's "輸出混音結果" button only depends on the MP3 export
// completing — the separately-debounced (800ms) score-render effect can
// still be mid-flight at that instant, so give it a moment before checking
// its cache write specifically.
await page.waitForTimeout(1500);
assertEqual('generate calls on first load', generateCount, 1);
assertEqual('cache written after first load', await page.evaluate(() => localStorage.getItem('musicGenTaskCache')),
    JSON.stringify({ [String(REPORT_ID)]: 'e2e-task-abc' }));
// Pre-existing, correct behavior — not what this script is about: the
// score-render effect legitimately fires twice on a genuinely fresh
// generation (once before exportState.taskId is known, once after, to
// fetch the server-authoritative version). Only the cache-hit reload path
// below (STEP 2) is the actual thing being verified: zero *additional*
// render-score calls once a task's score is already cached.
assertEqual('score rendered at least once on first load', renderScoreCount >= 1, true);
assertEqual('score cached under the task id after first load',
    await page.evaluate(() => JSON.parse(localStorage.getItem('musicScorePagesCache') || '{}')['e2e-task-abc'] !== undefined),
    true);

console.log('\n=== STEP 2: reload — should reuse the cached task AND its cached score, not regenerate either ===');
const generateCountBeforeReload = generateCount;
const renderScoreCountBeforeReload = renderScoreCount;
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector(READY_SELECTOR, { timeout: 20000 });
assertEqual('NEW generate calls on reload (should be 0)', generateCount - generateCountBeforeReload, 0);
assertEqual('NEW render-score calls on reload (should be 0)', renderScoreCount - renderScoreCountBeforeReload, 0);
assertEqual('a lightweight task-status check happened', taskPolls.includes('e2e-task-abc'), true);

console.log('\n=== STEP 3: stale cached task id — should fall back to a fresh generate, no visible error ===');
await page.evaluate((id) => {
    localStorage.setItem('musicGenTaskCache', JSON.stringify({ [id]: 'stale-task-999' }));
}, String(REPORT_ID));
const generateCountBeforeStale = generateCount;
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector(READY_SELECTOR, { timeout: 20000 });
assertEqual('falls back to exactly one fresh generate', generateCount - generateCountBeforeStale, 1);
assertEqual('no error message shown to the user', await page.locator('text=合成失敗').count(), 0);
assertEqual('cache updated to the new valid task id',
    await page.evaluate(() => localStorage.getItem('musicGenTaskCache')),
    JSON.stringify({ [String(REPORT_ID)]: 'e2e-task-abc' }));

await browser.close();

console.log(`\n${failures === 0 ? 'ALL PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
