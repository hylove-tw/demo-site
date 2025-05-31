import { AnalysisPlugin, registerPlugin } from '../registry';
import { mindfulnessLevelAnalysis } from '../../config/analysisMethods';
import { renderMindfulnessReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'mindei_level',
  group: '利養炁',
  name: '練炁品階',
  description: '練炁品階模式，前測為正念閉眼，後測為運行練炁，評估修行層級及品質。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: mindfulnessLevelAnalysis,
  renderReport: renderMindfulnessReport,
};

registerPlugin(plugin);
export default plugin;
