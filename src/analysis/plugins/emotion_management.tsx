import { AnalysisPlugin, registerPlugin } from '../registry';
import { emotionManagementAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'emotion_management',
  group: '易',
  name: '情緒管理系統',
  description: '情緒管理系統，針對情緒狀態進行評估與管理，涵蓋多種情緒測試模式。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: emotionManagementAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
