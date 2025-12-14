import { AnalysisPlugin, registerPlugin } from '../registry';
import { mindfulnessLevelAnalysis } from '../../config/analysisMethods';
import { renderMindfulnessReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'mindei_level',
  group: '利養炁',
  name: '練炁品階',
  shortDescription: '評估修行者的練炁層級與品質',
  description: '練炁品階模式，前測為正念閉眼狀態，後測為運行練炁狀態，各一分鐘。用於評估修行者的練炁層級與品質，透過對比正念基準與練炁狀態的腦波差異，判定修行境界。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: mindfulnessLevelAnalysis,
  renderReport: renderMindfulnessReport,
};

registerPlugin(plugin);
export default plugin;
