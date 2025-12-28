import React from 'react';
import { registerPlugin, AnalysisPlugin } from '../registry';
import { dualMusicAnalysis } from '../../config/analysisMethods';
import { renderDualMusicReport } from '../../config/analysisRenderers';

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
  id: 'dualmusic',
  group: '主要功能',
  name: '琴瑟合',
  shortDescription: '雙人腦波影音編碼，將兩人腦波轉化為六聲部心靈合奏音樂',
  description: '琴瑟合雙人腦波影音編碼系統，將兩人的腦波數據轉化為獨特的合奏樂譜。透過分析雙方腦波特徵，編碼生成六聲部的心靈合奏音樂（每人高、中、低三聲部），呈現兩人情感交流與默契的音樂化表現。',
  requiredFiles: [
    { verbose_name: '第一人腦波資料', name: 'first_player' },
    { verbose_name: '第二人腦波資料', name: 'second_player' },
  ],
  execute: dualMusicAnalysis,
  renderReport: renderDualMusicReport,
  customFields: [
    { label: '樂譜標題', fieldName: 'title', type: 'string', defaultValue: '未命名的樂譜' },
    { label: '速度 (BPM)', fieldName: 'bpm', type: 'number', defaultValue: 60 },
    { label: '拍號', fieldName: 'time_signature', type: 'string', defaultValue: '4/4' },
    { label: '第一人樂器 P1', fieldName: 'first_p1', type: 'string', defaultValue: 'flute' },
    { label: '第一人樂器 P2', fieldName: 'first_p2', type: 'string', defaultValue: 'piano' },
    { label: '第一人樂器 P3', fieldName: 'first_p3', type: 'string', defaultValue: 'cello' },
    { label: '第二人樂器 P1', fieldName: 'second_p1', type: 'string', defaultValue: 'violin' },
    { label: '第二人樂器 P2', fieldName: 'second_p2', type: 'string', defaultValue: 'guitar' },
    { label: '第二人樂器 P3', fieldName: 'second_p3', type: 'string', defaultValue: 'bass' },
  ],
  editComponent: ({ customParams, onChange }) => {
    const handleChange = (field: string, value: string | number) => {
      onChange({ ...customParams, [field]: value });
    };

    const getDefaultInstrument = (field: string) => {
      const defaults: Record<string, string> = {
        first_p1: 'flute', first_p2: 'piano', first_p3: 'cello',
        second_p1: 'violin', second_p2: 'guitar', second_p3: 'bass'
      };
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

        {/* 第一演奏者樂器 */}
        <div>
          <h4 className="text-sm font-medium text-primary mb-3">第一演奏者</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInstrumentSelect('first_p1', '高音域樂器 (P1)')}
            {renderInstrumentSelect('first_p2', '中音域樂器 (P2)')}
            {renderInstrumentSelect('first_p3', '低音域樂器 (P3)')}
          </div>
        </div>

        {/* 第二演奏者樂器 */}
        <div>
          <h4 className="text-sm font-medium text-secondary mb-3">第二演奏者</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInstrumentSelect('second_p1', '高音域樂器 (P1)')}
            {renderInstrumentSelect('second_p2', '中音域樂器 (P2)')}
            {renderInstrumentSelect('second_p3', '低音域樂器 (P3)')}
          </div>
        </div>
      </div>
    );
  },
};

registerPlugin(plugin);
export default plugin;
