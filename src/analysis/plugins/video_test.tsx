import { AnalysisPlugin, registerPlugin } from '../registry';
import { videoTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'video_test',
  group: '易',
  name: '短視頻廣告評比測試',
  description: '綜合視覺與聽覺的評比，評估視頻廣告對情緒與認知的影響。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: videoTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
