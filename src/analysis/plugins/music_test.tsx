import { AnalysisPlugin, registerPlugin } from '../registry';
import { musicTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'music_test',
  group: '易',
  name: '音樂演奏/歌曲演唱評比測試',
  description: '針對聽覺進行的評比測試，檢視音樂表現及腦波反應。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: musicTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
