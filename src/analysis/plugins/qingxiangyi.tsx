import { AnalysisPlugin, registerPlugin } from '../registry';
import { perfumeAnalysis } from '../../config/analysisMethods';
import { renderPerfumeReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'qingxiangyi',
  group: '',
  name: '情香意',
  shortDescription: '推薦與身心最相合的香氛產品',
  description: '情香意炁場之香氛測試系統，透過腦波情緒分析評估不同香氛、精油對人體情緒與能量場的影響，推薦與使用者身心狀態最相合的香氛產品，提供個人化的芳香療癒建議與詳細對照報告。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: perfumeAnalysis,
  renderReport: renderPerfumeReport,
};

registerPlugin(plugin);
export default plugin;
