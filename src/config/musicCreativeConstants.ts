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

// ── 拍號相容性工具 ──────────────────────────────────────
// 節拍預設只有 4/4 和 3/4 兩種拍號。
// 此函式將相同拍數但不同 beat-type 的拍號正規化為預設支援的拍號。
// 例：4/8→4/4, 3/8→3/4（拍數相同，只是 beat-type 不同）

/**
 * 取得與指定拍號相容的節拍預設拍號
 *
 * @returns 相容的預設拍號，若無相容預設則回傳 null
 */
export function getCompatibleBeatTimeSignature(timeSignature: string): string | null {
  const [beats, beatType] = timeSignature.split('/').map(Number);
  // 4 拍系列：4/4, 4/8 → 使用 4/4 預設
  if (beats === 4 && (beatType === 4 || beatType === 8)) return '4/4';
  // 3 拍系列：3/4, 3/8 → 使用 3/4 預設
  if (beats === 3 && (beatType === 4 || beatType === 8)) return '3/4';
  // 6/8 → 複合拍，與 3/4 結構不同，暫不自動映射
  // 2/4, 8/16, 12/16 等 → 無直接相容預設
  return null;
}

// ── 曲風→節拍預設映射 ──────────────────────────────────
// 將每個曲風 ID 映射到最接近的節拍預設 ID（beatPresets.ts）

export const GENRE_BEAT_MAP: Record<string, string> = {
  waltz: 'waltz',
  soul: 'bossanova',
  blues: 'jazz',
  tango: 'tango',
  giliba: 'pop',
  rumba: 'rumba',
  disco: 'pop',
  twist: 'rock',
  reggae: 'reggae',
  rock: 'rock',
  country: 'country',
  'quick-waltz': 'waltz',
};

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

// ── 轉調工具 ──────────────────────────────────────────────
// Spec: 「程式計算皆以 C 大調產生音符」，再依使用者選擇的調性做轉調。
// 轉調方式：每一級升半音（參照 spec 半音階對照表）。

/** 驗證 keyCenter 是否屬於指定 keyType 的合法調性 */
export function isValidKeyCenter(
  keyCenter: string,
  keyType: 'major' | 'minor',
): boolean {
  return KEY_CENTERS[keyType].some((k) => k.value === keyCenter);
}

/**
 * 解析並驗證調性，回傳安全的 keyCenter
 *
 * - 合法組合：原樣回傳
 * - keyCenter 合法但 keyType 不符：回傳該 keyType 的第一個調性（大調=C，小調=A）
 * - keyCenter 不在任何清單中：回傳該 keyType 的第一個調性
 *
 * @returns `{ keyCenter, fallback }` — fallback 為 true 表示使用了預設值
 */
export function resolveKeyCenter(
  keyCenter: string,
  keyType: 'major' | 'minor',
): { keyCenter: string; fallback: boolean } {
  if (isValidKeyCenter(keyCenter, keyType)) {
    return { keyCenter, fallback: false };
  }
  return { keyCenter: KEY_CENTERS[keyType][0].value, fallback: true };
}

/** C 大調各音級在半音階上的位置（一個八度內，0-6 對應 C D E F G A B） */
const C_MAJOR_SEMITONES = [0, 2, 4, 5, 7, 9, 11] as const;

/** 各調性根音相對 C 的半音偏移量 */
const KEY_SEMITONE_OFFSETS: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, Bb: 10, B: 11,
};

/**
 * 半音階音名表（兩個完整八度 + 延伸，對應 spec 半音階對照表）
 * index 0 = C, 12 = c (高八度), 24 = c' (再高八度)
 */
const CHROMATIC_NOTE_NAMES = [
  // 第一個八度 (0-11)
  'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B',
  // 第二個八度 (12-23)
  'c', 'c#/db', 'd', 'd#/eb', 'e', 'f', 'f#/gb', 'g', 'g#/ab', 'a', 'a#/bb', 'b',
  // 延伸 (24-35)
  "c'", "c#'/db'", "d'", "d#'/eb'", "e'", "f'", "f#'/gb'", "g'", "g#'/ab'", "a'", "a#'/bb'", "b'",
] as const;

/**
 * 將 C 大調的「計算值」轉為半音階索引
 *
 * Spec 定義：
 *  - 第二、第三音域：計算值 0-7 → C D E F G A B c（音級 0-7），
 *                   計算值 8-15 → c d e f g a b c'（音級 0-7 + 12 半音）
 *  - 第一音域：計算值 0-7 → C, D, E, F, G, A, B, C（低八度）
 *
 * @param diatonicValue  C 大調計算值（0-7 或 0-15）
 */
export function diatonicToChromaticIndex(diatonicValue: number): number {
  const octave = Math.floor(diatonicValue / 8);
  const degree = diatonicValue % 8;

  if (degree === 7) {
    // 音級 7 = 下一個八度的根音 (C/c/c')
    return (octave + 1) * 12;
  }
  return C_MAJOR_SEMITONES[degree] + octave * 12;
}

/**
 * 轉調：將 C 大調計算值轉換為目標調性的半音階索引
 *
 * @param diatonicValue  C 大調計算值（0-15）
 * @param keyCenter      目標調性根音（e.g. 'G', 'Bb', 'A'）
 * @returns 轉調後的半音階索引
 *
 * @example
 * transposeNote(0, 'C')  // 0  → C 不變
 * transposeNote(0, 'G')  // 7  → G
 * transposeNote(4, 'D')  // 9  → A（C 大調 G + 2 半音 = A）
 * transposeNote(8, 'F')  // 17 → f
 */
export function transposeNote(diatonicValue: number, keyCenter: string): number {
  const chromatic = diatonicToChromaticIndex(diatonicValue);
  const offset = KEY_SEMITONE_OFFSETS[keyCenter] ?? 0;
  return chromatic + offset;
}

/**
 * 取得半音階索引對應的音名
 *
 * @param chromaticIndex  半音階索引（0 起始）
 * @returns 音名字串，超出預定義範圍時回傳數值表示
 */
export function getChromaticNoteName(chromaticIndex: number): string {
  if (chromaticIndex >= 0 && chromaticIndex < CHROMATIC_NOTE_NAMES.length) {
    return CHROMATIC_NOTE_NAMES[chromaticIndex];
  }
  return `[${chromaticIndex}]`;
}

/**
 * 批次轉調：將一組 C 大調計算值轉為目標調性的音名
 *
 * @param diatonicValues  C 大調計算值陣列
 * @param keyCenter       目標調性根音
 * @returns 轉調後的音名陣列
 *
 * @example
 * transposeManyToNames([0, 2, 4, 7], 'G')
 * // → ['G', 'B', 'd', "d'"]
 */
export function transposeManyToNames(
  diatonicValues: number[],
  keyCenter: string,
): string[] {
  return diatonicValues.map((v) => getChromaticNoteName(transposeNote(v, keyCenter)));
}
