// src/components/MusicReportEditor.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { exportMp3, renderScore, resolveRhythmPreset, ExportState, StemVolumes } from '../services/musicGenService';
import { StemMixer, MixDownloadConfig } from './StemMixer';
import { BEAT_PRESETS, getPresetsForTimeSignature } from '../utils/beatPresets';
import { KEY_CENTERS, MELODY_PATTERNS, GENRES, BRAINWAVE_FREQUENCIES, NATURE_SOUNDS } from '../config/musicCreativeConstants';
import { transposeMusicXML } from '../utils/musicXmlTranspose';

// 可選樂器列表與 MIDI program number 對照 (General MIDI)
const INSTRUMENTS = [
    { value: 'piano', label: '鋼琴', midiProgram: 1 },
    { value: 'guitar', label: '吉他', midiProgram: 25 },
    { value: 'bass', label: '貝斯', midiProgram: 33 },
    { value: 'violin', label: '小提琴', midiProgram: 41 },
    { value: 'flute', label: '長笛', midiProgram: 74 },
    { value: 'saxophone', label: '薩克斯風', midiProgram: 66 },
    { value: 'cello', label: '大提琴', midiProgram: 43 },
    { value: 'electric guitar', label: '電吉他', midiProgram: 28 },
    { value: 'vocals', label: '人聲', midiProgram: 53 },
];

const getInstrumentLabel = (key: string) => {
    const inst = INSTRUMENTS.find(i => i.value === key);
    return inst?.label || key;
};

const getInstrumentMidiProgram = (key: string): number => {
    const inst = INSTRUMENTS.find(i => i.value === key);
    return inst?.midiProgram || 1; // 預設鋼琴
};

// 可以連結的音符類型（八分音符及更短）
const BEAMABLE_TYPES = ['eighth', '16th', '32nd', '64th'];

// 自動添加 beam 連結到 MusicXML
function addAutoBeamToMusicXML(musicXML: string, timeSignature: string = '4/4'): string {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xmlDoc = parser.parseFromString(musicXML, 'text/xml');

    // 解析拍號
    const [beatsPerMeasure] = timeSignature.split('/').map(Number);
    // 根據拍號決定分組：4/4 每 2 拍一組，3/4 每 1 拍一組
    const beatsPerGroup = beatsPerMeasure === 3 ? 1 : 2;

    const parts = xmlDoc.getElementsByTagName('part');

    for (let p = 0; p < parts.length; p++) {
        const part = parts[p];
        const partId = part.getAttribute('id') || '';

        // 跳過打擊樂聲部
        if (partId.toLowerCase().includes('drum')) continue;

        const measures = part.getElementsByTagName('measure');

        for (let m = 0; m < measures.length; m++) {
            const measure = measures[m];
            let divisions = 1;

            // 取得 divisions
            const divisionsElem = measure.getElementsByTagName('divisions')[0];
            if (divisionsElem) {
                divisions = parseInt(divisionsElem.textContent || '1');
            }

            // 計算每組的 duration 單位
            const durationPerBeat = divisions;
            const durationPerGroup = durationPerBeat * beatsPerGroup;

            // 收集小節內的音符
            interface NoteInfo {
                element: Element;
                type: string;
                duration: number;
                positionInMeasure: number;
                isChord: boolean;
                isRest: boolean;
            }

            const notes: NoteInfo[] = [];
            let currentPosition = 0;

            const children = measure.children;
            for (let c = 0; c < children.length; c++) {
                const child = children[c];

                if (child.tagName === 'note') {
                    const typeElem = child.getElementsByTagName('type')[0];
                    const durationElem = child.getElementsByTagName('duration')[0];
                    const isChord = child.getElementsByTagName('chord').length > 0;
                    const isRest = child.getElementsByTagName('rest').length > 0;

                    const noteType = typeElem?.textContent || 'quarter';
                    const duration = durationElem ? parseInt(durationElem.textContent || '1') : divisions;

                    // 移除現有的 beam 元素
                    const existingBeams = child.getElementsByTagName('beam');
                    while (existingBeams.length > 0) {
                        existingBeams[0].parentNode?.removeChild(existingBeams[0]);
                    }

                    notes.push({
                        element: child,
                        type: noteType,
                        duration,
                        positionInMeasure: isChord ? currentPosition : currentPosition,
                        isChord,
                        isRest,
                    });

                    if (!isChord) {
                        currentPosition += duration;
                    }
                } else if (child.tagName === 'forward') {
                    const durationElem = child.getElementsByTagName('duration')[0];
                    if (durationElem) {
                        currentPosition += parseInt(durationElem.textContent || '0');
                    }
                } else if (child.tagName === 'backup') {
                    const durationElem = child.getElementsByTagName('duration')[0];
                    if (durationElem) {
                        currentPosition -= parseInt(durationElem.textContent || '0');
                    }
                }
            }

            // 將音符按群組分類並添加 beam
            const beamableNotes = notes.filter(n =>
                !n.isRest && BEAMABLE_TYPES.includes(n.type)
            );

            // 按位置分組
            const groups: NoteInfo[][] = [];
            let currentGroup: NoteInfo[] = [];
            let currentGroupStart = 0;

            for (const note of beamableNotes) {
                const noteGroup = Math.floor(note.positionInMeasure / durationPerGroup);

                if (currentGroup.length === 0) {
                    currentGroupStart = noteGroup;
                    currentGroup.push(note);
                } else if (noteGroup === currentGroupStart) {
                    currentGroup.push(note);
                } else {
                    if (currentGroup.length > 1) {
                        groups.push(currentGroup);
                    }
                    currentGroup = [note];
                    currentGroupStart = noteGroup;
                }
            }

            if (currentGroup.length > 1) {
                groups.push(currentGroup);
            }

            // 為每個群組添加 beam
            for (const group of groups) {
                for (let i = 0; i < group.length; i++) {
                    const note = group[i];
                    const beamElem = xmlDoc.createElement('beam');
                    beamElem.setAttribute('number', '1');

                    if (i === 0) {
                        beamElem.textContent = 'begin';
                    } else if (i === group.length - 1) {
                        beamElem.textContent = 'end';
                    } else {
                        beamElem.textContent = 'continue';
                    }

                    // 找到 stem 元素後插入，或者在 type 後插入
                    const stemElem = note.element.getElementsByTagName('stem')[0];
                    const typeElem = note.element.getElementsByTagName('type')[0];

                    if (stemElem) {
                        stemElem.parentNode?.insertBefore(beamElem, stemElem.nextSibling);
                    } else if (typeElem) {
                        typeElem.parentNode?.insertBefore(beamElem, typeElem.nextSibling);
                    } else {
                        note.element.appendChild(beamElem);
                    }
                }
            }
        }
    }

    return serializer.serializeToString(xmlDoc);
}

export interface MusicReportParams {
    title?: string;
    bpm?: number;
    time_signature?: string;
    p1?: string;
    p2?: string;
    p3?: string;
    p1_volume?: number; // 0-100
    p2_volume?: number;
    p3_volume?: number;
    drum_volume?: number;
    beat?: string; // 節奏預設 ID
    auto_beam?: boolean; // 自動連結音符
    // 創意平台欄位（顯示用，不可編輯）
    musicType?: string;
    recordingTime?: number;
    keyCenter?: string;
    keyType?: string;
    melodyPattern?: number;
    genre?: string;
    brainwaveFrequency?: number | null;
    natureSound?: string;
}

interface MusicReportEditorProps {
    musicXML: string;
    initialParams: MusicReportParams;
    onParamsChange?: (params: MusicReportParams) => void;
    brainData?: { before: any; after: any };
}

// 套用參數到 MusicXML
function applyParamsToMusicXML(musicXML: string, params: MusicReportParams): string {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xmlDoc = parser.parseFromString(musicXML, 'text/xml');

    // 更新標題
    if (params.title) {
        const titleElems = xmlDoc.getElementsByTagName('movement-title');
        if (titleElems.length > 0) {
            titleElems[0].textContent = params.title;
        }
    }

    // 更新 BPM
    if (params.bpm && params.bpm > 0) {
        const perMinuteElems = xmlDoc.getElementsByTagName('per-minute');
        if (perMinuteElems.length > 0) {
            perMinuteElems[0].textContent = params.bpm.toString();
        }
        const soundElems = xmlDoc.getElementsByTagName('sound');
        if (soundElems.length > 0) {
            soundElems[0].setAttribute('tempo', params.bpm.toString());
        }
    }

    // 更新拍號
    if (params.time_signature) {
        const [beats, beatType] = params.time_signature.split('/');
        const beatsElems = xmlDoc.getElementsByTagName('beats');
        const beatTypeElems = xmlDoc.getElementsByTagName('beat-type');
        if (beatsElems.length > 0 && beats) {
            beatsElems[0].textContent = beats;
        }
        if (beatTypeElems.length > 0 && beatType) {
            beatTypeElems[0].textContent = beatType;
        }
    }

    // 更新樂器 MIDI program (影響播放音色) 和音量
    const instrumentParams = [params.p1, params.p2, params.p3];
    const volumeParams = [params.p1_volume ?? 80, params.p2_volume ?? 80, params.p3_volume ?? 80];
    const scoreParts = xmlDoc.getElementsByTagName('score-part');

    for (let i = 0; i < scoreParts.length && i < instrumentParams.length; i++) {
        const instrument = instrumentParams[i];
        const volume = volumeParams[i];
        const scorePart = scoreParts[i];

        if (instrument) {
            const midiPrograms = scorePart.getElementsByTagName('midi-program');
            if (midiPrograms.length > 0) {
                midiPrograms[0].textContent = getInstrumentMidiProgram(instrument).toString();
            }
            // 更新樂器名稱（第一行顯示）
            const partNames = scorePart.getElementsByTagName('part-name');
            if (partNames.length > 0) {
                partNames[0].textContent = getInstrumentLabel(instrument);
            }
            // 更新樂器縮寫（後續行顯示）
            const partAbbrevs = scorePart.getElementsByTagName('part-abbreviation');
            if (partAbbrevs.length > 0) {
                partAbbrevs[0].textContent = getInstrumentLabel(instrument);
            }
            // 更新 instrument-name（某些軟體使用）
            const instrumentNames = scorePart.getElementsByTagName('instrument-name');
            if (instrumentNames.length > 0) {
                instrumentNames[0].textContent = getInstrumentLabel(instrument);
            }
        }

        // 更新音量（midi-volume 0-127 對應 0-100）
        const midiVolume = Math.round((volume / 100) * 127);
        const midiInstruments = scorePart.getElementsByTagName('midi-instrument');
        if (midiInstruments.length > 0) {
            const midiInstrument = midiInstruments[0];
            let volumeElem = midiInstrument.getElementsByTagName('volume')[0];
            if (!volumeElem) {
                volumeElem = xmlDoc.createElement('volume');
                midiInstrument.appendChild(volumeElem);
            }
            volumeElem.textContent = midiVolume.toString();
        }
    }

    // ── 音中心轉調 ────────────────────────────────────────
    if (params.keyCenter && params.keyType) {
        transposeMusicXML(xmlDoc, params.keyCenter, params.keyType);
    }

    return serializer.serializeToString(xmlDoc);
}

const MusicReportEditor: React.FC<MusicReportEditorProps> = ({
    musicXML,
    initialParams,
    onParamsChange,
    brainData,
}) => {
    // 當前生效的參數
    const [appliedParams, setAppliedParams] = useState<MusicReportParams>(initialParams);
    // 編輯中的參數
    const [editParams, setEditParams] = useState<MusicReportParams>(initialParams);
    // 是否處於編輯模式
    const [isEditing, setIsEditing] = useState(false);
    // 匯出 MP3 狀態
    const [exportState, setExportState] = useState<ExportState>({ status: 'idle' });
    const [stemVolumes, setStemVolumes] = useState<StemVolumes>({});
    // 樂譜 Modal
    const [scoreOpen, setScoreOpen] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    // 伺服器端樂譜渲染（Verovio SVG）
    const [scorePages, setScorePages]   = useState<string[] | null>(null);
    const [scoreLoading, setScoreLoading] = useState(false);
    const scoreAbortRef = useRef<AbortController | null>(null);

    // 工具列音訊播放（MP3）
    const audioRef        = useRef<HTMLAudioElement>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // 是否需要等 MP3（有腦波資料 + music-gen 啟用時才等）
    const canGenerateMp3 = !!brainData;
    // Ready = 樂譜已渲染，且（不需要 MP3，或 MP3 已完成且 URL 存在）
    // failed 不算 ready，避免點播放後重新觸發生成使畫面倒退回 loading
    const isReady = !!scorePages && (
        !canGenerateMp3 ||
        (exportState.status === 'completed' && !!exportState.downloadUrl)
    );

    // 自動開始 MP3 生成（只觸發一次）
    const mp3AutoStarted = useRef(false);

    // 計算處理後的 MusicXML（僅旋律聲部；鼓聲部由伺服器端在 render-score 時注入）
    const processedXML = useMemo(() => {
        let xml = applyParamsToMusicXML(musicXML, appliedParams);
        // 自動連結音符（八分音符及更短）
        if (appliedParams.auto_beam) {
            xml = addAutoBeamToMusicXML(xml, appliedParams.time_signature || '4/4');
        }
        return xml;
    }, [musicXML, appliedParams]);

    // 伺服器端渲染樂譜：processedXML 改變後 800ms 才送出請求（debounce）
    useEffect(() => {
        scoreAbortRef.current?.abort();
        const controller = new AbortController();
        scoreAbortRef.current = controller;

        setScoreLoading(true);
        const timer = setTimeout(async () => {
            try {
                const beatPreset = resolveRhythmPreset(appliedParams.beat, appliedParams.time_signature || '4/4');
                const pages = await renderScore(processedXML, { pageWidth: 2800, beatPreset, measuresPerSystem: 3 }, controller.signal);
                setScorePages(pages);
            } catch (err: any) {
                if (err?.name !== 'AbortError') {
                    setScorePages(null);
                }
            } finally {
                if (!controller.signal.aborted) setScoreLoading(false);
            }
        }, 800);

        return () => {
            clearTimeout(timer);
            controller.abort();
            setScoreLoading(false);
        };
    }, [processedXML]);

    // stable ref so handleToolbarPlay doesn't depend on handleExportMp3 declaration order
    const exportMp3Ref = useRef<((config?: MixDownloadConfig) => void) | null>(null);

    // 工具列：播放 MP3
    // isReady 保證 downloadUrl 已存在，直接呼叫 play()（在用戶手勢 call stack 內）
    const handleToolbarPlay = useCallback(() => {
        audioRef.current?.play().catch(() => {/* browser blocked — unlikely in user-gesture context */});
    }, []);

    // 工具列：停止播放
    const handleToolbarStop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    // 工具列：下載 MusicXML
    const downloadXml = useCallback(() => {
        const blob = new Blob([processedXML], { type: 'application/xml' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${appliedParams.title || 'music'}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    }, [processedXML, appliedParams.title]);

    // 工具列：列印 Verovio SVG 頁面
    const printSvgScore = useCallback(() => {
        if (!scorePages?.length) return;
        const win = window.open('', '_blank', 'width=800,height=600');
        if (!win) return;
        const svgContent = scorePages.map(svg => `<div style="margin-bottom:8px">${svg}</div>`).join('');
        win.document.write(`<!DOCTYPE html><html><head>
            <meta charset="UTF-8"><title>${appliedParams.title || 'music'}</title>
            <style>
                @page { size:A4; margin:15mm }
                body { margin:0; padding:10mm; background:white }
                svg { width:100% !important; height:auto !important; display:block }
                @media print { body { padding:0 } }
            </style></head><body>${svgContent}
            <script>window.onload=function(){setTimeout(function(){window.print();window.close();},400)}<\/script>
        </body></html>`);
        win.document.close();
    }, [scorePages, appliedParams.title]);

    // 根據拍號過濾可用的節奏預設
    const availableBeatPresets = useMemo(() => {
        return getPresetsForTimeSignature(editParams.time_signature || '4/4');
    }, [editParams.time_signature]);

    // 取得節奏預設名稱
    const getBeatPresetName = (beatId: string | undefined) => {
        if (!beatId || beatId === 'none') return '無';
        const preset = BEAT_PRESETS.find(b => b.id === beatId);
        return preset ? preset.name : '無';
    };

    // 處理參數變更
    const handleParamChange = useCallback((field: keyof MusicReportParams, value: string | number | boolean) => {
        setEditParams(prev => ({ ...prev, [field]: value }));
    }, []);

    // 套用變更
    const handleApply = useCallback(() => {
        setAppliedParams(editParams);
        setIsEditing(false);
        onParamsChange?.(editParams);
    }, [editParams, onParamsChange]);

    // 取消編輯
    const handleCancel = useCallback(() => {
        setEditParams(appliedParams);
        setIsEditing(false);
    }, [appliedParams]);

    // 進入編輯模式
    const handleStartEdit = useCallback(() => {
        setEditParams(appliedParams);
        setIsEditing(true);
    }, [appliedParams]);

    // 匯出高品質 MP3（可傳入混音器設定，用於「套用並重新下載」）
    const handleExportMp3 = useCallback(async (mixConfig?: MixDownloadConfig) => {
        if (!brainData) return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const volumes = mixConfig?.volumes;
        if (volumes) setStemVolumes(volumes as StemVolumes);
        try {
            await exportMp3(
                {
                    title:               appliedParams.title,
                    bpm:                 appliedParams.bpm,
                    time_signature:      appliedParams.time_signature,
                    p1:                  appliedParams.p1,
                    p2:                  appliedParams.p2,
                    p3:                  appliedParams.p3,
                    beat:                appliedParams.beat,
                    beforeBrainData:     brainData.before,
                    afterBrainData:      brainData.after,
                    musicType:           appliedParams.musicType,
                    recordingTime:       appliedParams.recordingTime,
                    keyCenter:           appliedParams.keyCenter,
                    keyType:             appliedParams.keyType,
                    melodyPattern:       appliedParams.melodyPattern,
                    genre:               appliedParams.genre,
                    // Mixer selection overrides applied params for brainwave/background (use first selected)
                    brainwaveFrequency:  mixConfig?.brainwaves?.length
                        ? Number(mixConfig.brainwaves[0])
                        : appliedParams.brainwaveFrequency,
                    natureSound:         mixConfig?.backgrounds?.[0] ?? appliedParams.natureSound,
                    stemVolumes:         (volumes ?? stemVolumes) as StemVolumes,
                },
                setExportState,
                controller.signal,
            );
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                setExportState({ status: 'failed', error: err?.message || '匯出失敗' });
            }
        }
    }, [brainData, appliedParams, stemVolumes]);

    // keep stable ref in sync so handleToolbarPlay can call it without ordering issues
    exportMp3Ref.current = handleExportMp3;

    // 自動觸發 MP3 生成（mount 後只執行一次）
    useEffect(() => {
        if (!canGenerateMp3 || mp3AutoStarted.current) return;
        mp3AutoStarted.current = true;
        handleExportMp3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canGenerateMp3]);

    const renderInstrumentSelect = (field: 'p1' | 'p2' | 'p3', label: string) => (
        <div className="form-control">
            <label className="label py-1">
                <span className="label-text text-xs">{label}</span>
            </label>
            <select
                className="select select-bordered select-sm w-full"
                value={editParams[field] ?? (field === 'p1' ? 'flute' : field === 'p2' ? 'piano' : 'cello')}
                onChange={(e) => handleParamChange(field, e.target.value)}
            >
                {INSTRUMENTS.map((inst) => (
                    <option key={inst.value} value={inst.value}>
                        {inst.label}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="p-4">
            {/* 設定資訊區塊 */}
            <div className="mb-6 p-4 bg-base-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">樂譜設定</h3>
                    {!isEditing && (
                        <button
                            onClick={handleStartEdit}
                            className="btn btn-ghost btn-sm gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            編輯設定
                        </button>
                    )}
                </div>

                {isEditing ? (
                    /* 編輯模式 */
                    <div className="space-y-4">
                        {/* 基本設定 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-xs">樂譜標題</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered input-sm w-full"
                                    placeholder="未命名的樂譜"
                                    value={editParams.title ?? ''}
                                    onChange={(e) => handleParamChange('title', e.target.value)}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-xs">速度 (BPM)</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered input-sm w-full"
                                    placeholder="60"
                                    min={40}
                                    max={200}
                                    value={editParams.bpm ?? 60}
                                    onChange={(e) => handleParamChange('bpm', parseInt(e.target.value) || 60)}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-xs">拍號</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm w-full"
                                    value={editParams.time_signature ?? '4/4'}
                                    onChange={(e) => handleParamChange('time_signature', e.target.value)}
                                >
                                    <option value="2/4">2/4</option>
                                    <option value="3/4">3/4</option>
                                    <option value="3/8">3/8</option>
                                    <option value="4/4">4/4</option>
                                    <option value="4/8">4/8</option>
                                    <option value="6/8">6/8</option>
                                    <option value="8/16">8/16</option>
                                    <option value="12/16">12/16</option>
                                </select>
                            </div>
                        </div>

                        <div className="divider my-2 text-xs text-base-content/50">樂器設定</div>

                        {/* 樂器設定 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {renderInstrumentSelect('p1', '高音域樂器 (P1)')}
                            {renderInstrumentSelect('p2', '中音域樂器 (P2)')}
                            {renderInstrumentSelect('p3', '低音域樂器 (P3)')}
                        </div>

                        {/* 音量設定 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                            <div className="form-control">
                                <label className="label py-0">
                                    <span className="label-text text-xs">P1 音量</span>
                                    <span className="label-text-alt text-xs">{editParams.p1_volume ?? 80}%</span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={editParams.p1_volume ?? 80}
                                    onChange={(e) => handleParamChange('p1_volume', parseInt(e.target.value))}
                                    className="range range-xs range-primary"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label py-0">
                                    <span className="label-text text-xs">P2 音量</span>
                                    <span className="label-text-alt text-xs">{editParams.p2_volume ?? 80}%</span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={editParams.p2_volume ?? 80}
                                    onChange={(e) => handleParamChange('p2_volume', parseInt(e.target.value))}
                                    className="range range-xs range-primary"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label py-0">
                                    <span className="label-text text-xs">P3 音量</span>
                                    <span className="label-text-alt text-xs">{editParams.p3_volume ?? 80}%</span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={editParams.p3_volume ?? 80}
                                    onChange={(e) => handleParamChange('p3_volume', parseInt(e.target.value))}
                                    className="range range-xs range-primary"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label py-0">
                                    <span className="label-text text-xs">鼓聲音量</span>
                                    <span className="label-text-alt text-xs">{editParams.drum_volume ?? 80}%</span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={editParams.drum_volume ?? 80}
                                    onChange={(e) => handleParamChange('drum_volume', parseInt(e.target.value))}
                                    className="range range-xs range-secondary"
                                />
                            </div>
                        </div>

                        <div className="divider my-2 text-xs text-base-content/50">節奏設定</div>

                        {/* 節奏預設 */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-xs">節奏風格</span>
                            </label>
                            <select
                                className="select select-bordered select-sm w-full md:w-1/3"
                                value={editParams.beat ?? 'none'}
                                onChange={(e) => handleParamChange('beat', e.target.value)}
                            >
                                {availableBeatPresets.map((preset) => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.name} {preset.id !== 'none' && `(${preset.nameEn})`}
                                    </option>
                                ))}
                            </select>
                            {editParams.beat && editParams.beat !== 'none' && (
                                <label className="label py-1">
                                    <span className="label-text-alt text-base-content/50">
                                        {BEAT_PRESETS.find(b => b.id === editParams.beat)?.description}
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="divider my-2 text-xs text-base-content/50">顯示設定</div>

                        {/* 自動連結音符 */}
                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3 py-1">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-primary"
                                    checked={editParams.auto_beam ?? false}
                                    onChange={(e) => handleParamChange('auto_beam', e.target.checked)}
                                />
                                <span className="label-text">自動連結音符</span>
                                <span className="label-text-alt text-base-content/50">（八分音符及更短的音符會自動以橫線連結）</span>
                            </label>
                        </div>

                        {/* 按鈕 */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleCancel} className="btn btn-ghost btn-sm">
                                取消
                            </button>
                            <button onClick={handleApply} className="btn btn-primary btn-sm">
                                確認套用
                            </button>
                        </div>
                    </div>
                ) : (
                    /* 顯示模式 */
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-base-content/60">標題：</span>
                                <span className="font-medium">{appliedParams.title || '未命名的樂譜'}</span>
                            </div>
                            <div>
                                <span className="text-base-content/60">速度：</span>
                                <span className="font-medium">{appliedParams.bpm || 60} BPM</span>
                            </div>
                            <div>
                                <span className="text-base-content/60">拍號：</span>
                                <span className="font-medium">{appliedParams.time_signature || '4/4'}</span>
                            </div>
                        </div>
                        {/* 創意平台參數（僅在有相關參數時顯示） */}
                        {appliedParams.musicType && (
                            <>
                                <div className="divider my-3 text-xs text-base-content/50">創意平台參數</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-base-content/60">音樂類型：</span>
                                        <span className="font-medium">
                                            {appliedParams.musicType === 'emotion' ? '情緒音樂' : '心靈音樂'}
                                        </span>
                                    </div>
                                    {appliedParams.recordingTime != null && (
                                        <div>
                                            <span className="text-base-content/60">紀錄時間：</span>
                                            <span className="font-medium">{appliedParams.recordingTime} 分鐘</span>
                                        </div>
                                    )}
                                    {appliedParams.keyCenter && (
                                        <div>
                                            <span className="text-base-content/60">音中心：</span>
                                            <span className="font-medium">
                                                {(() => {
                                                    const isMinor = appliedParams.keyType === 'minor';
                                                    const keys = isMinor ? KEY_CENTERS.minor : KEY_CENTERS.major;
                                                    const found = [...keys].find(k => k.value === appliedParams.keyCenter);
                                                    return found?.label || `${appliedParams.keyCenter} ${isMinor ? '小調' : '大調'}`;
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    {appliedParams.melodyPattern != null && (
                                        <div>
                                            <span className="text-base-content/60">主旋律：</span>
                                            <span className="font-medium">
                                                {(() => {
                                                    const pattern = MELODY_PATTERNS.find(m => m.id === appliedParams.melodyPattern);
                                                    return pattern
                                                        ? `主旋律 ${pattern.id}（${pattern.timeSignature}）`
                                                        : `主旋律 ${appliedParams.melodyPattern}`;
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    {appliedParams.genre && (
                                        <div>
                                            <span className="text-base-content/60">曲風：</span>
                                            <span className="font-medium">
                                                {(() => {
                                                    const g = GENRES.find(g => g.id === appliedParams.genre);
                                                    return g ? `${g.nameZh}（${g.nameEn}）` : appliedParams.genre;
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-base-content/60">腦波背景頻率：</span>
                                        <span className="font-medium">
                                            {(() => {
                                                if (appliedParams.brainwaveFrequency == null) return '不使用';
                                                const bf = BRAINWAVE_FREQUENCIES.find(b => b.value === appliedParams.brainwaveFrequency);
                                                return bf ? `${bf.label}（${bf.description}）` : `${appliedParams.brainwaveFrequency} Hz`;
                                            })()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-base-content/60">自然音效：</span>
                                        <span className="font-medium">
                                            {(() => {
                                                if (!appliedParams.natureSound) return '不使用';
                                                const ns = NATURE_SOUNDS.find(n => n.value === appliedParams.natureSound);
                                                return ns?.label || appliedParams.natureSound;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="divider my-3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-base-content/60">樂器：</span>
                                <span className="font-medium ml-2">
                                    {getInstrumentLabel(appliedParams.p1 || 'flute')} / {getInstrumentLabel(appliedParams.p2 || 'piano')} / {getInstrumentLabel(appliedParams.p3 || 'cello')}
                                </span>
                            </div>
                            <div>
                                <span className="text-base-content/60">節奏：</span>
                                <span className="font-medium ml-2">
                                    {getBeatPresetName(appliedParams.beat)}
                                </span>
                            </div>
                            <div>
                                <span className="text-base-content/60">自動連結：</span>
                                <span className="font-medium ml-2">
                                    {appliedParams.auto_beam ? '開啟' : '關閉'}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 樂譜顯示 */}
            <div className="w-full border border-base-300 rounded-lg bg-white">
                {/* ── 統一 Loading 畫面：樂譜和 MP3 都就緒前顯示 ── */}
                {!isReady && (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-base-content/60">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <div className="flex flex-col items-center gap-1 text-sm">
                            <div className="flex items-center gap-2">
                                {scorePages
                                    ? <span className="text-success">✓ 樂譜已渲染</span>
                                    : <><span className="loading loading-dots loading-xs"></span><span>渲染樂譜中…</span></>
                                }
                            </div>
                            {canGenerateMp3 && (
                                <div className="flex items-center gap-2">
                                    {exportState.status === 'completed'
                                        ? <span className="text-success">✓ MP3 已合成</span>
                                        : exportState.status === 'failed'
                                            ? <>
                                                <span className="text-error">✗ MP3 合成失敗：{exportState.error}</span>
                                                <button className="btn btn-outline btn-error btn-xs"
                                                    onClick={() => { mp3AutoStarted.current = false; setExportState({ status: 'idle' }); }}>
                                                    重試
                                                </button>
                                              </>
                                            : <><span className="loading loading-dots loading-xs"></span>
                                              <span>{exportState.status === 'pending' ? '建立合成任務…' : '合成 MP3 中（約 30–60 秒）…'}</span></>
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* ── 就緒後顯示完整內容 ── */}
                {isReady && (<div className="w-full">
                    {/* 工具列 */}
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-base-300 bg-base-100">
                        {/* 播放 / 暫停（isReady 保證 MP3 已就緒） */}
                        {!isAudioPlaying ? (
                            <button
                                className="btn btn-primary btn-sm gap-1"
                                onClick={handleToolbarPlay}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                                播放
                            </button>
                        ) : (
                            <button className="btn btn-secondary btn-sm gap-1" onClick={() => audioRef.current?.pause()}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" /></svg>暫停
                            </button>
                        )}
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleToolbarStop}
                            disabled={!isAudioPlaying}
                            title="停止"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" /></svg>
                        </button>

                        <div className="divider divider-horizontal mx-0"></div>

                        {/* XML 下載 */}
                        <button className="btn btn-outline btn-sm gap-1" onClick={downloadXml} title="下載 MusicXML">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            XML
                        </button>

                        {/* 音樂下載（MP3） */}
                        {exportState.downloadUrl ? (
                            <a href={exportState.downloadUrl} download className="btn btn-outline btn-sm gap-1" title="下載 MP3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
                                音樂下載
                            </a>
                        ) : (
                            <button
                                className="btn btn-outline btn-sm gap-1"
                                onClick={() => handleExportMp3()}
                                disabled={!brainData || exportState.status === 'pending' || exportState.status === 'processing'}
                                title={brainData ? '生成並下載 MP3' : '需要腦波資料才能生成 MP3'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
                                音樂下載
                            </button>
                        )}

                        {/* 查看樂譜 */}
                        <button className="btn btn-outline btn-sm gap-1" onClick={() => setScoreOpen(true)} disabled={!scorePages?.length} title="查看樂譜">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" /></svg>
                            查看樂譜
                        </button>

                        {/* 列印 */}
                        <button className="btn btn-outline btn-sm gap-1" onClick={printSvgScore} disabled={!scorePages?.length} title="列印樂譜">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
                            列印
                        </button>

                        {/* 狀態 */}
                        <span className="text-xs text-base-content/50 ml-auto">
                            {scoreLoading ? '渲染中…' : exportState.status === 'completed' ? '✓ MP3 已就緒' : ''}
                        </span>
                    </div>

                    {/* 隱藏 audio 元素 */}
                    <audio
                        ref={audioRef}
                        src={exportState.downloadUrl || undefined}
                        preload="auto"
                        onPlay={() => setIsAudioPlaying(true)}
                        onPause={() => setIsAudioPlaying(false)}
                        onEnded={() => setIsAudioPlaying(false)}
                    />

                </div>)}

            {/* 樂譜 Modal */}
            {scoreOpen && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-5xl flex flex-col" style={{ maxHeight: '90vh' }}>
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h3 className="font-bold text-base">{appliedParams.title || '樂譜'}</h3>
                            <div className="flex items-center gap-2">
                                <button className="btn btn-outline btn-xs gap-1" onClick={printSvgScore}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
                                    列印
                                </button>
                                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setScoreOpen(false)}>✕</button>
                            </div>
                        </div>
                        <div className="overflow-y-auto overflow-x-auto flex-1">
                            <style>{`
                                .verovio-score svg {
                                    width: 100% !important;
                                    height: auto !important;
                                    display: block;
                                }
                            `}</style>
                            {scorePages?.map((svg, i) => (
                                <div key={i} className="verovio-score w-full"
                                     dangerouslySetInnerHTML={{ __html: svg }} />
                            ))}
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setScoreOpen(false)} />
                </div>
            )}
                </div>

            {/* 混音器（生成完成後顯示） */}
            {exportState.status === 'completed' && exportState.stemUrls && (
                <div className="mt-3 px-1">
                    <StemMixer
                        stemUrls={exportState.stemUrls}
                        instrumentLabels={{
                            p1: getInstrumentLabel(appliedParams.p1 ?? 'piano'),
                            p2: getInstrumentLabel(appliedParams.p2 ?? 'piano'),
                            p3: getInstrumentLabel(appliedParams.p3 ?? 'cello'),
                        }}
                        defaultVolumes={stemVolumes}
                        availableBrainwaves={BRAINWAVE_FREQUENCIES.map(b => ({
                            value: String(b.value),
                            label: `${b.label} ${b.description}`,
                        }))}
                        availableBackgrounds={NATURE_SOUNDS.map(n => ({
                            value: n.value,
                            label: n.label,
                        }))}
                        onDownload={config => {
                            mp3AutoStarted.current = false;
                            setExportState({ status: 'idle' });
                            handleExportMp3(config);
                        }}
                    />
                </div>
            )}

            {/* 重新生成按鈕（就緒後顯示在底部） */}
            {isReady && canGenerateMp3 && (
                <div className="mt-2 flex justify-end px-1">
                    <button
                        className="btn btn-ghost btn-xs text-base-content/40"
                        onClick={() => {
                            mp3AutoStarted.current = false;
                            setExportState({ status: 'idle' });
                            setScorePages(null);
                        }}
                    >
                        重新生成
                    </button>
                </div>
            )}

            {/* 提示資訊 */}
            <div className="mt-4 p-3 bg-base-200 rounded-lg text-sm text-text-secondary">
                <p>
                    <strong>提示：</strong>如需完整的播放體驗，建議下載{' '}
                    <a
                        href="https://musescore.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                    >
                        MuseScore
                    </a>
                    {' '}等樂譜軟體，匯入上方下載的 MusicXML 檔案，即可獲得更佳的樂譜編輯與播放功能。
                </p>
            </div>
        </div>
    );
};

export default MusicReportEditor;
