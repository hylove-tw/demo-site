import { AnalysisPlugin, registerPlugin } from '../registry';
import { treasureAnalysis } from '../../config/analysisMethods';
import { renderTreasureReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'zhenbaoqi',
  group: '',
  name: '珍寶炁',
  description: '最佳炁場之礦物結晶體測試系統，利用腦波與情緒數據推薦最適合的結晶體產品（台灣專利）。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: treasureAnalysis,
  renderReport: renderTreasureReport,
};

registerPlugin(plugin);
export default plugin;
