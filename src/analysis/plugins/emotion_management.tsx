import { AnalysisPlugin, registerPlugin } from '../registry';
import { emotionManagementAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'emotion_management',
  group: '易',
  name: '情緒管理系統',
  shortDescription: '員工情緒管理，定期量測腦波情緒紀錄並預測憂鬱傾向',
  description: '員工情緒管理系統，定期量測腦波情緒並紀錄，藉以預測是否有憂鬱傾向。測試時間 1 分鐘，測試者全程睜眼保持平常狀態，報告顯示情緒值時序圖與情緒平均值。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: emotionManagementAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
