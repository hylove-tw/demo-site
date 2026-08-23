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

/** 三個聲部（高音部/中音部/低音部）預設樂器 — 值必須是 CompositionParamsForm 的 INSTRUMENTS 之一。 */
export interface GenreInstruments {
  p1: string; // 高音部
  p2: string; // 中音部
  p3: string; // 低音部
}

export interface Genre {
  id: string;
  nameZh: string;
  nameEn: string;
  description: string; // 一句話風格介紹，台灣用詞
  bpmRange: [number, number]; // [min, max]
  timeSignature: string;
  beatPattern: string; // 節拍輕重音說明
  /**
   * 選這個曲風時預設帶出的三聲部樂器，取自音樂史上這個曲風的經典編制，
   * 對應到 app 現有的樂器清單（無法找到對應樂器時取最接近的替代，見各項
   * 註解）。之前不管選哪個曲風都是同一組 flute/piano/cello（
   * INSTRUMENT_DEFAULTS 的通用預設），跟大部分曲風的真實聲響搭不起來。
   */
  defaultInstruments: GenreInstruments;
}

export const GENRES: Genre[] = [
  // bpmRange aligned to 'gentle_waltz' — only valid after narrowing
  // GENRE_MELODY_COMPATIBILITY.waltz (removed melody 7) so waltz always
  // resolves to this one preset instead of switching by melody.
  //
  // defaultInstruments：華爾滋管弦樂團以小提琴領奏（"the heartbeat of the
  // waltz"），大提琴/低音提琴墊底；鋼琴獨奏華爾滋（蕭邦等）本身也是經典
  // 形式，中音部用鋼琴有直接先例。
  { id: 'waltz', nameZh: '華爾滋', nameEn: 'Waltz', description: '優雅三拍子社交舞，重音在第一拍', bpmRange: [80, 110], timeSignature: '3/4', beatPattern: '重-輕-輕', defaultInstruments: { p1: 'violin', p2: 'piano', p3: 'cello' } },
  // bpmRange aligned to the 'ballad' preset it now maps to (see
  // GENRE_BEAT_MAP) — full overlap, but this is a compromise, not a real
  // fix: 30-60 was the actually-intended soul tempo, and ballad's [60,80]
  // is the closest existing preset, not a soul-tuned one. See
  // docs/knowledge/preset-bpm-range-mismatch.md for why.
  //
  // nameZh 從「靈魂」改成「靈魂樂」：台灣的用法（zh-tw 維基百科詞條即為
  // 「靈魂樂」）一律帶「樂」字，光說「靈魂」在中文裡是通用詞、容易誤解成
  // 別的意思，不像恰恰／倫巴這類純音譯詞沒有這個問題。
  //
  // defaultInstruments：經典靈魂樂編制是管樂（小號/薩克斯風/長號）+
  // 鋼琴/電風琴 + 貝斯，清單裡沒有銅管或電風琴，薩克斯風是最接近的管樂
  // 替代。人聲也是合理選項（靈魂樂本質是主唱帶動），但這裡優先選有明確
  // 樂器編制證據的薩克斯風。
  { id: 'soul', nameZh: '靈魂樂', nameEn: 'Soul', description: '福音與藍調融合，唱腔濃烈有感染力', bpmRange: [60, 80], timeSignature: '4/4', beatPattern: '重-輕-輕-輕', defaultInstruments: { p1: 'saxophone', p2: 'piano', p3: 'bass' } },
  // bpmRange aligned to the 'lofi' preset (see BEAT_TO_PRESET['jazz']).
  //
  // defaultInstruments：經典藍調是吉他/口琴領奏、鋼琴、貝斯；清單沒有口琴，
  // 吉他本身就是藍調另一個主奏聲部，直接頂上。
  { id: 'blues', nameZh: '布魯斯', nameEn: 'Blues', description: '慢板社交舞曲，深情內斂的擁舞節奏', bpmRange: [70, 90], timeSignature: '4/4', beatPattern: '重-輕-輕-輕', defaultInstruments: { p1: 'guitar', p2: 'piano', p3: 'bass' } },
  // defaultInstruments：探戈管絃樂團（orquesta típica）以班多鈕手風琴
  // 領奏，清單沒有這項樂器，小提琴是編制裡另一個主奏聲部，直接頂上；
  // 鋼琴、貝斯都是原編制直接有的樂器。
  { id: 'tango', nameZh: '探戈', nameEn: 'Tango', description: '阿根廷激情舞曲，頓挫分明、乾淨俐落', bpmRange: [60, 100], timeSignature: '4/4', beatPattern: '重-重-輕-輕-重', defaultInstruments: { p1: 'violin', p2: 'piano', p3: 'bass' } },
  // bpmRange aligned to 'basic_pop' (see GENRE_BEAT_MAP.giliba -> 'pop').
  //
  // nameZh/nameEn 從「吉利巴」/「Giliba」改成「吉魯巴」/「Jitterbug」：
  // 「Giliba」不是英文單字；台灣社交舞界把恰恰／迪斯可／吉魯巴歸類為「快
  // 舞」，吉魯巴是源自英文 jitterbug（經日文ジルバ轉譯）的標準台灣用詞，
  // 「吉利巴」應是這個詞的誤植/誤譯。id 保留 'giliba' 不動，只改顯示字串
  // ——id 是 GENRE_BEAT_MAP 等對照表的查表 key，跟顯示名稱無關。
  //
  // defaultInstruments：吉魯巴源自搖擺樂（big band swing），編制是薩克斯
  // 風/銅管領奏 + 吉他/鋼琴/貝斯節奏組——薩克斯風、鋼琴、貝斯都是原編制
  // 直接有的樂器。
  { id: 'giliba', nameZh: '吉魯巴', nameEn: 'Jitterbug', description: '台灣社交舞快舞代表，源自搖擺舞吉特巴', bpmRange: [90, 130], timeSignature: '4/8', beatPattern: '重-輕-重-輕', defaultInstruments: { p1: 'saxophone', p2: 'piano', p3: 'bass' } },
  // defaultInstruments：社交舞倫巴的樂團編制融合大樂團銅管（小號/薩克斯風/
  // 長號）與古巴節奏組，薩克斯風是清單裡最接近的管樂，鋼琴、貝斯直接對應。
  { id: 'rumba', nameZh: '倫巴', nameEn: 'Rumba', description: '「愛情之舞」，慢板古巴律動、浪漫搖擺', bpmRange: [80, 100], timeSignature: '4/4', beatPattern: '重-輕-輕-重-重', defaultInstruments: { p1: 'saxophone', p2: 'piano', p3: 'bass' } },
  // defaultInstruments：迪斯可經典聲響是管樂/弦樂鋪底 + 電吉他節奏刷弦 +
  // 貝斯（常是整首歌最搶戲的聲部）；薩克斯風代表管樂層，電吉他明確對應
  // 節奏吉他，貝斯直接對應。
  { id: 'disco', nameZh: '迪斯可', nameEn: 'Disco', description: '70 年代舞廳勁曲，四四拍強烈律動', bpmRange: [90, 140], timeSignature: '4/8', beatPattern: '重-輕-重-輕', defaultInstruments: { p1: 'saxophone', p2: 'electric guitar', p3: 'bass' } },
  // bpmRange aligned to 'basic_pop' (see GENRE_BEAT_MAP.twist -> 'rock').
  //
  // defaultInstruments：1960 年代扭扭舞金曲（如 Chubby Checker〈The
  // Twist〉）的原版樂譜多以薩克斯風擔任主奏旋律，鋼琴/貝斯是當時搖滾節奏組
  // 的標準配置。
  { id: 'twist', nameZh: '扭扭', nameEn: 'Twist', description: '60 年代扭腰舞潮，輕快活潑好上手', bpmRange: [90, 130], timeSignature: '4/4', beatPattern: '重-輕-重-輕', defaultInstruments: { p1: 'saxophone', p2: 'piano', p3: 'bass' } },
  // bpmRange must match music-gen's presets/popular/reggae.yaml bpm_range —
  // outside it, the rhythm preset silently clamps the tempo with no warning
  // (the slider showed a value the render never actually used).
  //
  // defaultInstruments：雷鬼的招牌是電吉他反拍刷弦（skank）+ 電風琴「冒泡」
  // 音色 + 旋律感很強的貝斯線；清單沒有電風琴，鋼琴頂上，電吉他、貝斯直接
  // 對應。
  { id: 'reggae', nameZh: '雷鬼', nameEn: 'Reggae', description: '牙買加節奏，切分後拍營造慵懶律動', bpmRange: [75, 100], timeSignature: '4/4', beatPattern: '重-輕-重-輕', defaultInstruments: { p1: 'electric guitar', p2: 'piano', p3: 'bass' } },
  // bpmRange aligned to 'basic_pop' (see GENRE_BEAT_MAP.rock).
  //
  // defaultInstruments：經典搖滾四件式編制是主奏/節奏電吉他 + 貝斯 + 鼓，
  // 鍵盤/風琴是常見加入的第四聲部；電吉他、鋼琴（代鍵盤）、貝斯都直接對應。
  { id: 'rock', nameZh: '搖滾', nameEn: 'Rock', description: '強勁鼓點與電吉他，熱血奔放', bpmRange: [90, 130], timeSignature: '2/4', beatPattern: '重-輕-重-輕', defaultInstruments: { p1: 'electric guitar', p2: 'piano', p3: 'bass' } },
  // bpmRange aligned to 'basic_pop' (see BEAT_TO_PRESET['country']).
  //
  // defaultInstruments：鄉村樂的旋律聲部經典上是小提琴（鄉村小提琴/fiddle）
  // ，木吉他是節奏與和聲的基礎聲部，貝斯（原本常是低音提琴）墊底——三個都
  // 是清單裡的樂器直接對應，不用替代。班鳩琴/踏板鋼棒吉他清單沒有，是唯一
  // 真正缺席的部分。
  { id: 'country', nameZh: '鄉村', nameEn: 'Country', description: '美式鄉村曲風，樸實敘事、輕快自在', bpmRange: [90, 130], timeSignature: '4/8', beatPattern: '重-輕-重-輕', defaultInstruments: { p1: 'violin', p2: 'guitar', p3: 'bass' } },
  // bpmRange aligned to 'compound_ballad' — only valid after narrowing
  // GENRE_MELODY_COMPATIBILITY.quick_waltz (removed melody 4) so it always
  // resolves to this one preset instead of switching by melody.
  //
  // 圓舞曲跟華爾滋不是同一件事的兩種寫法：圓舞曲專指維也納快三步，華爾滋
  // 是節奏較慢的標準三拍子舞曲，台灣用法上兩者是並列、不互相取代的曲風。
  //
  // defaultInstruments：維也納華爾滋管弦樂團傳統跟一般華爾滋同源（小提琴
  // 領奏、大提琴墊底），只是速度更快，樂器編制沒有理由不同，故意跟華爾滋
  // 用同一組，不強行做出人為差異。
  { id: 'quick_waltz', nameZh: '圓舞曲', nameEn: 'Quick Waltz', description: '維也納快三步，旋轉流暢、速度輕快', bpmRange: [60, 90], timeSignature: '6/8', beatPattern: '重-輕-輕-重-輕-輕', defaultInstruments: { p1: 'violin', p2: 'piano', p3: 'cello' } },
  // bpmRange aligned to 'basic_pop' — only valid after narrowing
  // GENRE_MELODY_COMPATIBILITY.chacha (removed melodies 3,4,6,7,8) so it
  // always resolves to this one preset instead of switching by melody
  // (chacha -> pop -> basic_pop/gentle_waltz/compound_ballad depending on
  // the melody's actual time signature, before this fix).
  //
  // defaultInstruments：恰恰源自古巴 charanga 樂團，招牌編制正是長笛
  // 領奏 + 小提琴，兩者都直接對應清單裡的樂器，貝斯墊底。
  { id: 'chacha', nameZh: '恰恰', nameEn: 'Cha-cha', description: '俏皮拉丁舞曲，三個快步的招牌墊步', bpmRange: [90, 130], timeSignature: '4/4', beatPattern: '輕-輕-重-輕', defaultInstruments: { p1: 'flute', p2: 'violin', p3: 'bass' } },
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
  description: string; // 一句話風格介紹，台灣用詞
  beat: string;
  baseGenre: string;
  bpmRange: [number, number];
  beatPattern: string;
  defaultInstruments: GenreInstruments;
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
  // 速度是音樂家刻意訂的：森巴慢於 150 就會聽成別的樂風，而他反映森巴與巴薩諾瓦
  // 容易混淆，所以兩者的範圍不重疊。
  {
    id: 'samba',
    nameZh: '森巴',
    nameEn: 'Samba',
    description: '巴西嘉年華靈魂，跳動鼓點、熱情奔放',
    beat: 'samba',
    baseGenre: 'chacha',
    bpmRange: [150, 200],
    beatPattern: '重-輕-重-輕',
    // 森巴的旋律-和聲層經典上是 cavaquinho（四弦小吉他）+ 吉他 + 貝斯，
    // 真正的聲音大多在打擊樂（surdo/pandeiro/cuíca，由鼓聲部另外處理）。
    // 清單沒有 cavaquinho，吉他是最接近的替代（同樣是撥弦、刷奏為主的
    // 樂器）；鋼琴頂中音部是清單裡最弱的一個替代，cavaquinho 的音色跟
    // 鋼琴差距較大，暫無更好選項。
    defaultInstruments: { p1: 'guitar', p2: 'piano', p3: 'bass' },
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
    // 「波沙諾瓦」改成「巴薩諾瓦」：zh-tw 維基百科詞條與台灣烏克麗麗/音樂
    // 教學站台（如 ukuleletaiwan.com）多用「巴薩諾瓦」，搜尋中沒有找到台灣
    // 來源使用「波沙諾瓦」——id/beat 保留 'bossa_nova'/'bossanova' 不動，
    // 只改顯示字串。
    nameZh: '巴薩諾瓦',
    nameEn: 'Bossa Nova',
    description: '巴西森巴融合酷派爵士，慵懶輕鬆',
    beat: 'bossanova',
    baseGenre: 'chacha',
    bpmRange: [100, 150],
    beatPattern: '重-輕-輕-重-輕',
    // 巴薩諾瓦的招牌是尼龍弦吉他（同時是主要和聲樂器，直接對應清單的
    // 吉他）+ 長笛或薩克斯風領奏（這裡選長笛）+ 貝斯，三個都是原編制
    // 直接有的樂器，不用替代。
    defaultInstruments: { p1: 'flute', p2: 'guitar', p3: 'bass' },
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
  // 3,4,6,7,8 (3/8, 3/4, 6/8, 12/16) removed: chacha -> pop resolves to a
  // *different* preset per melody's time signature (basic_pop for 4/4-ish,
  // gentle_waltz or compound_ballad otherwise) — same dynamic-switching
  // problem as waltz/quick_waltz, fixed the same way. Narrowing to melodies
  // that all land on basic_pop means chacha (and anything borrowing it as a
  // baseGenre) now always gets the same preset. Verified 2026-08-23; see
  // ~/hylove/coordination/knowledge/entries/genre-to-preset-pipeline.md.
  chacha:       new Set([1, 2, 5, 9]),
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
