import { AnalysisPlugin, registerPlugin } from '../registry';
import { hrAnalysis } from '../../config/analysisMethods';
import { renderHRReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'hengyunlai',
  group: '',
  name: '亨運來',
  description: 'H.R 評估系統，用於評估個人的人力資源潛能及工作適配度。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: hrAnalysis,
  renderReport: renderHRReport,
};

registerPlugin(plugin);
export default plugin;
