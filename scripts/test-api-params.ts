// scripts/test-api-params.ts
// 元神音創意平台 — API 參數組合驗證腳本
// 用法: npx ts-node --skip-project scripts/test-api-params.ts

import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosError } from 'axios';

// ── 讀取 .env ──────────────────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const API_BASE = process.env.REACT_APP_ANALYSIS_API_BASE || 'https://hylove-demo.good-nas.cc';
const REQUEST_TIMEOUT = 60_000;

// ── CSV 解析（複製自 src/utils/transformCSVDataToPayload.ts）──
function transformCSVDataToPayload(csvText: string): Record<string, (number | string | null)[]> {
  const requiredKeys = [
    'Good Signal Quality(0-100)', 'Mark', 'Attention', 'Meditation',
    'Delta', 'Theta', 'Low Alpha', 'High Alpha',
    'Low Beta', 'High Beta', 'Low Gamma', 'High Gamma',
  ];

  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) {
    const obj: any = {};
    requiredKeys.forEach(key => (obj[key] = [null]));
    return obj;
  }

  const header = lines[0].split(',').map(item => item.trim());
  const mapping: Record<string, number | null> = {};
  requiredKeys.forEach(key => {
    const idx = header.findIndex(item => item === key);
    mapping[key] = idx !== -1 ? idx : null;
  });

  const payload: Record<string, (number | string | null)[]> = {};
  requiredKeys.forEach(key => { payload[key] = []; });

  for (let r = 1; r < lines.length; r++) {
    const row = lines[r].split(',').map(item => item.trim());
    if (row.length < header.length) continue;
    requiredKeys.forEach(key => {
      const colIndex = mapping[key];
      if (colIndex === null || colIndex >= row.length) {
        payload[key].push(null);
      } else {
        const num = parseFloat(row[colIndex]);
        payload[key].push(isNaN(num) ? row[colIndex] : num);
      }
    });
  }
  return payload;
}

// ── 載入真實腦波資料 ──────────────────────────────────────
const sampleDir = path.resolve(__dirname, '..', 'tmp_docs', 'sample_data');
const beforeBrainData = transformCSVDataToPayload(
  fs.readFileSync(path.join(sampleDir, '前測.csv'), 'utf-8')
);
const afterBrainData = transformCSVDataToPayload(
  fs.readFileSync(path.join(sampleDir, '後測.csv'), 'utf-8')
);

// ── 常數 ────────────────────────────────────────────────
const GENRES = [
  { id: 'waltz', bpmRange: [60, 120] as [number, number] },
  { id: 'soul', bpmRange: [30, 60] as [number, number] },
  { id: 'blues', bpmRange: [60, 80] as [number, number] },
  { id: 'tango', bpmRange: [60, 100] as [number, number] },
  { id: 'giliba', bpmRange: [80, 120] as [number, number] },
  { id: 'rumba', bpmRange: [80, 100] as [number, number] },
  { id: 'disco', bpmRange: [90, 120] as [number, number] },
  { id: 'twist', bpmRange: [60, 120] as [number, number] },
  { id: 'reggae', bpmRange: [60, 120] as [number, number] },
  { id: 'rock', bpmRange: [60, 120] as [number, number] },
  { id: 'country', bpmRange: [60, 100] as [number, number] },
  { id: 'quick-waltz', bpmRange: [60, 120] as [number, number] },
];

// 曲風 → 第一個相容主旋律
const GENRE_FIRST_MELODY: Record<string, number> = {
  waltz: 3, soul: 1, blues: 1, tango: 1,
  giliba: 2, rumba: 1, disco: 5, twist: 5,
  reggae: 2, rock: 5, country: 2, 'quick-waltz': 3,
};

const KEY_CENTERS_MAJOR = ['C', 'G', 'F', 'D', 'Bb'];
const KEY_CENTERS_MINOR = ['A', 'E', 'D', 'B', 'G'];

// ── 測試案例定義 ────────────────────────────────────────

type Endpoint = '/api/v2/music' | '/api/v1/music' | '/api/v1/dualmusic';
type PayloadType = 'single' | 'single-legacy' | 'dual-creative' | 'dual-legacy';

interface TestCase {
  name: string;
  group: string;
  endpoint: Endpoint;
  payloadType: PayloadType;
  params: Record<string, any>;
}

function bpmMid(range: [number, number]): number {
  return Math.round((range[0] + range[1]) / 2);
}

const testCases: TestCase[] = [];

// ── Group 1: 基線測試（4 tests）───────────────────────
testCases.push({
  name: 'default single creative',
  group: 'G1-基線',
  endpoint: '/api/v2/music',
  payloadType: 'single',
  params: {},
});
testCases.push({
  name: 'default dual creative',
  group: 'G1-基線',
  endpoint: '/api/v1/dualmusic',
  payloadType: 'dual-creative',
  params: {},
});
testCases.push({
  name: 'default single legacy',
  group: 'G1-基線',
  endpoint: '/api/v1/music',
  payloadType: 'single-legacy',
  params: {},
});
testCases.push({
  name: 'default dual legacy',
  group: 'G1-基線',
  endpoint: '/api/v1/dualmusic',
  payloadType: 'dual-legacy',
  params: {},
});

// ── Group 2: 曲風 × 相容主旋律（12 tests）─────────────
for (const genre of GENRES) {
  const melody = GENRE_FIRST_MELODY[genre.id];
  testCases.push({
    name: `${genre.id}+melody${melody}`,
    group: 'G2-曲風×旋律',
    endpoint: '/api/v2/music',
    payloadType: 'single',
    params: {
      genre: genre.id,
      melodyPattern: melody,
      bpm: bpmMid(genre.bpmRange),
    },
  });
}

// ── Group 3: 調性覆蓋（10 tests）─────────────────────
for (const key of KEY_CENTERS_MAJOR) {
  testCases.push({
    name: `${key}-major`,
    group: 'G3-調性',
    endpoint: '/api/v2/music',
    payloadType: 'single',
    params: { keyCenter: key, keyType: 'major' },
  });
}
for (const key of KEY_CENTERS_MINOR) {
  testCases.push({
    name: `${key}-minor`,
    group: 'G3-調性',
    endpoint: '/api/v2/music',
    payloadType: 'single',
    params: { keyCenter: key, keyType: 'minor' },
  });
}

// ── Group 4: 樂器輪替（3 tests）──────────────────────
const instrumentSets = [
  ['piano', 'guitar', 'bass'],
  ['violin', 'flute', 'saxophone'],
  ['cello', 'electric guitar', 'vocals'],
];
for (const [p1, p2, p3] of instrumentSets) {
  testCases.push({
    name: `instruments:${p1}/${p2}/${p3}`,
    group: 'G4-樂器',
    endpoint: '/api/v2/music',
    payloadType: 'single',
    params: { p1, p2, p3 },
  });
}

// ── Group 5: 背景音效覆蓋（5 tests）──────────────────
const soundFreqPairs: [string, number][] = [
  ['ocean', 2],
  ['wind', 7.83],
  ['rain', 25],
  ['leaves', 40],
  ['windchime', 58],
];
for (const [sound, freq] of soundFreqPairs) {
  testCases.push({
    name: `${sound}+${freq}Hz`,
    group: 'G5-背景音效',
    endpoint: '/api/v2/music',
    payloadType: 'single',
    params: { natureSound: sound, brainwaveFrequency: freq },
  });
}

// ── Group 6: 雙人模式 creative（3 tests）──────────────
testCases.push({
  name: 'dual waltz+D-major',
  group: 'G6-雙人創意',
  endpoint: '/api/v1/dualmusic',
  payloadType: 'dual-creative',
  params: { genre: 'waltz', keyCenter: 'D', keyType: 'major', bpm: 90, melodyPattern: 3 },
});
testCases.push({
  name: 'dual rock+A-minor+25Hz',
  group: 'G6-雙人創意',
  endpoint: '/api/v1/dualmusic',
  payloadType: 'dual-creative',
  params: { genre: 'rock', keyCenter: 'A', keyType: 'minor', brainwaveFrequency: 25, bpm: 90, melodyPattern: 5 },
});
testCases.push({
  name: 'dual soul+Bb-major+rain',
  group: 'G6-雙人創意',
  endpoint: '/api/v1/dualmusic',
  payloadType: 'dual-creative',
  params: { genre: 'soul', keyCenter: 'Bb', keyType: 'major', natureSound: 'rain', bpm: 45, melodyPattern: 1 },
});

// ── Group 7: 邊界值（4 tests）─────────────────────────
testCases.push({
  name: 'BPM-30+3/8',
  group: 'G7-邊界',
  endpoint: '/api/v2/music',
  payloadType: 'single',
  params: { bpm: 30, time_signature: '3/8', melodyPattern: 3 },
});
testCases.push({
  name: 'BPM-200+12/16',
  group: 'G7-邊界',
  endpoint: '/api/v2/music',
  payloadType: 'single',
  params: { bpm: 200, time_signature: '12/16', melodyPattern: 8 },
});
testCases.push({
  name: 'spiritual+melody2',
  group: 'G7-邊界',
  endpoint: '/api/v2/music',
  payloadType: 'single',
  params: { musicType: 'spiritual', melodyPattern: 2 },
});
testCases.push({
  name: 'recordingTime=1',
  group: 'G7-邊界',
  endpoint: '/api/v2/music',
  payloadType: 'single',
  params: { recordingTime: 1 },
});

// ── Payload 組裝 ─────────────────────────────────────────

function buildPayload(tc: TestCase): Record<string, any> {
  const p = tc.params;

  if (tc.payloadType === 'single-legacy') {
    return {
      title: p.title || '測試樂譜',
      bpm: p.bpm || 60,
      time_signature: p.time_signature || '4/4',
      p1: p.p1 || 'piano',
      p2: p.p2 || 'piano',
      p3: p.p3 || 'piano',
      beforeBrainData,
      afterBrainData,
    };
  }

  if (tc.payloadType === 'single') {
    return {
      title: p.title || '測試樂譜',
      bpm: p.bpm || 60,
      time_signature: p.time_signature || '4/4',
      p1: p.p1 || 'piano',
      p2: p.p2 || 'piano',
      p3: p.p3 || 'piano',
      beforeBrainData,
      afterBrainData,
      musicType: p.musicType || 'emotion',
      recordingTime: p.recordingTime || 5,
      keyCenter: p.keyCenter || 'C',
      keyType: p.keyType || 'major',
      melodyPattern: p.melodyPattern || 1,
      genre: p.genre || '',
      brainwaveFrequency: p.brainwaveFrequency ?? null,
      natureSound: p.natureSound || '',
    };
  }

  if (tc.payloadType === 'dual-creative') {
    return {
      title: p.title || '測試樂譜',
      bpm: p.bpm || 60,
      time_signature: p.time_signature || '4/4',
      genre: p.genre || '',
      musicType: p.musicType || 'emotion',
      keyCenter: p.keyCenter || 'C',
      keyType: p.keyType || 'major',
      recordingTime: p.recordingTime || 5,
      brainwaveFrequency: p.brainwaveFrequency ?? null,
      natureSound: p.natureSound || '',
      first_player: {
        instrument: {
          p1: p.first_p1 || 'piano',
          p2: p.first_p2 || 'piano',
          p3: p.first_p3 || 'piano',
        },
        ...beforeBrainData,
      },
      second_player: {
        instrument: {
          p1: p.second_p1 || 'piano',
          p2: p.second_p2 || 'piano',
          p3: p.second_p3 || 'piano',
        },
        ...afterBrainData,
      },
    };
  }

  // dual-legacy
  return {
    title: p.title || '測試樂譜',
    bpm: p.bpm || 60,
    time_signature: p.time_signature || '4/4',
    first_player: {
      instrument: {
        p1: p.first_p1 || 'piano',
        p2: p.first_p2 || 'piano',
        p3: p.first_p3 || 'piano',
      },
      ...beforeBrainData,
    },
    second_player: {
      instrument: {
        p1: p.second_p1 || 'piano',
        p2: p.second_p2 || 'piano',
        p3: p.second_p3 || 'piano',
      },
      ...afterBrainData,
    },
  };
}

// ── HTTP 請求 ─────────────────────────────────────────────

interface TestResult {
  index: number;
  name: string;
  group: string;
  endpoint: string;
  passed: boolean;
  status?: number;
  elapsedMs: number;
  error?: string;
}

async function runTest(tc: TestCase, index: number, total: number): Promise<TestResult> {
  const url = `${API_BASE}${tc.endpoint}`;
  const payload = buildPayload(tc);
  const start = Date.now();

  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: REQUEST_TIMEOUT,
      validateStatus: () => true, // don't throw on non-2xx
    });

    const elapsed = Date.now() - start;
    const ok = response.status >= 200 && response.status < 300;

    if (ok) {
      const icon = '\x1b[32m✓\x1b[0m';
      const time = `${(elapsed / 1000).toFixed(1)}s`;
      console.log(
        `[${String(index + 1).padStart(2)}/${total}] ${icon} ${tc.endpoint.padEnd(20)} (${tc.name})`.padEnd(76) + time
      );
      return { index, name: tc.name, group: tc.group, endpoint: tc.endpoint, passed: true, status: response.status, elapsedMs: elapsed };
    } else {
      const body = response.data;
      let errMsg = `${response.status}`;
      if (body) {
        const detail = body.message || body.error || JSON.stringify(body).slice(0, 80);
        errMsg += `: ${detail}`;
      }

      const icon = '\x1b[31m✗\x1b[0m';
      const time = `${(elapsed / 1000).toFixed(1)}s`;
      console.log(
        `[${String(index + 1).padStart(2)}/${total}] ${icon} ${tc.endpoint.padEnd(20)} (${tc.name})`.padEnd(76) + `${time}  → ${errMsg}`
      );
      return { index, name: tc.name, group: tc.group, endpoint: tc.endpoint, passed: false, status: response.status, elapsedMs: elapsed, error: errMsg };
    }
  } catch (err: any) {
    const elapsed = Date.now() - start;
    let errMsg: string;
    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') {
        errMsg = 'TIMEOUT';
      } else {
        errMsg = err.message;
      }
    } else {
      errMsg = err.message || String(err);
    }

    const icon = '\x1b[31m✗\x1b[0m';
    const time = `${(elapsed / 1000).toFixed(1)}s`;
    console.log(
      `[${String(index + 1).padStart(2)}/${total}] ${icon} ${tc.endpoint.padEnd(20)} (${tc.name})`.padEnd(76) + `${time}  → ${errMsg}`
    );
    return { index, name: tc.name, group: tc.group, endpoint: tc.endpoint, passed: false, elapsedMs: elapsed, error: errMsg };
  }
}

// ── 主程式 ────────────────────────────────────────────────

async function main() {
  const total = testCases.length;
  console.log(`\n元神音創意平台 — API 參數組合驗證`);
  console.log(`API Base: ${API_BASE}`);
  console.log(`測試案例: ${total}\n`);
  console.log('═'.repeat(90));

  const results: TestResult[] = [];
  let currentGroup = '';

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    if (tc.group !== currentGroup) {
      currentGroup = tc.group;
      console.log(`\n── ${currentGroup} ${'─'.repeat(Math.max(0, 80 - currentGroup.length))}`);
    }
    const result = await runTest(tc, i, total);
    results.push(result);
  }

  // 統計
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed);
  const totalTime = results.reduce((sum, r) => sum + r.elapsedMs, 0);

  console.log('\n' + '═'.repeat(90));
  console.log(`Results: ${passed}/${total} passed, ${failed.length} failed (total: ${(totalTime / 1000).toFixed(1)}s)`);

  if (failed.length > 0) {
    console.log('\nFailed:');
    for (const f of failed) {
      console.log(`  #${String(f.index + 1).padStart(2)}  ${f.endpoint} ${f.name}: ${f.error}`);
    }
  }

  console.log('');
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
