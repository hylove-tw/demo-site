import { AnalysisPlugin, registerPlugin } from '../registry';
import { petTestAnalysis } from '../../config/analysisMethods';
import { renderEmotionReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'pet_test',
  group: '易 Motion',
  name: '寵物評比測試',
  shortDescription: '寵物評比，透過視覺與觸覺階段的腦波情緒分析選擇最佳寵物',
  description: '寵物評比測試（視覺、觸覺），利用腦波情緒分析選擇對主人身心最有利的寵物。測試共 2 分鐘：前 30 秒無寵物、30-60 秒觀看寵物、60-120 秒親密接觸寵物，計算各階段情緒平均值進行評比。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: petTestAnalysis,
  renderReport: renderEmotionReport,
};

registerPlugin(plugin);
export default plugin;
