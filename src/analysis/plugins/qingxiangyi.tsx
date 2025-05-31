import { AnalysisPlugin, registerPlugin } from '../registry';
import { perfumeAnalysis } from '../../config/analysisMethods';
import { renderPerfumeReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'qingxiangyi',
  group: '',
  name: '情香意',
  description: '最佳炁場之香氛測試系統，通過腦波與情緒數據分析，推薦適合的香氛產品，並提供詳細報告與對照表。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: perfumeAnalysis,
  renderReport: renderPerfumeReport,
};

registerPlugin(plugin);
export default plugin;
