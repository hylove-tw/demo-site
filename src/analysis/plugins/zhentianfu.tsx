import { AnalysisPlugin, registerPlugin } from '../registry';
import { potentialAnalysis } from '../../config/analysisMethods';
import { renderPotentialReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'zhentianfu',
  group: '',
  name: '貞天賦',
  description: '潛能評估系統，通過腦波數據評估個人的潛能表現與能量分布。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: potentialAnalysis,
  renderReport: renderPotentialReport,
};

registerPlugin(plugin);
export default plugin;
