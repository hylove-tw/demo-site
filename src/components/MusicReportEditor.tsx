// src/components/MusicReportEditor.tsx
import React, { useState, useCallback, useMemo } from 'react';
import MusicEmbed from './MusicEmbed';
import { BEAT_PRESETS, getPresetsForTimeSignature, injectDrumPartToMusicXML } from '../utils/beatPresets';

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

export interface MusicReportParams {
    title?: string;
    bpm?: number;
    time_signature?: string;
    p1?: string;
    p2?: string;
    p3?: string;
    beat?: string; // 節奏預設 ID
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

    // 更新樂器 MIDI program (影響播放音色)
    const instrumentParams = [params.p1, params.p2, params.p3];
    const scoreParts = xmlDoc.getElementsByTagName('score-part');

    for (let i = 0; i < scoreParts.length && i < instrumentParams.length; i++) {
        const instrument = instrumentParams[i];
        if (instrument) {
            const scorePart = scoreParts[i];
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
        // 注入節奏聲部
        if (appliedParams.beat && appliedParams.beat !== 'none') {
            const beatPreset = BEAT_PRESETS.find(b => b.id === appliedParams.beat);
            if (beatPreset) {
                xml = injectDrumPartToMusicXML(xml, beatPreset);
            }
        }
        return xml;
    }, [musicXML, appliedParams]);

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
    const handleParamChange = useCallback((field: keyof MusicReportParams, value: string | number) => {
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                        </div>
                    </>
                )}
            </div>

            {/* 樂譜顯示 */}
            <MusicEmbed musicXML={processedXML} height="500px" />

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
