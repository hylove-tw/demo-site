// src/components/CompositionParamsForm.tsx
//
// The parameters that decide *what gets composed* — key, melody pattern, genre,
// BPM, instruments.
//
// These are shared by the form shown before an analysis runs and the editor
// shown after it, which previously each carried their own copy. The two drifted:
// the editor exposed a 拍號 control the server ignores, never offered the key or
// the genre at all, and its sibling dual editor silently dropped the melody
// pattern. Regenerating a score is cheap, so there is no reason for the two to
// offer different decisions — and only one place should encode the rules about
// which genre works with which melody.
//
// Layout (redesign "A"): the genre is the one decision most people make, so it
// gets the only always-open section — a horizontal strip of genre tiles (plus a
// 全部曲風 bottom sheet that lists everything with descriptions). Picking
// "自訂" opens the melody/rhythm override *in place* right under the strip,
// instead of ~900px further down. Everything else lives in collapsible
// sections whose titles always show the current values (節奏與調性 /
// 樂器與音色 / 樂譜資訊), so a closed form still reads as a full recipe.
//
// Only presentation differs between variants: `variant="full"` for the
// stand-alone form, `variant="compact"` for the editor's parameter panel, which
// keeps a native select element for the genre (it sits inside an already-scrolling
// report and has its own 套用 button) but shares every other control.

import React, { useEffect, useId, useRef, useState } from 'react';
import {
    Check, ChevronRight, Disc3, FileMusic, Gauge, Info, ListMusic, LoaderCircle,
    Minus, Music2, Music3, Music4, Piano, Play, Plus, SlidersHorizontal, Square, X,
} from 'lucide-react';
import { useMusicGenPresets, presetForBeat, beatOptionLabel, beatCredit } from '../hooks/useMusicGenPresets';
import { getPresetsForTimeSignature, BEAT_PRESETS } from '../utils/beatPresets';
import { useBeatPreview } from '../hooks/useBeatPreview';
import { useVoicePacks } from '../hooks/useVoicePacks';
import { useVoicePackPreview } from '../hooks/useVoicePackPreview';
import { readLastVoicePack, writeLastVoicePack } from '../utils/lastVoicePackCache';
import { BeatPatternStaff } from './BeatPatternStaff';
import {
    GENRE_BEAT_MAP,
    RHYTHM_ONLY_STYLES,
    SAFE_ARRANGED_MELODIES,
    KEY_CENTERS,
    MELODY_PATTERNS,
    GENRES,
    getCompatibleMelodies,
    getCompatibleGenres,
    getBpmMidpoint,
    timeSignatureForMelody,
    Genre,
    RhythmOnlyStyle,
    GenreInstruments,
} from '../config/musicCreativeConstants';

/**
 * Melodies guaranteed to hit the current selection's arranged music-gen
 * preset, or undefined when the selection has no such restriction (most
 * genres — only reggae/disco/samba/bossa_nova have a musician-arranged
 * preset that a mismatched time signature can silently fall through.
 *
 * Kept exported (and still exercised by rhythmStyles.test.ts) even though the
 * form itself no longer needs it to gate manual melody overrides: overriding
 * melody/rhythm now only happens in "自訂" mode, where the beat list is
 * already filtered to the melody's own time signature (see `availableBeats`
 * below), so the mismatch this guarded against can't occur there.
 */
export function safeMelodiesFor(
    genreId: string | undefined,
    activeStyle: RhythmOnlyStyle | undefined,
): Set<number> | undefined {
    return activeStyle?.safeMelodies ?? (genreId ? SAFE_ARRANGED_MELODIES[genreId] : undefined);
}

export const INSTRUMENTS = [
    { value: 'piano', label: '鋼琴' },
    { value: 'guitar', label: '吉他' },
    { value: 'bass', label: '貝斯' },
    { value: 'violin', label: '小提琴' },
    { value: 'flute', label: '長笛' },
    { value: 'saxophone', label: '薩克斯風' },
    { value: 'cello', label: '大提琴' },
    { value: 'electric guitar', label: '電吉他' },
    { value: 'vocals', label: '人聲' },
];

export const INSTRUMENT_DEFAULTS: Record<string, string> = {
    p1: 'flute', p2: 'piano', p3: 'cello',
    first_p1: 'flute', first_p2: 'piano', first_p3: 'cello',
    second_p1: 'violin', second_p2: 'guitar', second_p3: 'bass',
};

export const getInstrumentLabel = (key: string) =>
    INSTRUMENTS.find((i) => i.value === key)?.label ?? key;

/** 單人／雙人模式各自的樂器欄位與標籤。 */
export const SINGLE_INSTRUMENT_FIELDS: Array<[string, string]> = [
    ['p1', '高音部'], ['p2', '中音部'], ['p3', '低音部'],
];
export const DUAL_INSTRUMENT_FIELDS: Array<[string, string]> = [
    ['first_p1', '第一人 高音部'], ['first_p2', '第一人 中音部'], ['first_p3', '第一人 低音部'],
    ['second_p1', '第二人 高音部'], ['second_p2', '第二人 中音部'], ['second_p3', '第二人 低音部'],
];

/** Sentinel genre id meaning "no genre — melody and rhythm are picked by hand". */
export const CUSTOM_GENRE_ID = 'custom';

export type CompositionParams = Record<string, any>;

export interface CompositionParamsFormProps {
    value: CompositionParams;
    onChange: (next: CompositionParams) => void;
    variant?: 'full' | 'compact';
    /** Which instrument fields to offer; omit to hide the instrument section. */
    instrumentFields?: Array<[string, string]>;
    /** The single/dual switch only makes sense before an analysis has run. */
    showPlayerMode?: boolean;
    /** /generate-dual has no voice_pack field yet — dual-mode callers pass false. */
    showVoicePack?: boolean;
    /** Extra content appended to the end of the 基本設定 tab (e.g. a caller-owned checkbox). */
    basicTabExtra?: React.ReactNode;
    /** Extra content appended to the end of the 音樂設定 tab. */
    musicTabExtra?: React.ReactNode;
}

/**
 * Write a genre/style's classic instrument set onto whichever fields are
 * actually in play — p1/p2/p3 in single-player mode, both players' fields in
 * dual mode (琴瑟合 gives both players the same genre-authentic voicing
 * rather than inventing a second, unresearched combination for player two).
 */
function applyInstrumentDefaults(params: CompositionParams, instruments: GenreInstruments): CompositionParams {
    if (params.playerMode === 'dual') {
        return {
            ...params,
            first_p1: instruments.p1, first_p2: instruments.p2, first_p3: instruments.p3,
            second_p1: instruments.p1, second_p2: instruments.p2, second_p3: instruments.p3,
        };
    }
    return { ...params, p1: instruments.p1, p2: instruments.p2, p3: instruments.p3 };
}

/**
 * Apply a genre choice, keeping the rest of the parameters consistent with it.
 *
 * Exported because both the form and any programmatic caller (sample data,
 * tutorials) must go through the same compatibility rules rather than setting
 * the field raw and producing a combination the upstream API rejects.
 */
export function applyGenre(params: CompositionParams, genreId: string): CompositionParams {
    const genre = GENRES.find((g) => g.id === genreId);
    if (!genre) return params;

    // Choosing a genre settles the melody outright, including when the same
    // genre is picked again — that is the way back from a custom combination.
    // It settles the instruments the same way, for the same reason — see
    // Genre.defaultInstruments in musicCreativeConstants.ts for how each
    // genre's combo was chosen.
    return applyInstrumentDefaults({
        ...params,
        genre: genreId,
        bpm: getBpmMidpoint(genre.bpmRange),
        melodyPattern: defaultMelodyFor(genreId),
    }, genre.defaultInstruments);
}

/**
 * A melody the genre actually accepts, preferred to match the genre's rhythm.
 *
 * Leaving this unset is not an option: the export falls back to melody 1, which
 * eight of the thirteen genres reject outright — and since the melody picker is
 * tucked into the advanced section, nobody sets it by hand.
 *
 * Matching the rhythm's metre matters beyond taste. music-gen swaps in a
 * different rhythm preset when the score's metre does not match the one it was
 * asked for, so picking a 4/8 melody for reggae would silently deliver
 * basic_pop's drums under a preset the user chose for its reggae feel.
 */
export function defaultMelodyFor(genreId: string): number | undefined {
    const compatible = getCompatibleMelodies(genreId);
    if (compatible.length === 0) return undefined;

    const rhythmMetre = BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[genreId])?.timeSignature;
    const matching = compatible.find((m) => m.timeSignature === rhythmMetre);
    return (matching ?? compatible[0]).id;
}

/** Apply a melody choice, dropping a genre that is no longer compatible. */
export function applyMelody(params: CompositionParams, melodyId: number): CompositionParams {
    if (!MELODY_PATTERNS.some((m) => m.id === melodyId)) return params;

    const next: CompositionParams = { ...params, melodyPattern: melodyId };
    // 自訂 is not a real genre, so no melody is ever "compatible" with it —
    // without this guard picking a melody in 自訂 mode silently dropped the
    // genre, closing the 自訂 section the user was working in.
    if (params.genre && params.genre !== CUSTOM_GENRE_ID
        && !getCompatibleGenres(melodyId).some((g) => g.id === params.genre)) {
        delete next.genre;
    }
    return next;
}

/**
 * Apply a rhythm-only style (samba, bossa nova — no genre in the upstream
 * enum fits them). Shared by the card grid and the compact dropdown so the
 * two can't drift apart the way BEAT_TO_PRESET's key mismatch once did for
 * bossa nova: one path got the fix, the other silently kept the old bug.
 */
export function applyRhythmStyle(params: CompositionParams, style: RhythmOnlyStyle): CompositionParams {
    return applyInstrumentDefaults({
        ...applyGenre(params, style.baseGenre),
        beat: style.beat,
        // applyGenre set the borrowed genre's tempo; this style's own range is
        // the right one. Same for instruments just below — applyGenre already
        // set chacha's (the borrowed baseGenre's), this style has its own.
        bpm: getBpmMidpoint(style.bpmRange),
    }, style.defaultInstruments);
}
// ── Derived values shared by the form and its one-line summary ────────────

interface GenreOption {
    id: string;
    kind: 'genre' | 'style' | 'custom';
    nameZh: string;
    nameEn: string;
    description: string;
    bpmRange?: [number, number];
    timeSignature?: string;
    beatPattern?: string;
    /** Rhythm preset id this option plays (used for credits / NEW / preview). */
    beatId?: string;
    /** Key useBeatPreview resolves: the genre id for genres, the beat for styles. */
    previewKey?: string;
    instruments?: GenreInstruments;
}

const CUSTOM_OPTION: GenreOption = {
    id: CUSTOM_GENRE_ID, kind: 'custom', nameZh: '自訂', nameEn: 'Custom',
    description: '手動指定主旋律與伴奏節奏',
};

// Original order on purpose: GENRES as defined, then the rhythm-only styles,
// then 自訂 — the same order the old card grid used, so nothing people had
// learned to find moves.
const GENRE_OPTIONS: GenreOption[] = [
    ...GENRES.map((g): GenreOption => ({
        id: g.id, kind: 'genre', nameZh: g.nameZh, nameEn: g.nameEn, description: g.description,
        bpmRange: g.bpmRange, timeSignature: g.timeSignature, beatPattern: g.beatPattern,
        beatId: GENRE_BEAT_MAP[g.id], previewKey: g.id, instruments: g.defaultInstruments,
    })),
    ...RHYTHM_ONLY_STYLES.map((st): GenreOption => ({
        id: st.id, kind: 'style', nameZh: st.nameZh, nameEn: st.nameEn, description: st.description,
        bpmRange: st.bpmRange, timeSignature: BEAT_PRESETS.find((b) => b.id === st.beat)?.timeSignature,
        beatPattern: st.beatPattern, beatId: st.beat, previewKey: st.beat, instruments: st.defaultInstruments,
    })),
    CUSTOM_OPTION,
];

/** Which option the current params represent (rhythm-only styles win by beat). */
function activeOptionFor(value: CompositionParams): GenreOption | undefined {
    const style = RHYTHM_ONLY_STYLES.find((st) => st.beat === value.beat);
    if (style) return GENRE_OPTIONS.find((o) => o.id === style.id);
    if (value.genre === CUSTOM_GENRE_ID) return CUSTOM_OPTION;
    return GENRE_OPTIONS.find((o) => o.kind === 'genre' && o.id === value.genre);
}

/**
 * BPM bounds for the current params. A rhythm-only style sets the tempo range,
 * not the genre it borrows for composition: samba needs 150–200, and chacha —
 * the genre it pairs with because the upstream places no tempo limit on it —
 * displays 60–140. Custom mode has neither, so BPM falls back to 30–200.
 */
export function bpmBoundsFor(value: CompositionParams): { min: number; max: number; range?: [number, number] } {
    const style = RHYTHM_ONLY_STYLES.find((st) => st.beat === value.beat);
    const genre = value.genre === CUSTOM_GENRE_ID ? undefined : GENRES.find((g) => g.id === value.genre);
    const range = style?.bpmRange ?? genre?.bpmRange;
    return { min: range?.[0] ?? 30, max: range?.[1] ?? 200, range };
}

export const clampBpm = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type KeyOption = { value: string; label: string };
const keyOptions = (t: 'major' | 'minor') => KEY_CENTERS[t] as ReadonlyArray<KeyOption>;

const melodyLabel = (id: number) => {
    const m = MELODY_PATTERNS.find((p) => p.id === id);
    return m ? `${m.id} · ${m.timeSignature}` : String(id);
};

/**
 * The one-line recipe shown next to 開始分析 (e.g. "華爾滋 · 95 BPM · C 大調 ·
 * 單人 · 情緒"), so the decision is visible where it is confirmed even with
 * every section collapsed.
 */
export function summarizeCompositionParams(value: CompositionParams, opts: { showPlayerMode?: boolean } = {}): string {
    const option = activeOptionFor(value);
    const keyType = (value.keyType ?? 'major') as 'major' | 'minor';
    const key = keyOptions(keyType).find((k) => k.value === value.keyCenter) ?? keyOptions(keyType)[0];
    const { min, max } = bpmBoundsFor(value);
    const parts = [
        option ? option.nameZh : '尚未選擇曲風',
        ...(option?.kind === 'custom' && value.melodyPattern ? [`主旋律 ${value.melodyPattern}`] : []),
        `${clampBpm(value.bpm ?? 60, min, max)} BPM`,
        key.label,
        ...(opts.showPlayerMode ? [(value.playerMode ?? 'single') === 'dual' ? '雙人' : '單人'] : []),
        (value.musicType ?? 'emotion') === 'spiritual' ? '心靈' : '情緒',
    ];
    return parts.join(' · ');
}

// ── Building blocks ───────────────────────────────────────────────────────
//
// Every helper component lives at module scope on purpose. They used to be
// declared inside CompositionParamsForm's body, which made each render produce
// a *new* component type — so every onChange (picking a genre, an instrument,
// a voice pack, even one keystroke in the title) unmounted and remounted the
// whole subtree. The tapped control lost focus, and on mobile the scroll
// container lost its position: users saw the page jump up after almost every
// choice and had to scroll back down (PR #19).

/** A pill-track single choice. Real <button>s (not radios) so tests and
 *  assistive tech keep addressing them by name, e.g. "小調". */
const Segmented: React.FC<{
    options: Array<{ value: string; label: string }>;
    value: string;
    onSelect: (v: string) => void;
    label: string;
    size?: 'md' | 'sm';
}> = ({ options, value, onSelect, label, size = 'md' }) => (
    <div role="group" aria-label={label} className="flex w-full gap-1 rounded-field bg-base-200 p-1">
        {options.map((o) => {
            const on = o.value === value;
            return (
                <button key={o.value} type="button" aria-pressed={on}
                    className={size === 'sm'
                        ? (on ? 'btn btn-sm btn-primary min-w-0 flex-1 px-1 text-xs whitespace-nowrap' : 'btn btn-sm btn-ghost min-w-0 flex-1 px-1 text-xs whitespace-nowrap')
                        : (on ? 'btn btn-primary min-w-0 flex-1 px-1 text-sm whitespace-nowrap' : 'btn btn-ghost min-w-0 flex-1 px-1 text-sm whitespace-nowrap')}
                    onClick={() => onSelect(o.value)}>
                    {o.label}
                </button>
            );
        })}
    </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode; hint?: React.ReactNode; htmlFor?: string }> = ({ children, hint, htmlFor }) => (
    <label htmlFor={htmlFor} className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
        <span>{children}</span>
        {hint && <span className="text-xs font-normal text-base-content/60">{hint}</span>}
    </label>
);

const Section: React.FC<{ compact: boolean; children: React.ReactNode; label?: string }> = ({ compact, children, label }) => (
    <section aria-label={label} className={compact ? 'rounded-box border border-base-300 bg-base-100 space-y-3 p-3' : 'rounded-box border border-base-300 bg-base-100 space-y-4 p-4'}>
        {children}
    </section>
);

/** Checkbox-driven daisyUI collapse; the title always shows current values. */
const CollapseSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    summary: React.ReactNode;
    defaultOpen?: boolean;
    compact: boolean;
    children: React.ReactNode;
}> = ({ title, icon, summary, defaultOpen, compact, children }) => (
    <div className="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
        <input type="checkbox" defaultChecked={defaultOpen} aria-label={`${title}（展開／收合）`} />
        <div className={compact ? 'collapse-title flex min-h-12 min-w-0 items-center gap-2 py-3 pe-12 text-sm font-semibold' : 'collapse-title flex min-w-0 items-center gap-2 pe-12 font-semibold'}>
            {icon}
            <span className="shrink-0">{title}</span>
            <span className="ms-auto truncate text-sm font-normal text-base-content/60" data-collapse-summary>{summary}</span>
        </div>
        <div className={compact ? 'collapse-content space-y-3 text-sm' : 'collapse-content space-y-5'}>{children}</div>
    </div>
);

/** 44×44 round play/stop button (Apple's minimum tap target). */
const PreviewButton: React.FC<{
    label: string; playing: boolean; loading: boolean; onToggle: () => void;
}> = ({ label, playing, loading, onToggle }) => (
    <button type="button" aria-label={label} aria-pressed={playing}
        title={playing ? '停止試聽' : '試聽'}
        className="btn btn-circle btn-ghost size-11 min-h-11"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}>
        {loading
            ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            : playing ? <Square className="size-4" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
    </button>
);

const GenreTile: React.FC<{
    option: GenreOption;
    selected: boolean;
    isNew: boolean;
    onSelect: (id: string) => void;
    preview?: React.ReactNode;
}> = ({ option, selected, isNew, onSelect, preview }) => (
    <div className="carousel-item relative w-40" data-genre-tile={option.id}>
        <button type="button" aria-pressed={selected}
            className={selected
                ? 'flex w-full flex-col items-start gap-1 rounded-2xl border border-primary bg-base-100 p-3 pe-12 text-left outline outline-1 outline-primary'
                : 'flex w-full flex-col items-start gap-1 rounded-2xl border border-base-300 bg-base-100 p-3 pe-12 text-left hover:border-base-content/30'}
            onClick={() => onSelect(option.id)}>
            <span className="flex items-center gap-1 text-sm font-bold">
                {option.nameZh}
                {selected && <Check className="size-4" aria-hidden="true" />}
            </span>
            <span className="text-xs text-base-content/60">{option.nameEn}</span>
            <span className="mt-1 flex flex-wrap gap-1">
                <span className="badge badge-ghost badge-sm whitespace-nowrap tabular-nums">
                    {option.bpmRange ? `BPM ${option.bpmRange[0]}–${option.bpmRange[1]}` : '手動指定'}
                </span>
                {isNew && <span className="badge badge-soft badge-sm">NEW</span>}
            </span>
        </button>
        {preview && <div className="absolute end-1 top-1">{preview}</div>}
    </div>
);

const ListRowIcon: React.FC<{ index: number }> = ({ index }) => {
    const Icon = [Music2, Music3, Music4][index % 3];
    return <Icon className="size-5 shrink-0 text-base-content/50" aria-hidden="true" />;
};

const PART_ROLE: Record<string, string> = { p1: '主旋律', p2: '和聲', p3: '低音線' };

const InstrumentList: React.FC<{
    fields: Array<[string, string]>;
    value: CompositionParams;
    onPick: (field: string, v: string) => void;
    stripPrefix?: string;
}> = ({ fields, value, onPick, stripPrefix }) => (
    <ul className="list rounded-2xl border border-base-300">
        {fields.map(([field, label], i) => {
            const part = field.replace(/^(first|second)_/, '');
            return (
                <li key={field} className="list-row grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
                    <ListRowIcon index={i} />
                    <div className="list-col-grow min-w-0 truncate">
                        <div className="text-sm font-medium">{stripPrefix ? label.replace(stripPrefix, '') : label}</div>
                        <div className="text-xs text-base-content/60">{PART_ROLE[part]}</div>
                    </div>
                    <select className="select select-sm w-28 sm:w-32" aria-label={label}
                        value={value[field] ?? INSTRUMENT_DEFAULTS[field] ?? 'piano'}
                        onChange={(e) => onPick(field, e.target.value)}>
                        {INSTRUMENTS.map((inst) => (
                            <option key={inst.value} value={inst.value}>{inst.label}</option>
                        ))}
                    </select>
                </li>
            );
        })}
    </ul>
);

// ── The form ──────────────────────────────────────────────────────────────

export const CompositionParamsForm: React.FC<CompositionParamsFormProps> = ({
    value,
    onChange,
    variant = 'full',
    instrumentFields,
    showPlayerMode = false,
    showVoicePack = true,
    basicTabExtra,
    musicTabExtra,
}) => {
    const compact = variant === 'compact';
    const set = (field: string, v: any) => onChange({ ...value, [field]: v });

    // Picking a genre also picks the rhythm it maps to, so a genre backed by a
    // credited groove should say so here — this is where the choice is actually
    // made, and the two happen to share a name (雷鬼 the genre, 雷鬼 the rhythm).
    const musicGenPresets = useMusicGenPresets();
    const preview = useBeatPreview();
    const presetOf = (o: GenreOption) => (o.beatId ? presetForBeat(musicGenPresets, o.beatId) : undefined);

    // 音色（voice_pack）：跟曲風/節奏正交的獨立欄位，選擇不會連動改變其他
    // 欄位的預設值。value.voicePack 未設時，落回使用者上次選過的音色，而不
    // 是每次都要重選——但這只是挑選器的預填值，仍要按「套用/重新生成」才
    // 會真的生效。
    const voicePacks = useVoicePacks();
    const voicePackPreview = useVoicePackPreview();
    const selectedVoicePack: string = value.voicePack ?? readLastVoicePack() ?? '';
    const activeVoicePack = voicePacks.find((p) => p.id === selectedVoicePack);
    const selectVoicePack = (id: string) => {
        set('voicePack', id);
        writeLastVoicePack(id);
    };

    const playerMode = value.playerMode ?? 'single';
    const musicType = value.musicType ?? 'emotion';
    const keyType = (value.keyType ?? 'major') as 'major' | 'minor';
    const keyCenter = value.keyCenter ?? KEY_CENTERS[keyType][0].value;
    const selectedMelody = value.melodyPattern as number | undefined;
    const selectedGenre = value.genre as string | undefined;
    const activeStyle = RHYTHM_ONLY_STYLES.find((st) => st.beat === value.beat);
    // "自訂": no genre backs the current melody/rhythm — both are picked by
    // hand instead of following a genre's defaults.
    const isCustom = selectedGenre === CUSTOM_GENRE_ID;
    const genreKey = isCustom ? undefined : selectedGenre;
    const activeOption = activeOptionFor(value);

    const availableGenres: Genre[] =
        (selectedMelody && !isCustom) ? getCompatibleGenres(selectedMelody) : GENRES;

    // Rhythms that fit the metre the chosen melody produces. Left unset, the
    // rhythm follows the genre — some rhythms (森巴) have no matching genre in
    // the upstream enum, so without an explicit choice they are unreachable.
    const availableBeats = getPresetsForTimeSignature(timeSignatureForMelody(selectedMelody));

    const { min: bpmMin, max: bpmMax, range: tempoRange } = bpmBoundsFor(value);
    const bpm = clampBpm(value.bpm ?? 60, bpmMin, bpmMax);
    // While the number field is being typed into, show the raw text — clamping
    // on every keystroke made "95" impossible to type into an 80–110 range
    // (the "9" snapped to 80). It is clamped and committed on blur.
    const [bpmDraft, setBpmDraft] = useState<string | null>(null);
    const commitBpm = (n: number) => set('bpm', clampBpm(Math.round(n), bpmMin, bpmMax));

    const isOptionSelected = (o: GenreOption) =>
        o.kind === 'style' ? value.beat === o.beatId
            : o.kind === 'custom' ? isCustom
                : selectedGenre === o.id && !value.beat;

    const selectGenre = (genreId: string) => {
        if (genreId === CUSTOM_GENRE_ID) {
            onChange({ ...value, genre: CUSTOM_GENRE_ID, beat: undefined });
            return;
        }
        const chosenStyle = RHYTHM_ONLY_STYLES.find((st) => st.id === genreId);
        // A plain genre follows GENRE_BEAT_MAP on its own — it must clear any
        // `beat` a previous rhythm-only style (or 自訂 pick) left behind, or
        // that leftover keeps matching `activeStyle` below by beat alone and
        // the picker (and the accompaniment section it drives) keeps showing
        // the old style instead of the genre just chosen.
        onChange(chosenStyle
            ? applyRhythmStyle(value, chosenStyle)
            : { ...applyGenre(value, genreId), beat: undefined });
    };

    // 全部曲風 bottom sheet (full variant only). The <dialog> element itself
    // stays mounted; only its list renders while open, so a closed sheet adds
    // no duplicate buttons for tests or screen readers to trip over.
    const [sheetOpen, setSheetOpen] = useState(false);
    const sheetRef = useRef<HTMLDialogElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const d = sheetRef.current;
        if (!d) return;
        if (sheetOpen && !d.open) {
            if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
        } else if (!sheetOpen && d.open) {
            if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
        }
    }, [sheetOpen]);
    const pickFromSheet = (id: string) => {
        selectGenre(id);
        setSheetOpen(false);
        // Bring the chosen tile into view *horizontally only* — scrollIntoView
        // would also scroll the page vertically, the very jump PR #19 removed.
        const strip = carouselRef.current;
        const tile = strip?.querySelector<HTMLElement>(`[data-genre-tile="${id}"]`);
        if (strip && tile) strip.scrollLeft = tile.offsetLeft - strip.offsetLeft - 16;
    };

    const [dualTab, setDualTab] = useState<'first' | 'second'>('first');
    const tabIdBase = useId();
    const isDualFields = !!instrumentFields && instrumentFields.some(([f]) => f.startsWith('second_'));

    // Dual mode shows player one's voicing — genres give both players the
    // same set by default, and six names do not fit a collapse title.
    const instrumentSummary = (instrumentFields ?? [])
        .slice(0, 3)
        .map(([f]) => getInstrumentLabel(value[f] ?? INSTRUMENT_DEFAULTS[f] ?? 'piano'))
        .join(' · ');
    const voiceSummary = showVoicePack && selectedVoicePack && activeVoicePack ? ` ＋${activeVoicePack.displayName}` : '';

    const keyLabel = (keyOptions(keyType).find((k) => k.value === keyCenter) ?? keyOptions(keyType)[0]).label;
    const isNewOption = (o: GenreOption) => !!presetOf(o)?.isNew;
    const anyPreview = GENRE_OPTIONS.some((o) => o.previewKey && preview.canPreview(o.previewKey));

    const genreDetail = activeOption && activeOption.kind !== 'custom' ? (
        <div className={compact ? 'space-y-2 rounded-2xl bg-base-200 p-3 text-xs' : 'space-y-2 rounded-2xl bg-base-200 p-3 text-sm'} aria-live="polite">
            <p>{activeOption.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {activeOption.timeSignature && <span className="badge badge-sm bg-base-100">拍號 {activeOption.timeSignature}</span>}
                {activeOption.beatPattern && <span className="badge badge-sm bg-base-100">節拍 {activeOption.beatPattern}</span>}
                {activeOption.beatId && (
                    <span className="badge badge-sm bg-base-100">
                        伴奏節奏 {BEAT_PRESETS.find((b) => b.id === activeOption.beatId)?.name ?? activeOption.nameZh}
                    </span>
                )}
            </div>
            {activeOption.beatPattern && (
                <BeatPatternStaff pattern={activeOption.beatPattern}
                    label={`${activeOption.nameZh} 節拍：${activeOption.beatPattern}`} />
            )}
            {presetOf(activeOption)?.credit && (
                <p className="text-xs text-base-content/70">節奏由 {presetOf(activeOption)!.credit} 調校</p>
            )}
            {activeOption.bpmRange && activeOption.instruments && (
                <p className="text-xs text-base-content/60">
                    建議值：<span className="font-semibold tabular-nums">{getBpmMidpoint(activeOption.bpmRange)} BPM</span>
                    、{[activeOption.instruments.p1, activeOption.instruments.p2, activeOption.instruments.p3].map(getInstrumentLabel).join('／')}
                    {activeOption.kind === 'genre' && defaultMelodyFor(activeOption.id) ? `、主旋律 ${defaultMelodyFor(activeOption.id)}` : ''}
                    （選曲風時自動帶入）
                </p>
            )}
        </div>
    ) : null;

    const customPanel = isCustom ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-base-content/30 p-3" data-testid="custom-panel">
            <div role="note" className="flex items-start gap-2 rounded-xl bg-base-200 p-3 text-sm">
                <SlidersHorizontal className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>曲風已設為「自訂」，請直接指定主旋律與伴奏節奏</span>
            </div>
            <div>
                <FieldLabel>主旋律</FieldLabel>
                <div role="group" aria-label="主旋律" className="grid grid-cols-3 gap-2">
                    {MELODY_PATTERNS.map((m) => {
                        const on = selectedMelody === m.id;
                        return (
                            <button key={m.id} type="button" aria-pressed={on}
                                aria-label={`主旋律 ${m.id}（${m.timeSignature}）`}
                                className={compact
                                    ? (on ? 'btn btn-sm btn-primary px-1 text-sm whitespace-nowrap tabular-nums' : 'btn btn-sm px-1 text-sm whitespace-nowrap tabular-nums')
                                    : (on ? 'btn btn-primary px-1 text-sm whitespace-nowrap tabular-nums' : 'btn px-1 text-sm whitespace-nowrap tabular-nums')}
                                onClick={() => onChange(applyMelody(value, m.id))}>
                                {melodyLabel(m.id)}
                            </button>
                        );
                    })}
                </div>
                {musicType === 'spiritual' && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-base-content/70">
                        <Info className="size-3.5" aria-hidden="true" />心靈音樂建議選擇主旋律 1、2 或 3
                    </p>
                )}
            </div>
            <div>
                <FieldLabel htmlFor="cpf-beat">伴奏節奏</FieldLabel>
                <select id="cpf-beat" aria-label="伴奏節奏" className={compact ? 'select select-sm w-full' : 'select w-full'} value={value.beat ?? ''}
                    onChange={(e) => set('beat', e.target.value || undefined)}>
                    <option value="" disabled>請選擇伴奏節奏</option>
                    {availableBeats.map((beat) => (
                        <option key={beat.id} value={beat.id}>{beatOptionLabel(musicGenPresets, beat)}</option>
                    ))}
                </select>
                <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-base-content/60">
                    {selectedMelody
                        ? <>依主旋律 {selectedMelody}（{timeSignatureForMelody(selectedMelody)}）篩選</>
                        : <>先選主旋律，會依拍號篩選可用節奏</>}
                    {presetForBeat(musicGenPresets, value.beat)?.isNew && <span className="badge badge-soft badge-xs">NEW</span>}
                    {beatCredit(musicGenPresets, value.beat) && <span>{beatCredit(musicGenPresets, value.beat)}</span>}
                </p>
            </div>
        </div>
    ) : null;

    const voiceBlock = showVoicePack && voicePacks.length > 0 ? (
        <div>
            <FieldLabel hint="非預設音色排入專屬佇列，生成時間可能較長">音色</FieldLabel>
            {compact ? (
                // min-h-11 reserves the preview button's 44px so the row does not
                // change height when a pack with/without a demo clip is picked.
                <div className="flex min-h-11 items-center gap-2">
                    <select className="select select-sm w-full" aria-label="音色"
                        value={selectedVoicePack}
                        onChange={(e) => selectVoicePack(e.target.value)}>
                        {voicePacks.map((pack) => (
                            <option key={pack.id} value={pack.id}>{pack.displayName}</option>
                        ))}
                    </select>
                    {activeVoicePack && voicePackPreview.canPreview(activeVoicePack) && (
                        <PreviewButton
                            label={voicePackPreview.playing === selectedVoicePack ? '停止試聽' : '試聽音色'}
                            playing={voicePackPreview.playing === selectedVoicePack}
                            loading={voicePackPreview.loading === selectedVoicePack}
                            onToggle={() => voicePackPreview.toggle(activeVoicePack)} />
                    )}
                </div>
            ) : (
                <ul className="list rounded-2xl border border-base-300">
                    {voicePacks.map((pack) => {
                        const on = selectedVoicePack === pack.id;
                        return (
                            <li key={pack.id || 'default'} className="list-row items-center gap-2 py-1.5">
                                <button type="button" aria-pressed={on}
                                    className="list-col-grow flex min-h-11 items-center gap-3 text-left"
                                    onClick={() => selectVoicePack(pack.id)}>
                                    <span className={on ? 'grid size-5 shrink-0 place-items-center rounded-full border border-primary bg-primary text-primary-content' : 'grid size-5 shrink-0 place-items-center rounded-full border border-base-content/30'}>
                                        {on && <Check className="size-3" aria-hidden="true" />}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium">{pack.displayName}</span>
                                        <span className="block text-xs text-base-content/60">
                                            {pack.id ? '非預設音色，生成時間可能較長' : '現行預設音色'}
                                        </span>
                                    </span>
                                </button>
                                {voicePackPreview.canPreview(pack) && (
                                    <PreviewButton label={`試聽 ${pack.displayName}`}
                                        playing={voicePackPreview.playing === pack.id}
                                        loading={voicePackPreview.loading === pack.id}
                                        onToggle={() => voicePackPreview.toggle(pack)} />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    ) : null;

    const hasInstruments = !!instrumentFields && instrumentFields.length > 0;

    return (
        <div className={compact ? 'space-y-3' : 'space-y-3'} data-testid="composition-params-form">
            <Section compact={compact} label="演奏設定">
                {showPlayerMode && (
                    <div>
                        <FieldLabel>演奏模式</FieldLabel>
                        <Segmented label="演奏模式" value={playerMode} onSelect={(v) => set('playerMode', v)}
                            options={[{ value: 'single', label: '單人模式' }, { value: 'dual', label: '雙人模式（琴瑟合）' }]} />
                        <p className="mt-1.5 text-xs text-base-content/60">
                            {playerMode === 'single'
                                ? '單人模式：上傳前測與後測腦波資料，生成三聲部樂譜'
                                : '雙人模式：上傳兩人腦波資料，生成六聲部合奏樂譜'}
                        </p>
                    </div>
                )}
                <div>
                    <FieldLabel>音樂類型</FieldLabel>
                    <Segmented label="音樂類型" value={musicType} onSelect={(v) => set('musicType', v)}
                        size={compact ? 'sm' : 'md'}
                        options={[{ value: 'emotion', label: '情緒音樂（睜眼）' }, { value: 'spiritual', label: '心靈音樂（閉眼）' }]} />
                    {musicType === 'spiritual' && !compact && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-base-content/70">
                            <Info className="size-3.5" aria-hidden="true" />心靈音樂建議選擇主旋律 1、2 或 3
                        </p>
                    )}
                </div>
            </Section>

            <Section compact={compact} label="曲風設定">
                <div className="flex items-center justify-between gap-2">
                    <h3 className={compact ? 'flex items-center gap-2 text-sm font-semibold' : 'flex items-center gap-2 text-base font-semibold'}>
                        <Disc3 className="size-5" aria-hidden="true" />曲風
                    </h3>
                    {!compact && (
                        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setSheetOpen(true)}>
                            全部曲風<ListMusic className="size-4" aria-hidden="true" />
                        </button>
                    )}
                </div>

                {compact ? (
                    // min-h-11: same reason as the voice row — 自訂 has no preview.
                    <div className="flex min-h-11 items-center gap-2">
                        <select className="select select-sm w-full" aria-label="曲風"
                            value={activeStyle ? activeStyle.id : (selectedGenre ?? '')}
                            onChange={(e) => selectGenre(e.target.value)}>
                            <option value="" disabled>請選擇曲風</option>
                            {GENRES.map((g) => (
                                <option key={g.id} value={g.id}
                                    disabled={!availableGenres.some((a) => a.id === g.id)}>
                                    {g.nameZh}（BPM {g.bpmRange[0]}~{g.bpmRange[1]}
                                    {BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[g.id])
                                        ? `・節奏 ${BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[g.id])!.name}`
                                        : ''}）
                                    {presetForBeat(musicGenPresets, GENRE_BEAT_MAP[g.id])?.isNew ? ' ‧ NEW' : ''}
                                </option>
                            ))}
                            {/* 只有節奏、沒有對應上游曲風的風格——跟卡片版並列同一份清單，
                                見 applyRhythmStyle 的說明。 */}
                            {RHYTHM_ONLY_STYLES.map((style) => (
                                <option key={style.id} value={style.id}>
                                    {style.nameZh}（BPM {style.bpmRange[0]}~{style.bpmRange[1]}）
                                    {presetForBeat(musicGenPresets, style.beat)?.isNew ? ' ‧ NEW' : ''}
                                </option>
                            ))}
                            <option value={CUSTOM_GENRE_ID}>自訂</option>
                        </select>
                        {activeOption?.previewKey && preview.canPreview(activeOption.previewKey) && (
                            <PreviewButton label={`試聽 ${activeOption.nameZh} 節奏`}
                                playing={preview.playing === activeOption.previewKey}
                                loading={preview.loading === activeOption.previewKey}
                                onToggle={() => preview.toggle(activeOption.previewKey!)} />
                        )}
                    </div>
                ) : (
                    // 曲風一律可選：曲風的優先序高於主旋律，選了之後主旋律會自動跟著
                    // 設成相容的值。反過來讓主旋律把曲風變灰，等於讓次要的選擇限制
                    // 主要的選擇。
                    <div ref={carouselRef} role="group" aria-label="曲風"
                        className="carousel -mx-4 w-[calc(100%+2rem)] max-w-none scroll-px-4 gap-2 px-4 py-1">
                        {GENRE_OPTIONS.map((o) => (
                            <GenreTile key={o.id} option={o} selected={isOptionSelected(o)} isNew={isNewOption(o)}
                                onSelect={selectGenre}
                                preview={o.previewKey && preview.canPreview(o.previewKey) ? (
                                    <PreviewButton label={`試聽 ${o.nameZh} 節奏`}
                                        playing={preview.playing === o.previewKey}
                                        loading={preview.loading === o.previewKey}
                                        onToggle={() => preview.toggle(o.previewKey!)} />
                                ) : undefined} />
                        ))}
                    </div>
                )}

                {genreDetail}
                {customPanel}
            </Section>

            <CollapseSection compact={compact} title="節奏與調性" defaultOpen={compact}
                icon={<Gauge className="size-5" aria-hidden="true" />}
                summary={`${bpm} BPM · ${keyLabel}`}>
                <div>
                    <FieldLabel htmlFor="cpf-bpm" hint={tempoRange
                        ? `依「${activeOption?.nameZh ?? ''}」${tempoRange[0]}–${tempoRange[1]}`
                        : '自訂範圍 30–200'}>BPM</FieldLabel>
                    <div className="join w-full">
                        <button type="button" className={compact ? 'btn btn-sm join-item' : 'btn btn-lg join-item'} aria-label="BPM 減 1"
                            disabled={bpm <= bpmMin} onClick={() => commitBpm(bpm - 1)}>
                            <Minus className="size-5" aria-hidden="true" />
                        </button>
                        <input id="cpf-bpm" type="number" inputMode="numeric" aria-label="BPM"
                            className={compact ? 'input input-sm join-item w-full text-center font-semibold tabular-nums' : 'input input-lg join-item w-full text-center text-2xl font-semibold tabular-nums'}
                            min={bpmMin} max={bpmMax} value={bpmDraft ?? String(bpm)}
                            onChange={(e) => {
                                setBpmDraft(e.target.value);
                                const n = parseInt(e.target.value, 10);
                                if (!Number.isNaN(n) && n >= bpmMin && n <= bpmMax) set('bpm', n);
                            }}
                            onBlur={(e) => {
                                const n = parseInt(e.target.value, 10);
                                setBpmDraft(null);
                                commitBpm(Number.isNaN(n) ? bpm : n);
                            }} />
                        <button type="button" className={compact ? 'btn btn-sm join-item' : 'btn btn-lg join-item'} aria-label="BPM 加 1"
                            disabled={bpm >= bpmMax} onClick={() => commitBpm(bpm + 1)}>
                            <Plus className="size-5" aria-hidden="true" />
                        </button>
                    </div>
                    <input type="range" aria-label="BPM 滑桿" className="range range-sm mt-3 w-full"
                        min={bpmMin} max={bpmMax} value={bpm}
                        onChange={(e) => { setBpmDraft(null); commitBpm(parseInt(e.target.value, 10)); }} />
                    <div className="mt-1 flex justify-between text-xs text-base-content/60 tabular-nums">
                        <span>{bpmMin}</span><span>{bpmMax}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                        {[
                            ['最慢', bpmMin],
                            // tempoRange already prefers activeStyle over the
                            // borrowed baseGenre (same as bpmMin/bpmMax above) —
                            // reading currentGenre.bpmRange directly here showed
                            // chacha's midpoint while a rhythm-only style was active.
                            ...(tempoRange ? [['建議', getBpmMidpoint(tempoRange)] as [string, number]] : []),
                            ['最快', bpmMax],
                        ].map(([l, v]) => (
                            <button key={l as string} type="button" aria-pressed={bpm === v}
                                className={compact
                                    ? (bpm === v ? 'btn btn-sm btn-active flex-1 px-1 text-xs whitespace-nowrap tabular-nums' : 'btn btn-sm flex-1 px-1 text-xs whitespace-nowrap tabular-nums')
                                    : (bpm === v ? 'btn btn-sm btn-active flex-1 px-1 whitespace-nowrap tabular-nums' : 'btn btn-sm flex-1 px-1 whitespace-nowrap tabular-nums')}
                                onClick={() => { setBpmDraft(null); commitBpm(v as number); }}>
                                {`${l} ${v}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <FieldLabel>調性</FieldLabel>
                    <Segmented label="調性類型" value={keyType} size={compact ? 'sm' : 'md'}
                        onSelect={(t) => onChange({ ...value, keyType: t, keyCenter: KEY_CENTERS[t as 'major' | 'minor'][0].value })}
                        options={[{ value: 'major', label: '大調' }, { value: 'minor', label: '小調' }]} />
                    <div role="group" aria-label="音中心" className="mt-2 grid grid-cols-5 gap-1.5">
                        {keyOptions(keyType).map((k) => {
                            const on = keyCenter === k.value;
                            return (
                                <button key={k.value} type="button" aria-pressed={on} aria-label={k.label}
                                    className={on ? 'btn btn-sm btn-primary px-0' : 'btn btn-sm px-0'}
                                    onClick={() => set('keyCenter', k.value)}>
                                    {k.value}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-1.5 text-xs text-base-content/60">目前：{keyLabel}</p>
                </div>
                {musicTabExtra}
            </CollapseSection>

            {(hasInstruments || voiceBlock) && (
                <CollapseSection compact={compact} title={showVoicePack ? '樂器與音色' : '樂器'}
                    icon={<Piano className="size-5" aria-hidden="true" />}
                    summary={`${instrumentSummary}${voiceSummary}`}>
                    {hasInstruments && (
                        <div>
                            <FieldLabel hint="換曲風會帶入建議組合">樂器</FieldLabel>
                            {isDualFields ? (
                                <>
                                    <div role="tablist" aria-label="演奏者" className="tabs tabs-box mb-2">
                                        {(['first', 'second'] as const).map((t) => (
                                            <button key={t} type="button" role="tab" aria-selected={dualTab === t}
                                                id={`${tabIdBase}-tab-${t}`} aria-controls={`${tabIdBase}-panel-${t}`}
                                                className={dualTab === t ? 'tab tab-active flex-1' : 'tab flex-1'}
                                                onClick={() => setDualTab(t)}>
                                                {t === 'first' ? '第一人' : '第二人'}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Both lists stay mounted (one hidden) so switching tabs never
                                        remounts a select the user just changed. */}
                                    {(['first', 'second'] as const).map((t) => (
                                        <div key={t} role="tabpanel" hidden={dualTab !== t}
                                            id={`${tabIdBase}-panel-${t}`} aria-labelledby={`${tabIdBase}-tab-${t}`}>
                                            <InstrumentList value={value} onPick={set}
                                                stripPrefix={t === 'first' ? '第一人 ' : '第二人 '}
                                                fields={instrumentFields!.filter(([f]) => f.startsWith(`${t}_`))} />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <InstrumentList value={value} onPick={set} fields={instrumentFields!} />
                            )}
                        </div>
                    )}
                    {voiceBlock}
                </CollapseSection>
            )}

            <CollapseSection compact={compact} title="樂譜資訊"
                icon={<FileMusic className="size-5" aria-hidden="true" />}
                summary={`${value.title || '未命名的樂譜'} · ${value.recordingTime ?? 5} 分鐘`}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <FieldLabel htmlFor="cpf-title">樂譜標題</FieldLabel>
                        <input id="cpf-title" type="text" aria-label="樂譜標題" className={compact ? 'input input-sm w-full' : 'input w-full'} placeholder="未命名的樂譜"
                            value={value.title ?? ''} onChange={(e) => set('title', e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel htmlFor="cpf-rec" hint="1–60">紀錄時間（分鐘）</FieldLabel>
                        <input id="cpf-rec" type="number" aria-label="紀錄時間（分鐘）" className={compact ? 'input input-sm w-full' : 'input w-full'} placeholder="5" min={1} max={60}
                            value={value.recordingTime ?? 5}
                            onChange={(e) => set('recordingTime', parseInt(e.target.value) || 5)} />
                    </div>
                </div>
                {basicTabExtra}
            </CollapseSection>

            {!compact && (
                <dialog ref={sheetRef} className="modal modal-bottom" aria-label="全部曲風"
                    onClose={() => setSheetOpen(false)} onCancel={() => setSheetOpen(false)}>
                    <div className="modal-box flex max-h-[85dvh] flex-col p-0 sm:mx-auto sm:max-w-lg">
                        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                            <h3 className="text-lg font-semibold">全部曲風 <span className="text-sm font-normal text-base-content/60">{GENRE_OPTIONS.length} 種</span></h3>
                            <button type="button" className="btn btn-circle btn-ghost size-11" aria-label="關閉"
                                onClick={() => setSheetOpen(false)}>
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </div>
                        {sheetOpen && (
                            <ul className="list overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+0.5rem)]" role="listbox" aria-label="曲風">
                                {GENRE_OPTIONS.map((o) => {
                                    const on = isOptionSelected(o);
                                    const credit = presetOf(o)?.credit;
                                    return (
                                        <li key={o.id} role="option" aria-selected={on} className="list-row items-center gap-2 py-2">
                                            {o.previewKey && preview.canPreview(o.previewKey) ? (
                                                <PreviewButton label={`試聽 ${o.nameZh} 節奏`}
                                                    playing={preview.playing === o.previewKey}
                                                    loading={preview.loading === o.previewKey}
                                                    onToggle={() => preview.toggle(o.previewKey!)} />
                                            ) : anyPreview ? <span className="size-11 shrink-0" aria-hidden="true" /> : null}
                                            <button type="button" className="list-col-grow flex min-h-11 items-center gap-3 text-left"
                                                onClick={() => pickFromSheet(o.id)}>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-1.5 font-semibold">
                                                        {o.nameZh}<span className="text-sm font-normal text-base-content/60">{o.nameEn}</span>
                                                        {isNewOption(o) && <span className="badge badge-soft badge-xs">NEW</span>}
                                                    </span>
                                                    <span className="block text-xs text-base-content/70">
                                                        {o.bpmRange ? `BPM ${o.bpmRange[0]}–${o.bpmRange[1]}` : '手動指定主旋律與節奏'}
                                                        {o.timeSignature ? ` · ${o.timeSignature}` : ''}
                                                        {credit ? ` · 節奏由 ${credit} 調校` : ''}
                                                    </span>
                                                    <span className="block text-xs text-base-content/60">{o.description}</span>
                                                </span>
                                                <span className={on ? 'grid size-6 shrink-0 place-items-center rounded-full border border-primary bg-primary text-primary-content' : 'grid size-6 shrink-0 place-items-center rounded-full border border-base-content/30'}>
                                                    {on ? <Check className="size-4" aria-hidden="true" /> : <ChevronRight className="size-4 text-base-content/40" aria-hidden="true" />}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button type="submit" aria-label="關閉全部曲風" onClick={() => setSheetOpen(false)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default CompositionParamsForm;
