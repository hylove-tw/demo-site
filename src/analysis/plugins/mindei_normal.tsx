import { AnalysisPlugin, registerPlugin } from '../registry';
import {
  mindfulnessNormalAnalysis,
} from '../../config/analysisMethods';
import { renderMindfulnessReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'mindei_normal',
  group: '利養炁',
  name: '正念修行',
  description: '正念修行模式，通過前測（正常睜眼）與後測（正念閉眼）的數據對比，評估身心指數。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: mindfulnessNormalAnalysis,
  renderReport: renderMindfulnessReport,
};

registerPlugin(plugin);
export default plugin;
