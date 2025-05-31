import { AnalysisPlugin, registerPlugin } from '../registry';
import { perfumeTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'perfume_test',
  group: '易',
  name: '香水評比測試',
  description: '以嗅覺為主的測試模式，評估並推薦最適合使用者的香水。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: perfumeTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
