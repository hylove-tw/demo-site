import { AnalysisPlugin, registerPlugin } from '../registry';
import { perfumeTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'perfume_test',
  group: '易',
  name: '香水評比測試',
  shortDescription: '香水評比，透過嗅覺的腦波情緒分析選擇最適合的香水產品',
  description: '香水評比測試（嗅覺），利用腦波情緒分析選擇對身心最有利的香水產品。測試共 2 分鐘：前 30 秒無香水、30-60 秒聞香、60-120 秒再次聞香確認，計算各階段情緒平均值進行評比。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: perfumeTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
