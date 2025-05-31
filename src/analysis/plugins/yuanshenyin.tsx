import React from 'react';
import { registerPlugin, AnalysisPlugin } from '../registry';
import { musicAnalysis } from '../../config/analysisMethods';
import { renderBrainWaveMusicReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'yuanshenyin',
  group: '',
  name: '元神音',
  description: '單人腦波影音編碼及播放系統，專注於個人腦波數據的動態編碼與影音展示。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: musicAnalysis,
  renderReport: renderBrainWaveMusicReport,
  customFields: [
    { label: '樂譜標題', fieldName: 'sheetTitle', type: 'string', defaultValue: 'My Music' },
    { label: '速度', fieldName: 'soundTempo', type: 'number', defaultValue: 60 },
  ],
  editComponent: ({ customParams, onChange }) => (
    <div className="flex flex-col space-y-2 p-4 border rounded">
      <input
        type="text"
        className="input input-bordered"
        placeholder="樂譜標題"
        value={customParams.sheetTitle ?? ''}
        onChange={(e) => onChange({ ...customParams, sheetTitle: e.target.value })}
      />
      <input
        type="number"
        className="input input-bordered"
        placeholder="速度"
        value={customParams.soundTempo ?? ''}
        onChange={(e) =>
          onChange({ ...customParams, soundTempo: parseInt(e.target.value) || 0 })
        }
      />
    </div>
  ),
};

registerPlugin(plugin);
export default plugin;
