import { AnalysisPlugin, registerPlugin } from '../registry';
import { musicTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'music_test',
  group: '易',
  name: '音樂演奏/歌曲演唱評比測試',
  shortDescription: '利用腦波分析評比音樂作品',
  description: '音樂演奏/歌曲演唱評比測試（聽覺），利用腦波情緒分析選擇對身心最有利的音樂作品。測試時間根據音樂長度而定，可用於評比不同演奏版本、歌手詮釋或音樂類型對聽眾的情緒影響。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: musicTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
