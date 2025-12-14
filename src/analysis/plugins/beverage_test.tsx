import { AnalysisPlugin, registerPlugin } from '../registry';
import { beverageTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'beverage_test',
  group: '易',
  name: '品茶/品酒/品咖啡評比測試',
  shortDescription: '飲品評比，透過嗅覺與味覺的腦波情緒分析選擇最佳飲品',
  description: '品茶、品酒、品咖啡評比測試（嗅覺、味覺），利用腦波情緒分析選擇對身心最有利的產品。測試共 2 分鐘：前 30 秒不接觸、30-60 秒聞香、60-120 秒品嚐，計算各階段情緒平均值進行評比。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: beverageTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
