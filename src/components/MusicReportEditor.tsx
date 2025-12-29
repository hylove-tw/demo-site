// src/components/MusicReportEditor.tsx
import React, { useState, useCallback, useMemo } from 'react';
import MusicEmbed from './MusicEmbed';
import { BEAT_PRESETS, getPresetsForTimeSignature, injectDrumPartToMusicXML, convertPresetToDrumLooperPattern } from '../utils/beatPresets';

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
}

interface MusicReportEditorProps {
    musicXML: string;
    initialParams: MusicReportParams;
    onParamsChange?: (params: MusicReportParams) => void;
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

    return serializer.serializeToString(xmlDoc);
}

const MusicReportEditor: React.FC<MusicReportEditorProps> = ({
    musicXML,
    initialParams,
    onParamsChange,
}) => {
    // 當前生效的參數
    const [appliedParams, setAppliedParams] = useState<MusicReportParams>(initialParams);
    // 編輯中的參數
    const [editParams, setEditParams] = useState<MusicReportParams>(initialParams);
    // 是否處於編輯模式
    const [isEditing, setIsEditing] = useState(false);

    // 計算處理後的 MusicXML
    const processedXML = useMemo(() => {
        let xml = applyParamsToMusicXML(musicXML, appliedParams);
        // 注入節奏聲部（僅用於顯示樂譜，播放由 DrumLooper 處理）
        if (appliedParams.beat && appliedParams.beat !== 'none') {
            const beatPreset = BEAT_PRESETS.find(b => b.id === appliedParams.beat);
            if (beatPreset) {
                const drumVolume = appliedParams.drum_volume ?? 80;
                xml = injectDrumPartToMusicXML(xml, beatPreset, drumVolume);
            }
        }
        // 自動連結音符（八分音符及更短）
        if (appliedParams.auto_beam) {
            xml = addAutoBeamToMusicXML(xml, appliedParams.time_signature || '4/4');
        }
        return xml;
    }, [musicXML, appliedParams]);

    // 計算 DrumLooper 用的節奏模式（循環播放，更省記憶體）
    const drumPattern = useMemo(() => {
        if (!appliedParams.beat || appliedParams.beat === 'none') {
            return undefined;
        }
        const beatPreset = BEAT_PRESETS.find(b => b.id === appliedParams.beat);
        if (!beatPreset) return undefined;

        const bpm = appliedParams.bpm || 60;
        return convertPresetToDrumLooperPattern(beatPreset, bpm);
    }, [appliedParams.beat, appliedParams.bpm]);

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
                                    <option value="4/4">4/4</option>
                                    <option value="6/8">6/8</option>
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
            <MusicEmbed musicXML={processedXML} height="500px" drumPattern={drumPattern || undefined} />

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
