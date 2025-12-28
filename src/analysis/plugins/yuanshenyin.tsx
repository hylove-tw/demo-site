import React from 'react';
import { registerPlugin, AnalysisPlugin } from '../registry';
import { musicAnalysis } from '../../config/analysisMethods';
import { renderBrainWaveMusicReport } from '../../config/analysisRenderers';

// 可選樂器列表
const INSTRUMENTS = [
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

const plugin: AnalysisPlugin = {
  id: 'yuanshenyin',
  group: '主要功能',
  name: '元神音',
  shortDescription: '腦波影音編碼系統，將個人腦波轉換為獨特的心靈音樂五線譜',
  description: '腦波影音編碼及播放系統，將個人腦波數據轉換為獨特的音樂旋律，透過前測（正常睜眼）與後測（正念閉眼）的腦波特徵，編碼生成專屬的心靈音樂五線譜並播放。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: musicAnalysis,
  renderReport: renderBrainWaveMusicReport,
  customFields: [
    { label: '樂譜標題', fieldName: 'title', type: 'string', defaultValue: '未命名的樂譜' },
    { label: '速度 (BPM)', fieldName: 'bpm', type: 'number', defaultValue: 60 },
    { label: '拍號', fieldName: 'time_signature', type: 'string', defaultValue: '4/4' },
    { label: '高音域樂器', fieldName: 'p1', type: 'string', defaultValue: 'flute' },
    { label: '中音域樂器', fieldName: 'p2', type: 'string', defaultValue: 'piano' },
    { label: '低音域樂器', fieldName: 'p3', type: 'string', defaultValue: 'cello' },
  ],
  editComponent: ({ customParams, onChange }) => {
    const handleChange = (field: string, value: string | number) => {
      onChange({ ...customParams, [field]: value });
    };

    const getDefaultInstrument = (field: string) => {
      const defaults: Record<string, string> = { p1: 'flute', p2: 'piano', p3: 'cello' };
      return defaults[field] || 'piano';
    };

    const renderInstrumentSelect = (field: string, label: string) => (
      <div className="form-control form-control-minimal">
        <label className="label label-minimal">
          <span className="label-text">{label}</span>
        </label>
        <select
          className="select select-underline w-full"
          value={customParams[field] ?? getDefaultInstrument(field)}
          onChange={(e) => handleChange(field, e.target.value)}
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
      <div className="space-y-6 p-4 border border-base-300 rounded-lg">
        {/* 基本設定 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control form-control-minimal">
            <label className="label label-minimal">
              <span className="label-text">樂譜標題</span>
            </label>
            <input
              type="text"
              className="input input-underline w-full"
              placeholder="未命名的樂譜"
              value={customParams.title ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div className="form-control form-control-minimal">
            <label className="label label-minimal">
              <span className="label-text">速度 (BPM)</span>
            </label>
            <input
              type="number"
              className="input input-underline w-full"
              placeholder="60"
              min={40}
              max={200}
              value={customParams.bpm ?? 60}
              onChange={(e) => handleChange('bpm', parseInt(e.target.value) || 60)}
            />
          </div>
          <div className="form-control form-control-minimal">
            <label className="label label-minimal">
              <span className="label-text">拍號</span>
            </label>
            <select
              className="select select-underline w-full"
              value={customParams.time_signature ?? '4/4'}
              onChange={(e) => handleChange('time_signature', e.target.value)}
            >
              <option value="4/4">4/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>
        </div>

        <div className="divider-minimal">樂器設定</div>

        {/* 樂器選擇 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInstrumentSelect('p1', '高音域樂器 (P1)')}
          {renderInstrumentSelect('p2', '中音域樂器 (P2)')}
          {renderInstrumentSelect('p3', '低音域樂器 (P3)')}
        </div>
      </div>
    );
  },
};

registerPlugin(plugin);
export default plugin;
