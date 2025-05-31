import { AnalysisPlugin, registerPlugin } from '../registry';
import { beverageTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'beverage_test',
  group: '易',
  name: '品茶/品酒/品咖啡評比測試',
  description: '基於嗅覺與味覺評比，提供茶、酒、咖啡等飲品的評估參考。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: beverageTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
