import { AnalysisPlugin, registerPlugin } from '../registry';
import { videoTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'video_test',
  group: '易',
  name: '短視頻廣告評比測試',
  shortDescription: '視頻廣告評比，透過視聽覺的腦波情緒分析評估廣告效果',
  description: '短視頻廣告評比測試（視覺+聽覺），利用腦波情緒分析評估廣告對觀眾的影響程度，為廣告主提供客觀的腦波數據參考。測試時間根據影片長度而定，計算觀看過程中的情緒平均值進行評比。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: videoTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
