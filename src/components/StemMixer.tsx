// src/components/StemMixer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

const MUSIC_GEN_URL = (process.env.REACT_APP_MUSIC_GEN_URL || '').replace(/\/$/, '');
const DB_MIN = -40;
const DB_MAX = 6;
const CROSSFADE_S = 1.5; // crossfade duration for looping stems

function dbToLinear(db: number) { return Math.pow(10, db / 20); }

const STEM_DEFAULT_LABELS: Record<string, string> = {
    p1: 'P1', p2: 'P2', p3: 'P3',
    drums: '鼓組', brainwave: '腦波頻率', background: '自然音效',
};

export interface StemOption { value: string; label: string; }

export interface MixDownloadConfig {
    volumes: Record<string, number>;
    brainwaves?: string[];   // frequency values e.g. ["7.83", "40"]
    backgrounds?: string[];  // sound names e.g. ["ocean", "rain"]
}

export interface StemMixerProps {
    stemUrls: Record<string, string>;
    instrumentLabels?: Record<string, string>;
    defaultVolumes?: { [key: string]: number | undefined };
    availableBrainwaves?: StemOption[];
    availableBackgrounds?: StemOption[];
    isExporting?: boolean;
    onDownload: (config: MixDownloadConfig) => void;
}

interface OptionalStem {
    type: 'brainwave' | 'background';
    value: string;
    label: string;
    url: string;
}

export function StemMixer({
    stemUrls,
    instrumentLabels,
    defaultVolumes,
    availableBrainwaves = [],
    availableBackgrounds = [],
    isExporting = false,
    onDownload,
}: StemMixerProps) {
    const fixedNames = Object.keys(stemUrls);

    const [volumes, setVolumes] = useState<Record<string, number>>(() => {
        const init: Record<string, number> = {};
        for (const name of fixedNames) {
            init[name] = defaultVolumes?.[name] ?? 0;
        }
        return init;
    });

    const [optionalStems, setOptionalStems] = useState<OptionalStem[]>([]);
    const [brainwavePick, setBrainwavePick] = useState(availableBrainwaves[0]?.value ?? '');
    const [backgroundPick, setBackgroundPick] = useState(availableBackgrounds[0]?.value ?? '');
    const [addLoading, setAddLoading] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const ctxRef         = useRef<AudioContext | null>(null);
    const gainRefs       = useRef<Record<string, GainNode>>({});
    const bufferRefs     = useRef<Record<string, AudioBuffer>>({});
    const sourcesRef     = useRef<AudioBufferSourceNode[]>([]);
    const loopingKeysRef = useRef<Set<string>>(new Set());
    const startTimeRef   = useRef(0);
    const startOffsetRef = useRef(0);
    const durationRef    = useRef(0);
    const rafRef         = useRef(0);
    const loadedRef      = useRef(false);

    // ── Audio helpers ────────────────────────────────────────────────────────

    const ensureCtx = () => {
        if (!ctxRef.current) ctxRef.current = new AudioContext();
        return ctxRef.current;
    };

    /**
     * Register a buffer + gain node. Pass loop=true for optional stems so we
     * don't extend durationRef (their length shouldn't determine when music ends).
     */
    const connectBuffer = useCallback((name: string, buffer: AudioBuffer, initialDb: number, loop = false) => {
        const ctx = ensureCtx();
        bufferRefs.current[name] = buffer;
        if (!loop) durationRef.current = Math.max(durationRef.current, buffer.duration);
        if (!gainRefs.current[name]) {
            const gain = ctx.createGain();
            gain.gain.value = dbToLinear(initialDb);
            gain.connect(ctx.destination);
            gainRefs.current[name] = gain;
        }
    }, []);

    const fetchAndDecode = useCallback(async (url: string): Promise<AudioBuffer> => {
        const fullUrl = url.startsWith('http') ? url : `${MUSIC_GEN_URL}${url}`;
        const resp = await fetch(fullUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const ctx = ensureCtx();
        return ctx.decodeAudioData(await resp.arrayBuffer());
    }, []);

    // ── Load fixed stems ─────────────────────────────────────────────────────

    const loadFixed = useCallback(async () => {
        if (loadedRef.current) return;
        setIsLoading(true);
        setLoadError(null);
        try {
            await Promise.all(fixedNames.map(async name => {
                const buf = await fetchAndDecode(stemUrls[name]);
                const db = defaultVolumes?.[name] ?? 0;
                connectBuffer(name, buf, db, false);
            }));
            loadedRef.current = true;
        } catch (e: any) {
            setLoadError(e.message || '載入失敗');
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stemUrls]);

    // ── Volume slider ────────────────────────────────────────────────────────

    const handleVolumeChange = (name: string, db: number) => {
        setVolumes(prev => ({ ...prev, [name]: db }));
        const ctx = ctxRef.current;
        const gain = gainRefs.current[name];
        if (ctx && gain) gain.gain.setTargetAtTime(dbToLinear(db), ctx.currentTime, 0.01);
    };

    // ── Crossfade-loop scheduler ──────────────────────────────────────────────

    /**
     * Schedule a looping stem to cover [seekOffset, totalDuration) with
     * crossfade between each loop iteration.
     * Returns all scheduled AudioBufferSourceNodes so they can be stopped.
     */
    const scheduleLooped = (
        ctx: AudioContext,
        stemKey: string,
        startAt: number,
        seekOffset: number,
        totalDuration: number,
    ): AudioBufferSourceNode[] => {
        const buffer = bufferRefs.current[stemKey];
        const gainNode = gainRefs.current[stemKey];
        if (!buffer || !gainNode) return [];

        const L = buffer.duration;
        const cf = Math.min(CROSSFADE_S, L * 0.25); // crossfade ≤ 25% of loop
        const step = L - cf;                         // net advance per loop
        const needed = totalDuration - seekOffset;
        if (needed <= 0) return [];

        const sources: AudioBufferSourceNode[] = [];
        let ctxT = startAt;
        let bufStart = seekOffset % L; // where in the buffer to begin
        let covered = 0;               // seconds of music covered so far
        let first = true;

        while (covered < needed) {
            const chunkLen = L - bufStart; // remaining in this loop iteration
            const remaining = needed - covered;
            const isLast = chunkLen >= remaining;
            // How long to actually play this chunk (add cf overlap at end unless last)
            const playLen = isLast ? remaining : chunkLen;

            const src = ctx.createBufferSource();
            src.buffer = buffer;

            // Per-chunk fade gain (separate from the stem's master gain)
            const fadeGain = ctx.createGain();
            fadeGain.connect(gainNode);
            src.connect(fadeGain);

            if (!first) {
                // Fade in at chunk start
                fadeGain.gain.setValueAtTime(0, ctxT);
                fadeGain.gain.linearRampToValueAtTime(1, ctxT + cf);
            } else {
                fadeGain.gain.setValueAtTime(1, ctxT);
            }

            if (!isLast) {
                // Fade out at chunk end so next chunk crossfades in
                const fadeOutAt = ctxT + playLen - cf;
                fadeGain.gain.setValueAtTime(1, Math.max(ctxT, fadeOutAt));
                fadeGain.gain.linearRampToValueAtTime(0, ctxT + playLen);
            }

            src.start(ctxT, bufStart, playLen);
            sources.push(src);

            if (isLast) break;

            // Advance: next chunk overlaps by cf
            ctxT += step - (first ? (L - bufStart - step) : 0);
            if (first) ctxT = startAt + chunkLen - cf;
            covered += first ? chunkLen - cf : step;
            bufStart = 0;
            first = false;
        }

        return sources;
    };

    // ── Playback ─────────────────────────────────────────────────────────────

    const stopSources = () => {
        sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
        sourcesRef.current = [];
        cancelAnimationFrame(rafRef.current);
    };

    const startPlayback = async (offset: number) => {
        if (!loadedRef.current) await loadFixed();
        const ctx = ctxRef.current!;
        if (ctx.state === 'suspended') await ctx.resume();
        stopSources();
        const startAt = ctx.currentTime + 0.05;
        startTimeRef.current = startAt - offset;
        let ended = false;

        for (const [name, buffer] of Object.entries(bufferRefs.current)) {
            if (loopingKeysRef.current.has(name)) {
                // Looping optional stem: schedule with crossfade
                const loopSrcs = scheduleLooped(ctx, name, startAt, offset, durationRef.current);
                sourcesRef.current.push(...loopSrcs);
            } else {
                // Fixed stem: play once, trigger end when finished
                const src = ctx.createBufferSource();
                src.buffer = buffer;
                src.connect(gainRefs.current[name]);
                src.start(startAt, offset);
                src.onended = () => {
                    if (ended) return; ended = true;
                    sourcesRef.current = [];
                    startOffsetRef.current = 0;
                    setIsPlaying(false); setProgress(0);
                    cancelAnimationFrame(rafRef.current);
                };
                sourcesRef.current.push(src);
            }
        }

        setIsPlaying(true);
        const tick = () => {
            const elapsed = ctx.currentTime - startTimeRef.current;
            setProgress(Math.min(elapsed / durationRef.current, 1));
            if (elapsed < durationRef.current) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    };

    const handlePlay = () => startPlayback(startOffsetRef.current);
    const handlePause = () => {
        if (ctxRef.current) startOffsetRef.current = ctxRef.current.currentTime - startTimeRef.current;
        stopSources(); setIsPlaying(false);
    };
    // During drag: update visual only
    const handleSeekChange = (ratio: number) => {
        startOffsetRef.current = ratio * durationRef.current;
        setProgress(ratio);
    };
    // On release: actually restart playback at new position
    const handleSeekCommit = () => {
        if (isPlaying) startPlayback(startOffsetRef.current);
    };

    useEffect(() => () => { stopSources(); ctxRef.current?.close(); }, []);

    // ── Add optional stem ────────────────────────────────────────────────────

    const addOptionalStem = async (type: 'brainwave' | 'background', value: string) => {
        if (!value) return;
        if (optionalStems.some(s => s.type === type && s.value === value)) return;

        const url = type === 'brainwave'
            ? `${MUSIC_GEN_URL}/api/v1/assets/brainwave/${value}`
            : `${MUSIC_GEN_URL}/api/v1/assets/background/${value}`;

        const label = type === 'brainwave'
            ? (availableBrainwaves.find(b => b.value === value)?.label ?? value)
            : (availableBackgrounds.find(b => b.value === value)?.label ?? value);

        const stemKey = `${type}_${value}`;
        const defaultDb = -15;

        setAddLoading(type);
        setAddError(null);
        try {
            if (!loadedRef.current) await loadFixed();
            const buf = await fetchAndDecode(url);
            connectBuffer(stemKey, buf, defaultDb, true /* loop – don't extend duration */);
            loopingKeysRef.current.add(stemKey);
            setVolumes(prev => ({ ...prev, [stemKey]: defaultDb }));
            setOptionalStems(prev => [...prev, { type, value, label, url }]);

            // If already playing, schedule looping from current position
            if (isPlaying && ctxRef.current) {
                const ctx = ctxRef.current;
                const elapsed = ctx.currentTime - startTimeRef.current;
                const loopSrcs = scheduleLooped(ctx, stemKey, ctx.currentTime, elapsed, durationRef.current);
                sourcesRef.current.push(...loopSrcs);
            }
        } catch (e: any) {
            setAddError(`無法載入 ${label}: ${e.message}`);
        } finally {
            setAddLoading(null);
        }
    };

    const removeOptionalStem = (stemKey: string) => {
        sourcesRef.current = sourcesRef.current.filter(s => {
            if ((s as any)._stemKey === stemKey) {
                try { s.stop(); } catch {}
                return false;
            }
            return true;
        });
        loopingKeysRef.current.delete(stemKey);
        delete gainRefs.current[stemKey];
        delete bufferRefs.current[stemKey];
        setOptionalStems(prev => prev.filter(s => `${s.type}_${s.value}` !== stemKey));
        setVolumes(prev => { const n = { ...prev }; delete n[stemKey]; return n; });
    };

    // ── Render helpers ───────────────────────────────────────────────────────

    const stemLabel = (name: string) =>
        instrumentLabels?.[name] || STEM_DEFAULT_LABELS[name] || name;

    const fmtTime = (secs: number) =>
        `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;

    const SliderRow = ({ stemKey, label, removable }: { stemKey: string; label: string; removable?: boolean }) => {
        const db = volumes[stemKey] ?? 0;
        return (
            <div className="flex items-center gap-3">
                <span className="text-xs w-20 shrink-0 truncate">{label}</span>
                <input
                    type="range" min={DB_MIN} max={DB_MAX} step={0.5} value={db}
                    className="range range-xs flex-1"
                    onChange={e => handleVolumeChange(stemKey, Number(e.target.value))}
                />
                <span className="text-xs w-14 text-right tabular-nums">
                    {db >= 0 ? '+' : ''}{db.toFixed(1)} dB
                </span>
                {removable && (
                    <button
                        className="btn btn-xs btn-circle btn-ghost text-base-content/40"
                        onClick={() => removeOptionalStem(stemKey)}
                        title="移除"
                    >✕</button>
                )}
            </div>
        );
    };

    // ── Build download config ─────────────────────────────────────────────────

    const handleDownload = () => {
        const config: MixDownloadConfig = { volumes };
        const bws = optionalStems.filter(s => s.type === 'brainwave').map(s => s.value);
        const bgs = optionalStems.filter(s => s.type === 'background').map(s => s.value);
        if (bws.length) config.brainwaves = bws;
        if (bgs.length) config.backgrounds = bgs;
        onDownload(config);
    };

    // ── JSX ──────────────────────────────────────────────────────────────────

    return (
        <div className="bg-base-200 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">混音器</p>

            {/* Transport */}
            <div className="flex items-center gap-3">
                <button
                    className="btn btn-sm btn-circle btn-primary"
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={isLoading}
                    title={isPlaying ? '暫停' : '播放'}
                >
                    {isLoading
                        ? <span className="loading loading-spinner loading-xs" />
                        : isPlaying ? '⏸' : '▶'}
                </button>
                <input
                    type="range" min={0} max={1000} step={1}
                    value={Math.round(progress * 1000)}
                    className="range range-xs flex-1 range-primary"
                    onChange={e => handleSeekChange(Number(e.target.value) / 1000)}
                    onPointerUp={handleSeekCommit}
                />
                <span className="text-xs tabular-nums w-10 text-right">
                    {durationRef.current ? fmtTime(progress * durationRef.current) : '--:--'}
                </span>
            </div>

            {loadError && <p className="text-error text-xs">{loadError}</p>}

            {/* Fixed stems */}
            <div className="space-y-2">
                {fixedNames.map(name => (
                    <SliderRow key={name} stemKey={name} label={stemLabel(name)} />
                ))}
            </div>

            {/* Optional stems */}
            {optionalStems.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-base-300">
                    {optionalStems.map(s => {
                        const stemKey = `${s.type}_${s.value}`;
                        return <SliderRow key={stemKey} stemKey={stemKey} label={s.label} removable />;
                    })}
                </div>
            )}

            {addError && <p className="text-error text-xs">{addError}</p>}

            {/* Add controls */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-base-300">
                {/* Brainwave add */}
                {(() => {
                    const addedBw = new Set(optionalStems.filter(s => s.type === 'brainwave').map(s => s.value));
                    const remaining = availableBrainwaves.filter(b => !addedBw.has(b.value));
                    if (remaining.length === 0) return null;
                    return (
                        <div className="flex items-center gap-1">
                            <select
                                className="select select-xs select-bordered"
                                value={brainwavePick}
                                onChange={e => setBrainwavePick(e.target.value)}
                            >
                                {remaining.map(b => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                            <button
                                className="btn btn-xs btn-outline gap-1"
                                onClick={() => addOptionalStem('brainwave', brainwavePick)}
                                disabled={addLoading === 'brainwave'}
                            >
                                {addLoading === 'brainwave'
                                    ? <span className="loading loading-spinner loading-xs" />
                                    : '+'}
                                腦波
                            </button>
                        </div>
                    );
                })()}

                {/* Background add */}
                {(() => {
                    const addedBg = new Set(optionalStems.filter(s => s.type === 'background').map(s => s.value));
                    const remaining = availableBackgrounds.filter(b => !addedBg.has(b.value));
                    if (remaining.length === 0) return null;
                    return (
                        <div className="flex items-center gap-1">
                            <select
                                className="select select-xs select-bordered"
                                value={backgroundPick}
                                onChange={e => setBackgroundPick(e.target.value)}
                            >
                                {remaining.map(b => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                            <button
                                className="btn btn-xs btn-outline gap-1"
                                onClick={() => addOptionalStem('background', backgroundPick)}
                                disabled={addLoading === 'background'}
                            >
                                {addLoading === 'background'
                                    ? <span className="loading loading-spinner loading-xs" />
                                    : '+'}
                                自然音效
                            </button>
                        </div>
                    );
                })()}
            </div>

            <button
                className="btn btn-sm btn-primary w-full"
                onClick={handleDownload}
                disabled={isExporting}
            >
                {isExporting
                    ? <><span className="loading loading-spinner loading-xs" />輸出中...</>
                    : '輸出混音結果'}
            </button>
        </div>
    );
}
