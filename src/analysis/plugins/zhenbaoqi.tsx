import { AnalysisPlugin, registerPlugin } from '../registry';
import { treasureAnalysis } from '../../config/analysisMethods';
import { renderTreasureReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'zhenbaoqi',
  group: '',
  name: '珍寶炁',
  shortDescription: '推薦與氣場最相合的結晶體產品',
  description: '珍寶炁場之礦物結晶體測試系統（台灣專利），透過腦波情緒分析評估不同水晶、寶石等結晶體對人體能量場的影響，推薦與使用者氣場最相合的結晶體產品，達到身心平衡與能量調和的效果。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: treasureAnalysis,
  renderReport: renderTreasureReport,
};

registerPlugin(plugin);
export default plugin;
