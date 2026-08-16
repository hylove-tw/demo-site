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

import React from 'react';
import { useMusicGenPresets, presetForBeat } from '../hooks/useMusicGenPresets';
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

    const next: CompositionParams = { ...params, genre: genreId, bpm: getBpmMidpoint(genre.bpmRange) };
    if (params.melodyPattern && !getCompatibleMelodies(genreId).some((m) => m.id === params.melodyPattern)) {
        delete next.melodyPattern;
    }
    return next;
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

    // Picking a genre also picks the rhythm it maps to, so a genre backed by a
    // credited groove should say so here — this is where the choice is actually
    // made, and the two happen to share a name (雷鬼 the genre, 雷鬼 the rhythm).
    const musicGenPresets = useMusicGenPresets();
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

            <Divider>主旋律</Divider>

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

            <Divider>曲風</Divider>

            {compact ? (
                <div className={fieldCls}>
                    <select className={selectCls} value={selectedGenre ?? ''}
                        onChange={(e) => onChange(applyGenre(value, e.target.value))}>
                        <option value="" disabled>請選擇曲風</option>
                        {GENRES.map((g) => (
                            <option key={g.id} value={g.id}
                                disabled={!availableGenres.some((a) => a.id === g.id)}>
                                {g.nameZh}（BPM {g.bpmRange[0]}~{g.bpmRange[1]}）
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
                                    <div className="text-xs opacity-50 mt-0.5">{genre.beatPattern}</div>
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
