import React from 'react';
import { registerPlugin, AnalysisPlugin } from '../registry';
import { musicAnalysisCreative, dualMusicAnalysisCreative } from '../../config/analysisMethods';
import { renderBrainWaveMusicReport, renderDualMusicReportCreative } from '../../config/analysisRenderers';
import {
  CompositionParamsForm,
  SINGLE_INSTRUMENT_FIELDS,
  DUAL_INSTRUMENT_FIELDS,
} from '../../components/CompositionParamsForm';

// The composition parameters live in CompositionParamsForm so that this form and
// the post-analysis editor offer exactly the same decisions under exactly the
// same compatibility rules. They used to be written out twice and had drifted.
const EditComponent: React.FC<{
  customParams: Record<string, any>;
  onChange: (newParams: Record<string, any>) => void;
}> = ({ customParams, onChange }) => (
  <CompositionParamsForm
    value={customParams}
    onChange={onChange}
    variant="full"
    showPlayerMode
    instrumentFields={
      (customParams.playerMode ?? 'single') === 'dual'
        ? DUAL_INSTRUMENT_FIELDS
        : SINGLE_INSTRUMENT_FIELDS
    }
  />
);

const plugin: AnalysisPlugin = {
  id: 'yuanshenyin-v2',
  group: '主要功能',
  name: '元神音創意平台',
  badge: { text: 'New', color: 'badge-success' },
  shortDescription: '進階腦波音樂創作，支援單人與雙人模式，自訂曲風、主旋律、音中心與背景音效',
  description:
    '元神音創意平台提供完整的音樂創作選項流程，可自選單人或雙人（琴瑟合）模式、情緒/心靈音樂類型、調性（大調/小調）、9 種主旋律、12 種曲風、BPM、樂器配置及腦波背景頻率與自然音效，生成專屬的腦波音樂五線譜。',
  requiredFiles: [
    { verbose_name: '腦波資料一', name: 'data1' },
    { verbose_name: '腦波資料二', name: 'data2' },
  ],
  execute: (data: any[][], customParams?: Record<string, any>) => {
    if (customParams?.playerMode === 'dual') {
      return dualMusicAnalysisCreative(data, customParams);
    }
    return musicAnalysisCreative(data, customParams);
  },
  renderReport: (result: any, customParams?: any) => {
    if (customParams?.playerMode === 'dual') {
      return renderDualMusicReportCreative(result, customParams);
    }
    return renderBrainWaveMusicReport(result, customParams);
  },
  customFields: [
    { label: '樂譜標題', fieldName: 'title', type: 'string', defaultValue: '未命名的樂譜' },
    { label: '速度 (BPM)', fieldName: 'bpm', type: 'number', defaultValue: 60 },
    { label: '高音域樂器', fieldName: 'p1', type: 'string', defaultValue: 'flute' },
    { label: '中音域樂器', fieldName: 'p2', type: 'string', defaultValue: 'piano' },
    { label: '低音域樂器', fieldName: 'p3', type: 'string', defaultValue: 'cello' },
  ],
  editComponent: EditComponent,
};

registerPlugin(plugin);
export default plugin;
