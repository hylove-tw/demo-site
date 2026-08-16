// src/components/CompositionParamsForm.tsx
//
// The parameters that decide *what gets composed* — key, melody pattern, genre,
// BPM, instruments, background audio.
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
// `variant="compact"` for the editor's parameter panel.

import React, { useState } from 'react';
import { useMusicGenPresets, presetForBeat, beatOptionLabel, beatCredit } from '../hooks/useMusicGenPresets';
import { getPresetsForTimeSignature, BEAT_PRESETS } from '../utils/beatPresets';
import { useBeatPreview } from '../hooks/useBeatPreview';
import { BeatPatternStaff } from './BeatPatternStaff';
import {
    GENRE_BEAT_MAP,
    KEY_CENTERS,
    MELODY_PATTERNS,
    GENRES,
    BRAINWAVE_FREQUENCIES,
    NATURE_SOUNDS,
    getCompatibleMelodies,
    getCompatibleGenres,
    getBpmMidpoint,
    timeSignatureForMelody,
    MelodyPattern,
    Genre,
} from '../config/musicCreativeConstants';

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

export type CompositionParams = Record<string, any>;

export interface CompositionParamsFormProps {
    value: CompositionParams;
    onChange: (next: CompositionParams) => void;
    variant?: 'full' | 'compact';
    /** Which instrument fields to offer; omit to hide the instrument section. */
    instrumentFields?: Array<[string, string]>;
    /** The single/dual switch only makes sense before an analysis has run. */
    showPlayerMode?: boolean;
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

export const CompositionParamsForm: React.FC<CompositionParamsFormProps> = ({
    value,
    onChange,
    variant = 'full',
    instrumentFields,
    showPlayerMode = false,
}) => {
    const compact = variant === 'compact';
    const set = (field: string, v: any) => onChange({ ...value, [field]: v });

    // Open only when a melody is already chosen, then leave it to the user.
    // Deriving `open` from the value on every render would re-open the section
    // each time they collapsed it.
    const [advancedOpen, setAdvancedOpen] = useState(
        Boolean(value.melodyPattern) || Boolean(value.beat));

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

    const availableMelodies: MelodyPattern[] =
        selectedGenre ? getCompatibleMelodies(selectedGenre) : MELODY_PATTERNS;
    const availableGenres: Genre[] =
        selectedMelody ? getCompatibleGenres(selectedMelody) : GENRES;

// Rhythms that fit the metre the chosen melody produces. Left unset, the
    // rhythm follows the genre — some rhythms (森巴) have no matching genre in
    // the upstream enum, so without an explicit choice they are unreachable.
    const availableBeats = getPresetsForTimeSignature(
        timeSignatureForMelody(selectedMelody));
    const effectiveBeat = value.beat
        || (selectedGenre ? GENRE_BEAT_MAP[selectedGenre] : undefined);

    // Choosing a genre settles the melody. If the user then changes it, the
    // combination is no longer that genre's — say so rather than keep showing
    // the genre as if it still described what will be composed.
    const isCustomGenre = Boolean(
        selectedGenre && selectedMelody
        && selectedMelody !== defaultMelodyFor(selectedGenre));

    const currentGenre = GENRES.find((g) => g.id === selectedGenre);
    const bpmMin = currentGenre?.bpmRange[0] ?? 30;
    const bpmMax = currentGenre?.bpmRange[1] ?? 200;
    const bpm = Math.min(Math.max(value.bpm ?? 60, bpmMin), bpmMax);

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

            {/* 主旋律與伴奏節奏都收在這裡。「曲風」是使用者唯一需要做的風格選擇——
                它同時決定作曲與伴奏節奏。把節奏另外攤在主流程上會與曲風混淆：兩者的
                選項名稱大量重疊（雷鬼、探戈、倫巴…），使用者沒有理由分得出來哪個管什麼。
                只有想用曲風清單裡沒有對應項目的節奏（例如森巴）才需要展開。 */}
            <details className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
                     open={advancedOpen}
                     onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}>
                <summary className="collapse-title min-h-0 py-3 text-sm font-medium flex items-center gap-2">
                    <span>進階選項</span>
                    <span className="ml-auto text-xs font-normal text-base-content/60">
                        {`主旋律 ${selectedMelody ?? '預設'}${isCustomGenre ? '（自訂）' : ''}・節奏 ${
                            value.beat
                                ? (availableBeats.find((b) => b.id === value.beat)?.name ?? value.beat)
                                : '跟隨曲風'}`}
                    </span>
                </summary>
                <div className="collapse-content">
                    <div className="text-sm font-medium">主旋律</div>
                    <p className="text-xs text-base-content/60 mb-3">
                        決定音符密度，同時決定拍號。
                        <span className="font-medium">選擇曲風時會自動帶出對應的主旋律</span>，
                        在此改動會讓曲風變成「自訂曲風」。
                    </p>
                {compact ? (
                    <div className={fieldCls}>
                        <select className={selectCls} value={selectedMelody ?? ''}
                            onChange={(e) => onChange(applyMelody(value, Number(e.target.value)))}>
                            <option value="" disabled>請選擇主旋律</option>
                            {MELODY_PATTERNS.map((m) => (
                                <option key={m.id} value={m.id}
                                    disabled={!availableMelodies.some((a) => a.id === m.id)}>
                                    主旋律 {m.id}（{m.timeSignature}）
                                </option>
                            ))}
                        </select>
                        <label className="label py-1">
                            <span className="label-text-alt text-base-content/50">
                                拍號 {timeSignatureForMelody(selectedMelody)}，由主旋律決定
                            </span>
                        </label>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {MELODY_PATTERNS.map((melody) => {
                            const available = availableMelodies.some((m) => m.id === melody.id);
                            const recommended = musicType === 'spiritual' && melody.id <= 3;
                            const selected = selectedMelody === melody.id;
                            return (
                                <button key={melody.id} type="button" disabled={!available}
                                    className={`card card-compact border-2 text-left transition-all cursor-pointer
                                        ${selected ? 'border-primary bg-primary/10'
                                            : available ? 'border-base-300 hover:border-primary/50'
                                                : 'border-base-200 opacity-40 cursor-not-allowed'}`}
                                    onClick={() => available && onChange(applyMelody(value, melody.id))}>
                                    <div className="card-body p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm">主旋律 {melody.id}</span>
                                            <div className="flex gap-1">
                                                {recommended && <span className="badge badge-success badge-xs">推薦</span>}
                                                <span className="badge badge-outline badge-xs">{melody.timeSignature}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs opacity-70 mt-1 grid grid-cols-2 gap-x-2">
                                            {melody.noteValues.map((nv, i) => <span key={i}>值{i}: {nv}</span>)}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                    <div className="divider my-3" />

                    <div className="text-sm font-medium">伴奏節奏</div>
                    <p className="text-xs text-base-content/60 mb-3">
                        決定鼓組與伴奏聲部，<span className="font-medium">預設跟隨曲風</span>，一般不需更動。
                        只有想用曲風清單裡沒有對應項目的節奏（例如<span className="font-medium">森巴</span>）
                        才需要在這裡選。
                    </p>
            <div className={fieldCls}>
                <select className={selectCls} value={value.beat ?? ''}
                    onChange={(e) => set('beat', e.target.value || undefined)}>
                    <option value="">
                        依曲風自動決定
                        {effectiveBeat && !value.beat
                            ? `（目前：${availableBeats.find(b => b.id === effectiveBeat)?.name ?? effectiveBeat}）`
                            : ''}
                    </option>
                    {availableBeats.filter(b => b.id !== 'none').map((beat) => (
                        <option key={beat.id} value={beat.id}>
                            {beatOptionLabel(musicGenPresets, beat)}
                        </option>
                    ))}
                    <option value="none">不加節奏</option>
                </select>
                {beatCredit(musicGenPresets, effectiveBeat) && (
                    <label className={labelCls}>
                        <span className="label-text-alt flex items-center gap-1.5">
                            {presetForBeat(musicGenPresets, effectiveBeat)?.isNew && (
                                <span className="badge badge-primary badge-xs">NEW</span>
                            )}
                            <span className="text-base-content/70">
                                {beatCredit(musicGenPresets, effectiveBeat)}
                            </span>
                        </span>
                    </label>
                )}
                {!compact && (
                    <label className="label py-1">
                        <span className="label-text-alt text-base-content/50">
                            森巴等節奏在曲風清單中沒有對應項目，需要在這裡直接選。
                        </span>
                    </label>
                )}
            </div>
                </div>
            </details>

            <Divider>{isCustomGenre ? '曲風（自訂）' : '曲風'}</Divider>

            {isCustomGenre && (
                <div className="alert alert-info py-2 text-xs">
                    <span>
                        目前是<span className="font-medium">自訂曲風</span>：主旋律已改為
                        {` ${selectedMelody}`}，與「{currentGenre?.nameZh}」預設的
                        {` ${defaultMelodyFor(selectedGenre!)}`} 不同。
                        重新點選曲風即可回到預設組合。
                    </span>
                </div>
            )}

            {compact ? (
                <div className={fieldCls}>
                    <select className={selectCls} value={selectedGenre ?? ''}
                        onChange={(e) => onChange(applyGenre(value, e.target.value))}>
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
                    </select>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {GENRES.map((genre) => {
                        const available = availableGenres.some((g) => g.id === genre.id);
                        const selected = selectedGenre === genre.id;
                        return (
                            <button key={genre.id} type="button" disabled={!available}
                                className={`card card-compact border-2 text-left transition-all cursor-pointer
                                    ${selected ? 'border-primary bg-primary/10'
                                        : available ? 'border-base-300 hover:border-primary/50'
                                            : 'border-base-200 opacity-40 cursor-not-allowed'}`}
                                onClick={() => available && onChange(applyGenre(value, genre.id))}>
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
                </div>
            )}

            <Divider>BPM</Divider>

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
                    {currentGenre && <span>建議 {getBpmMidpoint(currentGenre.bpmRange)}</span>}
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

            <Divider>背景音效</Divider>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}><span className={labelTextCls}>腦波背景頻率</span></label>
                    <select className={selectCls}
                        value={value.brainwaveFrequency ?? ''}
                        onChange={(e) => set('brainwaveFrequency',
                            e.target.value === '' ? null : parseFloat(e.target.value))}>
                        <option value="">不使用</option>
                        {BRAINWAVE_FREQUENCIES.map((f) => (
                            <option key={f.value} value={f.value}>{f.label} - {f.description}</option>
                        ))}
                    </select>
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}><span className={labelTextCls}>自然音效</span></label>
                    <select className={selectCls}
                        value={value.natureSound ?? ''}
                        onChange={(e) => set('natureSound', e.target.value)}>
                        <option value="">不使用</option>
                        {NATURE_SOUNDS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CompositionParamsForm;
