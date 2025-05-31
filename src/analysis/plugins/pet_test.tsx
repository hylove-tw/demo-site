import { AnalysisPlugin, registerPlugin } from '../registry';
import { petTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'pet_test',
  group: '易',
  name: '寵物評比測試',
  description: '透過視覺與觸覺測試，評估並匹配最適合的寵物相關指標。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: petTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
