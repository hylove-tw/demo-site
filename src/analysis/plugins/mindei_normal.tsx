import { AnalysisPlugin, registerPlugin } from '../registry';
import {
  mindfulnessNormalAnalysis,
} from '../../config/analysisMethods';
import { renderMindfulnessReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'mindei_normal',
  group: '利養炁',
  name: '正念修行',
  shortDescription: '正念修行與身心指數系統，前後測各一分鐘評估身心平衡',
  description: '正念修行 (Mindfulness) 與身心指數系統。前測為正常睜眼狀態，後測為正念閉眼狀態，各一分鐘。透過情緒判別式計算與時序分析，評估正念修行指數與身心平衡狀態，情緒值最佳狀態為持續保持在 1，代表心無罣礙、心如止水。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: mindfulnessNormalAnalysis,
  renderReport: renderMindfulnessReport,
};

registerPlugin(plugin);
export default plugin;
