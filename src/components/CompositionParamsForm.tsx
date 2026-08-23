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
// Only presentation differs: `variant="full"` for the standing-alone form,
// `variant="compact"` for the editor's parameter panel. Both are split into a
// 基本設定 tab (title, recording time, music type, key) and a 音樂設定 tab
// (genre, BPM, instruments) — mirroring the mental model a genre is the only
// style choice most people need to make, with melody/rhythm override tucked
// behind an explicit "自訂" genre entry rather than a second control that can
// silently drift from it.

import React, { useState } from 'react';
import { useMusicGenPresets, presetForBeat, beatOptionLabel, beatCredit } from '../hooks/useMusicGenPresets';
import { getPresetsForTimeSignature, BEAT_PRESETS } from '../utils/beatPresets';
import { useBeatPreview } from '../hooks/useBeatPreview';
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
    /** Extra content appended to the end of the 基本設定 tab (e.g. a caller-owned checkbox). */
    basicTabExtra?: React.ReactNode;
    /** Extra content appended to the end of the 音樂設定 tab. */
    musicTabExtra?: React.ReactNode;
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
    return {
        ...params,
        genre: genreId,
        bpm: getBpmMidpoint(genre.bpmRange),
        melodyPattern: defaultMelodyFor(genreId),
    };
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
    if (params.genre && !getCompatibleGenres(melodyId).some((g) => g.id === params.genre)) {
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
    return {
        ...applyGenre(params, style.baseGenre),
        beat: style.beat,
        // applyGenre set the borrowed genre's tempo; this style's own range is
        // the right one.
        bpm: getBpmMidpoint(style.bpmRange),
    };
}

export const CompositionParamsForm: React.FC<CompositionParamsFormProps> = ({
    value,
    onChange,
    variant = 'full',
    instrumentFields,
    showPlayerMode = false,
    basicTabExtra,
    musicTabExtra,
}) => {
    const compact = variant === 'compact';
    const set = (field: string, v: any) => onChange({ ...value, [field]: v });

    const [activeTab, setActiveTab] = useState<'basic' | 'music'>('basic');

    // Picking a genre also picks the rhythm it maps to, so a genre backed by a
    // credited groove should say so here — this is where the choice is actually
    // made, and the two happen to share a name (雷鬼 the genre, 雷鬼 the rhythm).
    const musicGenPresets = useMusicGenPresets();
    const preview = useBeatPreview();
    const rhythmFor = (genreId: string) =>
        presetForBeat(musicGenPresets, GENRE_BEAT_MAP[genreId]);


    const playerMode = value.playerMode ?? 'single';
    const musicType = value.musicType ?? 'emotion';
    const keyType = (value.keyType ?? 'major') as 'major' | 'minor';
    const selectedMelody = value.melodyPattern as number | undefined;
    const selectedGenre = value.genre as string | undefined;
    const activeStyle = RHYTHM_ONLY_STYLES.find((st) => st.beat === value.beat);
    // "自訂": no genre backs the current melody/rhythm — both are picked by
    // hand instead of following a genre's defaults.
    const isCustom = selectedGenre === CUSTOM_GENRE_ID;
    // The real genre id to use for compatibility lookups — undefined in
    // custom mode, same as "no genre chosen yet".
    const genreKey = isCustom ? undefined : selectedGenre;

    const availableGenres: Genre[] =
        (selectedMelody && !isCustom) ? getCompatibleGenres(selectedMelody) : GENRES;

    // Rhythms that fit the metre the chosen melody produces. Left unset, the
    // rhythm follows the genre — some rhythms (森巴) have no matching genre in
    // the upstream enum, so without an explicit choice they are unreachable.
    const availableBeats = getPresetsForTimeSignature(
        timeSignatureForMelody(selectedMelody));

    const currentGenre = GENRES.find((g) => g.id === genreKey);
    // A rhythm-only style sets the tempo range, not the genre it borrows for
    // composition: samba needs 150–200, and chacha — the genre it pairs with
    // because the upstream places no tempo limit on it — displays 60–140.
    // Custom mode has neither, so BPM falls back to the full 30–200 range.
    const tempoRange = activeStyle?.bpmRange ?? currentGenre?.bpmRange;
    const bpmMin = tempoRange?.[0] ?? 30;
    const bpmMax = tempoRange?.[1] ?? 200;
    const bpm = Math.min(Math.max(value.bpm ?? 60, bpmMin), bpmMax);

    const selectGenre = (genreId: string) => {
        if (genreId === CUSTOM_GENRE_ID) {
            onChange({ ...value, genre: CUSTOM_GENRE_ID, beat: undefined });
            return;
        }
        const chosenStyle = RHYTHM_ONLY_STYLES.find((st) => st.id === genreId);
        onChange(chosenStyle ? applyRhythmStyle(value, chosenStyle) : applyGenre(value, genreId));
    };

    const inputCls = compact ? 'input input-bordered input-sm w-full' : 'input input-underline w-full';
    const selectCls = compact ? 'select select-bordered select-sm w-full' : 'select select-underline w-full';
    const labelCls = compact ? 'label py-1' : 'label label-minimal';
    const labelTextCls = compact ? 'label-text text-xs' : 'label-text';
    const fieldCls = compact ? 'form-control' : 'form-control form-control-minimal';
    const btnCls = compact ? 'btn join-item flex-1 btn-xs' : 'btn join-item flex-1 btn-sm';

    const Divider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
        compact
            ? <div className="divider my-2 text-xs text-base-content/50">{children}</div>
            : <div className="divider-minimal">{children}</div>;

    return (
        <div className={compact ? 'space-y-3' : 'space-y-6 p-4 border border-base-300 rounded-lg'}>
            {showPlayerMode && (
                <div>
                    <label className={labelCls}>
                        <span className={`${labelTextCls} font-semibold`}>演奏模式</span>
                    </label>
                    <div className="join w-full">
                        <button type="button"
                            className={`btn join-item flex-1 ${playerMode === 'single' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => set('playerMode', 'single')}>單人模式</button>
                        <button type="button"
                            className={`btn join-item flex-1 ${playerMode === 'dual' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => set('playerMode', 'dual')}>雙人模式（琴瑟合）</button>
                    </div>
                    <div className="text-xs opacity-60 mt-2 px-1">
                        {playerMode === 'single'
                            ? '單人模式：上傳前測與後測腦波資料，生成三聲部樂譜'
                            : '雙人模式：上傳兩人腦波資料，生成六聲部合奏樂譜'}
                    </div>
                </div>
            )}

            {/* 基本設定／音樂設定：曲風是唯一需要做的風格選擇，同時決定作曲與伴奏
                節奏；只有選了「自訂」才需要自己指定主旋律與伴奏節奏。 */}
            <div className="tabs tabs-boxed">
                <button type="button"
                    className={`tab ${activeTab === 'basic' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('basic')}>基本設定</button>
                <button type="button"
                    className={`tab ${activeTab === 'music' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('music')}>音樂設定</button>
            </div>

            {activeTab === 'basic' && (
                <div className="space-y-4">
                    {/* 音樂類型 */}
                    <div>
                        <label className={labelCls}>
                            <span className={`${labelTextCls} font-semibold`}>音樂類型</span>
                        </label>
                        <div className="join w-full">
                            <button type="button"
                                className={`${btnCls} ${musicType === 'emotion' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => set('musicType', 'emotion')}>情緒音樂（睜眼）</button>
                            <button type="button"
                                className={`${btnCls} ${musicType === 'spiritual' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => set('musicType', 'spiritual')}>心靈音樂（閉眼）</button>
                        </div>
                        {musicType === 'spiritual' && !compact && (
                            <div className="alert alert-info mt-2 text-sm">
                                <span>心靈音樂建議選擇主旋律 1、2 或 3</span>
                            </div>
                        )}
                    </div>

                    {/* 標題與紀錄時間 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={fieldCls}>
                            <label className={labelCls}><span className={labelTextCls}>樂譜標題</span></label>
                            <input type="text" className={inputCls} placeholder="未命名的樂譜"
                                value={value.title ?? ''} onChange={(e) => set('title', e.target.value)} />
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls}><span className={labelTextCls}>紀錄時間（分鐘）</span></label>
                            <input type="number" className={inputCls} placeholder="5" min={1} max={60}
                                value={value.recordingTime ?? 5}
                                onChange={(e) => set('recordingTime', parseInt(e.target.value) || 5)} />
                        </div>
                    </div>

                    <Divider>音中心</Divider>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={fieldCls}>
                            <label className={labelCls}><span className={labelTextCls}>調性類型</span></label>
                            <div className="join w-full">
                                {(['major', 'minor'] as const).map((type) => (
                                    <button key={type} type="button"
                                        className={`${btnCls} ${keyType === type ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => onChange({
                                            ...value, keyType: type, keyCenter: KEY_CENTERS[type][0].value,
                                        })}>
                                        {type === 'major' ? '大調' : '小調'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls}><span className={labelTextCls}>調性</span></label>
                            <select className={selectCls}
                                value={value.keyCenter ?? KEY_CENTERS[keyType][0].value}
                                onChange={(e) => set('keyCenter', e.target.value)}>
                                {KEY_CENTERS[keyType].map((k) => (
                                    <option key={k.value} value={k.value}>{k.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {basicTabExtra}
                </div>
            )}

            {activeTab === 'music' && (
                <div className="space-y-4">
                    <Divider>曲風</Divider>

                    {compact ? (
                        <div className={fieldCls}>
                            <select className={selectCls}
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
                                        {rhythmFor(g.id)?.isNew ? ' ‧ NEW' : ''}
                                    </option>
                                ))}
                                {/* 只有節奏、沒有對應上游曲風的風格——跟卡片版並列同一份清單，
                                    見 applyRhythmStyle 的說明。 */}
                                {RHYTHM_ONLY_STYLES.map((style) => {
                                    const rhythm = presetForBeat(musicGenPresets, style.beat);
                                    return (
                                        <option key={style.id} value={style.id}>
                                            {style.nameZh}（BPM {style.bpmRange[0]}~{style.bpmRange[1]}）
                                            {rhythm?.isNew ? ' ‧ NEW' : ''}
                                        </option>
                                    );
                                })}
                                <option value={CUSTOM_GENRE_ID}>自訂</option>
                            </select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {/* 曲風一律可選：曲風的優先序高於主旋律，選了之後主旋律會自動
                                跟著設成相容的值。反過來讓主旋律把曲風變灰，等於讓次要的選擇
                                限制主要的選擇。 */}
                            {GENRES.map((genre) => {
                                const selected = selectedGenre === genre.id && !value.beat;
                                return (
                                    <button key={genre.id} type="button"
                                        className={`card card-compact border-2 text-left transition-all cursor-pointer
                                            ${selected ? 'border-primary bg-primary/10'
                                                : 'border-base-300 hover:border-primary/50'}`}
                                        onClick={() => selectGenre(genre.id)}>
                                        <div className="card-body p-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-sm">{genre.nameZh}</span>
                                                {rhythmFor(genre.id)?.isNew && (
                                                    <span className="badge badge-primary badge-xs">NEW</span>
                                                )}
                                                {/* 試聽。用 span 而非 button：這張卡本身就是按鈕，
                                                    巢狀的互動元素在部分瀏覽器不合法也不好操作。 */}
                                                {preview.canPreview(genre.id) && (
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={`試聽 ${genre.nameZh} 節奏`}
                                                    title={preview.playing === genre.id ? '停止試聽' : '試聽節奏'}
                                                    className="ml-auto btn btn-ghost btn-xs px-1"
                                                    onClick={(e) => { e.stopPropagation(); preview.toggle(genre.id); }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            preview.toggle(genre.id);
                                                        }
                                                    }}
                                                >
                                                    {preview.loading === genre.id
                                                        ? <span className="loading loading-spinner loading-xs" />
                                                        : preview.playing === genre.id ? '■' : '▶'}
                                                </span>
                                                )}
                                            </div>
                                            <div className="text-xs opacity-60">{genre.nameEn}</div>
                                            {rhythmFor(genre.id)?.credit && (
                                                <div className="text-xs text-primary/80 mt-0.5">
                                                    節奏由 {rhythmFor(genre.id)!.credit} 調校
                                                </div>
                                            )}
                                            <div className="text-xs mt-1">
                                                <span className="badge badge-outline badge-xs">
                                                    BPM {genre.bpmRange[0]}~{genre.bpmRange[1]}
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                <BeatPatternStaff
                                                    pattern={genre.beatPattern}
                                                    label={`${genre.nameZh} 節拍：${genre.beatPattern}`}
                                                />
                                            </div>
                                            {BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[genre.id]) && (
                                                <div className="text-xs opacity-50">
                                                    節奏：{BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[genre.id])!.name}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            {/* 只有節奏、沒有對應上游曲風的風格。與曲風並列，因為對使用者
                                而言它們是同一種選擇；差別只在送給後端的欄位。 */}
                            {RHYTHM_ONLY_STYLES.map((style) => {
                                const rhythm = presetForBeat(musicGenPresets, style.beat);
                                const selected = value.beat === style.beat;
                                return (
                                    <button key={style.id} type="button"
                                        className={`card card-compact border-2 text-left transition-all cursor-pointer
                                            ${selected ? 'border-primary bg-primary/10'
                                                : 'border-base-300 hover:border-primary/50'}`}
                                        onClick={() => selectGenre(style.id)}>
                                        <div className="card-body p-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-sm">{style.nameZh}</span>
                                                {rhythm?.isNew && (
                                                    <span className="badge badge-primary badge-xs">NEW</span>
                                                )}
                                                {/* Keyed by style.beat, not style.id: useBeatPreview resolves a
                                                    server preset from a *beat* id (falling back through
                                                    GENRE_BEAT_MAP, which RHYTHM_ONLY_STYLES never appear in).
                                                    samba's id and beat happen to be the same string, which
                                                    hid this when bossa_nova's ('bossa_nova' vs 'bossanova')
                                                    didn't resolve and silently lost its preview button. */}
                                                {preview.canPreview(style.beat) && (
                                                <span
                                                    role="button" tabIndex={0}
                                                    aria-label={`試聽 ${style.nameZh} 節奏`}
                                                    title={preview.playing === style.beat ? '停止試聽' : '試聽節奏'}
                                                    className="ml-auto btn btn-ghost btn-xs px-1"
                                                    onClick={(e) => { e.stopPropagation(); preview.toggle(style.beat); }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault(); e.stopPropagation();
                                                            preview.toggle(style.beat);
                                                        }
                                                    }}
                                                >
                                                    {preview.loading === style.beat
                                                        ? <span className="loading loading-spinner loading-xs" />
                                                        : preview.playing === style.beat ? '■' : '▶'}
                                                </span>
                                                )}
                                            </div>
                                            <div className="text-xs opacity-60">{style.nameEn}</div>
                                            {rhythm?.credit && (
                                                <div className="text-xs text-primary/80 mt-0.5">
                                                    節奏由 {rhythm.credit} 調校
                                                </div>
                                            )}
                                            <div className="text-xs mt-1">
                                                <span className="badge badge-outline badge-xs">
                                                    BPM {style.bpmRange[0]}~{style.bpmRange[1]}
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                <BeatPatternStaff pattern={style.beatPattern}
                                                    label={`${style.nameZh} 節拍：${style.beatPattern}`} />
                                            </div>
                                            <div className="text-xs opacity-50">節奏：{style.nameZh}</div>
                                        </div>
                                    </button>
                                );
                            })}

                            {/* 自訂：不套用任何曲風，主旋律與伴奏節奏改為手動指定。 */}
                            <button type="button"
                                className={`card card-compact border-2 text-left transition-all cursor-pointer
                                    ${isCustom ? 'border-primary bg-primary/10'
                                        : 'border-base-300 hover:border-primary/50'}`}
                                onClick={() => selectGenre(CUSTOM_GENRE_ID)}>
                                <div className="card-body p-3">
                                    <span className="font-bold text-sm">自訂</span>
                                    <div className="text-xs opacity-60">手動指定主旋律與伴奏節奏</div>
                                </div>
                            </button>
                        </div>
                    )}

                    <Divider>{isCustom ? 'BPM（自訂範圍）' : 'BPM（依曲風決定範圍）'}</Divider>

                    <div>
                        <div className="flex items-center gap-4">
                            <input type="range" className="range range-primary flex-1"
                                min={bpmMin} max={bpmMax} value={bpm}
                                onChange={(e) => set('bpm', parseInt(e.target.value))} />
                            <input type="number" className={compact ? 'input input-bordered input-sm w-20' : 'input input-underline w-24'}
                                min={bpmMin} max={bpmMax} value={bpm}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value) || bpmMin;
                                    set('bpm', Math.min(Math.max(v, bpmMin), bpmMax));
                                }} />
                        </div>
                        <div className="flex justify-between text-xs opacity-50 mt-1 px-1">
                            <span>{bpmMin}</span>
                            {/* tempoRange already prefers activeStyle over the borrowed
                                baseGenre (same as bpmMin/bpmMax above) — reading
                                currentGenre.bpmRange directly here showed chacha's
                                midpoint while a rhythm-only style was active. */}
                            {tempoRange && <span>建議 {getBpmMidpoint(tempoRange)}</span>}
                            <span>{bpmMax}</span>
                        </div>
                    </div>

                    {instrumentFields && instrumentFields.length > 0 && (
                        <>
                            <Divider>樂器</Divider>
                            <div className={`grid grid-cols-1 ${instrumentFields.length > 3 ? 'md:grid-cols-3' : 'md:grid-cols-3'} gap-3`}>
                                {instrumentFields.map(([field, label]) => (
                                    <div className={fieldCls} key={field}>
                                        <label className={labelCls}><span className={labelTextCls}>{label}</span></label>
                                        <select className={selectCls}
                                            value={value[field] ?? INSTRUMENT_DEFAULTS[field] ?? 'piano'}
                                            onChange={(e) => set(field, e.target.value)}>
                                            {INSTRUMENTS.map((inst) => (
                                                <option key={inst.value} value={inst.value}>{inst.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {isCustom && (
                        <div className={compact ? 'pt-2 border-t border-dashed border-base-300' : 'pt-4 border-t border-dashed border-base-300'}>
                            <div className="alert alert-info py-2 text-xs mb-3">
                                <span>曲風已設為「自訂」，請直接指定主旋律與伴奏節奏</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={fieldCls}>
                                    <label className={labelCls}><span className={labelTextCls}>主旋律</span></label>
                                    <select className={selectCls} value={selectedMelody ?? ''}
                                        onChange={(e) => onChange(applyMelody(value, Number(e.target.value)))}>
                                        <option value="" disabled>請選擇主旋律</option>
                                        {MELODY_PATTERNS.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                主旋律 {m.id}（{m.timeSignature}）
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={fieldCls}>
                                    <label className={labelCls}><span className={labelTextCls}>伴奏節奏</span></label>
                                    <select className={selectCls} value={value.beat ?? ''}
                                        onChange={(e) => set('beat', e.target.value || undefined)}>
                                        <option value="" disabled>請選擇伴奏節奏</option>
                                        {availableBeats.map((beat) => (
                                            <option key={beat.id} value={beat.id}>
                                                {beatOptionLabel(musicGenPresets, beat)}
                                            </option>
                                        ))}
                                    </select>
                                    {beatCredit(musicGenPresets, value.beat) && (
                                        <label className={labelCls}>
                                            <span className="label-text-alt flex items-center gap-1.5">
                                                {presetForBeat(musicGenPresets, value.beat)?.isNew && (
                                                    <span className="badge badge-primary badge-xs">NEW</span>
                                                )}
                                                <span className="text-base-content/70">
                                                    {beatCredit(musicGenPresets, value.beat)}
                                                </span>
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {musicTabExtra}
                </div>
            )}
        </div>
    );
};

export default CompositionParamsForm;
