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
  // bpmRange aligned to 'gentle_waltz' — only valid after narrowing
  // GENRE_MELODY_COMPATIBILITY.waltz (removed melody 7) so waltz always
  // resolves to this one preset instead of switching by melody.
  { id: 'waltz', nameZh: '華爾滋', nameEn: 'Waltz', bpmRange: [80, 110], timeSignature: '3/4', beatPattern: '重-輕-輕' },
  // bpmRange aligned to the 'ballad' preset it now maps to (see
  // GENRE_BEAT_MAP) — full overlap, but this is a compromise, not a real
  // fix: 30-60 was the actually-intended soul tempo, and ballad's [60,80]
  // is the closest existing preset, not a soul-tuned one. See
  // docs/knowledge/preset-bpm-range-mismatch.md for why.
  { id: 'soul', nameZh: '靈魂', nameEn: 'Soul', bpmRange: [60, 80], timeSignature: '4/4', beatPattern: '重-輕-輕-輕' },
  // bpmRange aligned to the 'lofi' preset (see BEAT_TO_PRESET['jazz']).
  { id: 'blues', nameZh: '布魯斯', nameEn: 'Blues', bpmRange: [70, 90], timeSignature: '4/4', beatPattern: '重-輕-輕-輕' },
  { id: 'tango', nameZh: '探戈', nameEn: 'Tango', bpmRange: [60, 100], timeSignature: '4/4', beatPattern: '重-重-輕-輕-重' },
  // bpmRange aligned to 'basic_pop' (see GENRE_BEAT_MAP.giliba -> 'pop').
  { id: 'giliba', nameZh: '吉利巴', nameEn: 'Giliba', bpmRange: [90, 130], timeSignature: '4/8', beatPattern: '重-輕-重-輕' },
  { id: 'rumba', nameZh: '倫巴', nameEn: 'Rumba', bpmRange: [80, 100], timeSignature: '4/4', beatPattern: '重-輕-輕-重-重' },
  { id: 'disco', nameZh: '迪斯可', nameEn: 'Disco', bpmRange: [90, 140], timeSignature: '4/8', beatPattern: '重-輕-重-輕' },
  // bpmRange aligned to 'basic_pop' (see GENRE_BEAT_MAP.twist -> 'rock').
  { id: 'twist', nameZh: '扭扭', nameEn: 'Twist', bpmRange: [90, 130], timeSignature: '4/4', beatPattern: '重-輕-重-輕' },
  // bpmRange must match music-gen's presets/popular/reggae.yaml bpm_range —
  // outside it, the rhythm preset silently clamps the tempo with no warning
  // (the slider showed a value the render never actually used).
  { id: 'reggae', nameZh: '雷鬼', nameEn: 'Reggae', bpmRange: [75, 100], timeSignature: '4/4', beatPattern: '重-輕-重-輕' },
  // bpmRange aligned to 'basic_pop' (see GENRE_BEAT_MAP.rock).
  { id: 'rock', nameZh: '搖滾', nameEn: 'Rock', bpmRange: [90, 130], timeSignature: '2/4', beatPattern: '重-輕-重-輕' },
  // bpmRange aligned to 'basic_pop' (see BEAT_TO_PRESET['country']).
  { id: 'country', nameZh: '鄉村', nameEn: 'Country', bpmRange: [90, 130], timeSignature: '4/8', beatPattern: '重-輕-重-輕' },
  // bpmRange aligned to 'compound_ballad' — only valid after narrowing
  // GENRE_MELODY_COMPATIBILITY.quick_waltz (removed melody 4) so it always
  // resolves to this one preset instead of switching by melody.
  { id: 'quick_waltz', nameZh: '圓舞曲', nameEn: 'Quick Waltz', bpmRange: [60, 90], timeSignature: '6/8', beatPattern: '重-輕-輕-重-輕-輕' },
  { id: 'chacha', nameZh: '恰恰', nameEn: 'Cha-cha', bpmRange: [60, 140], timeSignature: '4/4', beatPattern: '輕-輕-重-輕' },
];

// ── 拍號推導 ────────────────────────────────────────────
// 拍號不是使用者選項，而是主旋律模式的結果。上游 v2 起由 `melody` 決定拍號並
// 忽略送進去的 `time_signature`，所以前端必須用同一份對照推導，否則畫面顯示的
// 拍號會跟聽到的音檔不一致。
//
// 這份對照必須與 music-gen 的 app/core/pipeline.py `_MELODY_TIME_SIG` 一致。

export const DEFAULT_TIME_SIGNATURE = '4/4';

/** 主旋律模式對應的拍號；未知模式回傳預設 4/4。 */
export function timeSignatureForMelody(melodyId: number | undefined): string {
  if (melodyId == null) return DEFAULT_TIME_SIGNATURE;
  return MELODY_PATTERNS.find((m) => m.id === melodyId)?.timeSignature ?? DEFAULT_TIME_SIGNATURE;
}

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

// ── 只有節奏、沒有對應曲風的風格 ────────────────────────
// 上游的 genre 是固定列舉，沒有森巴。但森巴的伴奏節奏存在且由音樂人調校，
// 使用者應該選得到。這類項目與曲風並列呈現，選擇時同時設定：
//   beat  → 送 music-gen，決定鼓組與伴奏（這才是使用者真正想要的東西）
//   genre → 送上游決定作曲；挑一個限制最少、速度範圍相容的曲風
//
// chacha 對 melody 沒有限制、BPM 60–140 也涵蓋森巴的範圍，是最安全的搭配。

export interface RhythmOnlyStyle {
  id: string;
  nameZh: string;
  nameEn: string;
  beat: string;
  baseGenre: string;
  bpmRange: [number, number];
  beatPattern: string;
  /**
   * Melodies guaranteed to hit this style's arranged music-gen preset rather
   * than being silently swapped for a generic one (see SAFE_ARRANGED_MELODIES
   * below — this is the same concept, just carried per-style because samba
   * and bossa_nova borrow chacha's full, unrestricted melody set for
   * composition purposes and would otherwise have no restriction here at all).
   */
  safeMelodies?: Set<number>;
}

export const RHYTHM_ONLY_STYLES: RhythmOnlyStyle[] = [
  // 速度是音樂家刻意訂的：森巴慢於 150 就會聽成別的樂風，而他反映森巴與波沙諾瓦
  // 容易混淆，所以兩者的範圍不重疊。
  {
    id: 'samba',
    nameZh: '森巴',
    nameEn: 'Samba',
    beat: 'samba',
    baseGenre: 'chacha',
    bpmRange: [150, 200],
    beatPattern: '重-輕-重-輕',
    // chacha (the borrowed baseGenre) restricts nothing, so without this the
    // full 9-melody set would be offered — but melodies 3/4/6/7/8 (3/8, 3/4,
    // 6/8, 12/16) produce a time signature that doesn't match samba's own 4/4
    // preset declaration, and music-gen's _resolve_preset_or_fallback()
    // silently swaps in a generic rhythm when that happens. Verified against
    // real requests by musicgen 2026-08-23; see
    // ~/hylove/coordination/knowledge/entries/genre-to-preset-pipeline.md.
    safeMelodies: new Set([1, 2, 5, 9]),
  },
  {
    id: 'bossa_nova',
    nameZh: '波沙諾瓦',
    nameEn: 'Bossa Nova',
    beat: 'bossanova',
    baseGenre: 'chacha',
    bpmRange: [100, 150],
    beatPattern: '重-輕-輕-重-輕',
    // Same issue as samba above — same borrowed baseGenre, same fix.
    safeMelodies: new Set([1, 2, 5, 9]),
  },
];

// ── 有音樂家編排的旗艦 preset：安全的主旋律子集合 ──────────
// GENRE_MELODY_COMPATIBILITY 是 Rails 相容性清單（決定 422 與否），跟這裡
// 完全是兩件事：一個曲風可能對 Rails 合法，但選到的主旋律拍號跟 music-gen
// 這個曲風實際掛的節奏 preset 宣告的拍號對不上時，_resolve_preset_or_
// fallback() 會靜默把整個 preset 換成沒有音樂家編排的通用節奏，沒有任何
// warning。只有這幾個有專屬（漢克呂調校）preset 的曲風才有這個風險——其餘
// 曲風背後是共用的通用 preset，本來就沒有「編排會不見」這回事，不需要這層
// 限制。數字來源：musicgen 2026-08-23 用真實請求驗證，見
// ~/hylove/coordination/knowledge/entries/genre-to-preset-pipeline.md。
export const SAFE_ARRANGED_MELODIES: Record<string, Set<number>> = {
  reggae: new Set([2, 5]),  // 拿掉 9（8/16，宣告 4/4 仍觸發靜默替換）
  disco:  new Set([5]),     // 拿掉 9（同上）
};

// ── 曲風→節拍預設映射 ──────────────────────────────────
// 將每個曲風 ID 映射到最接近的節拍預設 ID（beatPresets.ts）

export const GENRE_BEAT_MAP: Record<string, string> = {
  waltz: 'waltz',
  soul: 'soul',
  blues: 'jazz',
  tango: 'tango',
  giliba: 'pop',
  rumba: 'rumba',
  disco: 'disco',
  twist: 'rock',
  reggae: 'reggae',
  rock: 'rock',
  country: 'country',
  quick_waltz: 'waltz',
  chacha: 'pop',
};

// ── 曲風-主旋律相容矩陣 ─────────────────────────────────
// key = genre id, value = set of compatible melody pattern ids
// 須與 Rails /api/v2/music 的曲風-主旋律相容規則完全一致，否則送出後端會回 422。

export const GENRE_MELODY_COMPATIBILITY: Record<string, Set<number>> = {
  // 7（6/8 拍）拿掉：waltz 的 rhythm preset 依主旋律動態切換，melody 7 會
  // 落到跟 waltz 其餘主旋律不同的 preset，讓 bpmRange 沒有單一交集可言。
  // 拿掉後 waltz 穩定落在 gentle_waltz，見 GENRES.waltz 的 bpmRange。
  waltz:        new Set([3, 4, 6]),
  soul:         new Set([1, 2, 3, 4, 8, 9]),
  blues:        new Set([1, 5, 8]),
  tango:        new Set([1, 5]),
  giliba:       new Set([2, 5, 9]),
  rumba:        new Set([1, 5]),
  chacha:       new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]),
  disco:        new Set([5, 9]),
  twist:        new Set([5, 9]),
  reggae:       new Set([2, 5, 9]),
  rock:         new Set([5, 9]),
  country:      new Set([2, 4, 5, 7, 8, 9]),
  // 4（3/8 拍）拿掉：同樣的動態 preset 切換問題，拿掉後 quick_waltz 穩定
  // 落在 compound_ballad，見 GENRES.quick_waltz 的 bpmRange。
  quick_waltz:  new Set([7, 8]),
};

// ── 樂器（英文 value → Rails v2 中文 enum） ──────────────
// Rails /api/v2/music 的 instrument.p1/p2/p3 只接受中文樂器名稱；
// UI 內部仍用英文 value（沿用既有 INSTRUMENTS 選項），呼叫 v2 前需轉換。

export const INSTRUMENT_ZH: Record<string, string> = {
  piano:            '鋼琴',
  guitar:           '吉他',
  bass:             '貝斯',
  violin:           '小提琴',
  flute:            '長笛',
  saxophone:        '中音薩克斯風',
  cello:            '低音大提琴',
  'electric guitar': '電子吉他',
  vocals:           '人聲',
};

export function instrumentZh(value: string | undefined): string {
  if (!value) return '鋼琴';
  return INSTRUMENT_ZH[value] ?? value;
}

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
