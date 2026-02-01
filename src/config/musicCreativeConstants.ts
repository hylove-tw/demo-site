// src/config/musicCreativeConstants.ts
// 元神音創意平台 — 常數與輔助函式

// ── 音中心 ──────────────────────────────────────────────

export const KEY_CENTERS = {
  major: [
    { value: 'C', label: 'C 大調' },
    { value: 'G', label: 'G 大調' },
    { value: 'F', label: 'F 大調' },
    { value: 'D', label: 'D 大調' },
    { value: 'Bb', label: 'Bb 大調' },
  ],
  minor: [
    { value: 'A', label: 'A 小調' },
    { value: 'E', label: 'E 小調' },
    { value: 'D', label: 'D 小調' },
    { value: 'B', label: 'B 小調' },
    { value: 'G', label: 'G 小調' },
  ],
} as const;

// ── 主旋律 ──────────────────────────────────────────────

export interface MelodyPattern {
  id: number;
  timeSignature: string;
  noteValues: [string, string, string, string]; // val0, val1, val2, val3
}

export const MELODY_PATTERNS: MelodyPattern[] = [
  { id: 1, timeSignature: '4/4', noteValues: ['全音符', '1/2 音符', '1/4 音符', '1/8 音符'] },
  { id: 2, timeSignature: '4/8', noteValues: ['全音符', '1/2 音符', '1/4 音符', '1/8 音符'] },
  { id: 3, timeSignature: '3/8', noteValues: ['全音符', '1/2 音符', '1/4 音符', '1/8 音符'] },
  { id: 4, timeSignature: '3/8', noteValues: ['1/2 音符', '1/4 音符', '1/8 音符', '1/16 音符'] },
  { id: 5, timeSignature: '4/4', noteValues: ['1/2 音符', '1/4 音符', '1/8 音符', '1/16 音符'] },
  { id: 6, timeSignature: '3/4', noteValues: ['1/2 音符', '1/4 音符', '1/8 音符', '1/16 音符'] },
  { id: 7, timeSignature: '6/8', noteValues: ['1/2 音符', '1/4 音符', '1/8 音符', '1/16 音符'] },
  { id: 8, timeSignature: '12/16', noteValues: ['1/4 音符', '1/8 音符', '1/16 音符', '1/32 音符'] },
  { id: 9, timeSignature: '8/16', noteValues: ['1/4 音符', '1/8 音符', '1/16 音符', '1/32 音符'] },
];

// ── 曲風 ────────────────────────────────────────────────

export interface Genre {
  id: string;
  nameZh: string;
  nameEn: string;
  bpmRange: [number, number]; // [min, max]
  timeSignature: string;
  beatPattern: string; // 節拍輕重音說明
}

export const GENRES: Genre[] = [
  { id: 'waltz', nameZh: '華爾滋', nameEn: 'Waltz', bpmRange: [60, 120], timeSignature: '3/4', beatPattern: '重-輕-輕' },
  { id: 'soul', nameZh: '靈魂', nameEn: 'Soul', bpmRange: [30, 60], timeSignature: '4/4', beatPattern: '重-輕-輕-輕' },
  { id: 'blues', nameZh: '布魯斯', nameEn: 'Blues', bpmRange: [60, 80], timeSignature: '4/4', beatPattern: '重-輕-輕-輕' },
  { id: 'tango', nameZh: '探戈', nameEn: 'Tango', bpmRange: [60, 100], timeSignature: '4/4', beatPattern: '重-重-輕-輕-重' },
  { id: 'giliba', nameZh: '吉利巴', nameEn: 'Giliba', bpmRange: [80, 120], timeSignature: '4/8', beatPattern: '重-輕-重-輕' },
  { id: 'rumba', nameZh: '倫巴', nameEn: 'Rumba', bpmRange: [80, 100], timeSignature: '4/4', beatPattern: '重-輕-輕-重-重' },
  { id: 'disco', nameZh: '迪斯可', nameEn: 'Disco', bpmRange: [90, 120], timeSignature: '4/8', beatPattern: '重-輕-重-輕' },
  { id: 'twist', nameZh: '扭扭', nameEn: 'Twist', bpmRange: [60, 120], timeSignature: '4/4', beatPattern: '重-輕-重-輕' },
  { id: 'reggae', nameZh: '雷鬼', nameEn: 'Reggae', bpmRange: [60, 120], timeSignature: '4/4', beatPattern: '重-輕-重-輕' },
  { id: 'rock', nameZh: '搖滾', nameEn: 'Rock', bpmRange: [60, 120], timeSignature: '2/4', beatPattern: '重-輕-重-輕' },
  { id: 'country', nameZh: '鄉村', nameEn: 'Country', bpmRange: [60, 100], timeSignature: '4/8', beatPattern: '重-輕-重-輕' },
  { id: 'quick-waltz', nameZh: '圓舞曲', nameEn: 'Quick Waltz', bpmRange: [60, 120], timeSignature: '6/8', beatPattern: '重-輕-輕-重-輕-輕' },
];

// ── 曲風-主旋律相容矩陣 ─────────────────────────────────
// key = genre id, value = set of compatible melody pattern ids

export const GENRE_MELODY_COMPATIBILITY: Record<string, Set<number>> = {
  waltz:        new Set([3, 4, 6, 7]),
  soul:         new Set([1, 2, 3, 4, 5, 8, 9]),
  blues:        new Set([1, 5, 8]),
  tango:        new Set([1, 5]),
  giliba:       new Set([2, 5, 9]),
  rumba:        new Set([1, 5]),
  disco:        new Set([5, 8]),
  twist:        new Set([5, 8]),
  reggae:       new Set([2, 5, 8]),
  rock:         new Set([5, 8]),
  country:      new Set([2, 4, 5, 7, 8, 9]),
  'quick-waltz': new Set([3, 6, 7]),
};

// ── 腦波背景頻率 ────────────────────────────────────────

export interface BrainwaveFrequency {
  value: number;
  label: string;
  description: string;
}

export const BRAINWAVE_FREQUENCIES: BrainwaveFrequency[] = [
  { value: 2, label: '2 Hz', description: '助眠' },
  { value: 6, label: '6 Hz', description: '心靈' },
  { value: 7.83, label: '7.83 Hz', description: '舒適' },
  { value: 9, label: '9 Hz', description: '放鬆' },
  { value: 11.5, label: '11.5 Hz', description: '學習' },
  { value: 16.5, label: '16.5 Hz', description: '積極' },
  { value: 25, label: '25 Hz', description: '專注' },
  { value: 35, label: '35 Hz', description: '管理' },
  { value: 40, label: '40 Hz', description: '防老' },
  { value: 58, label: '58 Hz', description: '堅毅' },
];

// ── 自然音效 ────────────────────────────────────────────

export interface NatureSound {
  value: string;
  label: string;
}

export const NATURE_SOUNDS: NatureSound[] = [
  { value: 'ocean', label: '海浪' },
  { value: 'wind', label: '風聲' },
  { value: 'rain', label: '雨滴' },
  { value: 'leaves', label: '樹葉' },
  { value: 'windchime', label: '風鈴' },
];

// ── Helper 函式 ─────────────────────────────────────────

/** 給定曲風 id，回傳相容的主旋律列表 */
export function getCompatibleMelodies(genreId: string): MelodyPattern[] {
  const compatSet = GENRE_MELODY_COMPATIBILITY[genreId];
  if (!compatSet) return MELODY_PATTERNS;
  return MELODY_PATTERNS.filter((m) => compatSet.has(m.id));
}

/** 給定主旋律 id，回傳相容的曲風列表 */
export function getCompatibleGenres(melodyId: number): Genre[] {
  return GENRES.filter((g) => {
    const compatSet = GENRE_MELODY_COMPATIBILITY[g.id];
    return compatSet ? compatSet.has(melodyId) : false;
  });
}

/** 計算 BPM 中位值 */
export function getBpmMidpoint(bpmRange: [number, number]): number {
  return Math.round((bpmRange[0] + bpmRange[1]) / 2);
}
