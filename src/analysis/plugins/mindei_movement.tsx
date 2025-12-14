import { AnalysisPlugin, registerPlugin } from '../registry';
import { mindfulnessMovementAnalysis } from '../../config/analysisMethods';
import { renderMindfulnessReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'mindei_movement',
  group: '利養炁',
  name: '練炁修行',
  shortDescription: '分析練炁過程中的能量運行狀態',
  description: '練炁修行模式，前測為正常睜眼狀態，後測為運行練炁狀態，各一分鐘。透過腦波數據分析評估練炁過程中的能量運行狀態與身心協調程度。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: mindfulnessMovementAnalysis,
  renderReport: renderMindfulnessReport,
};

registerPlugin(plugin);
export default plugin;
