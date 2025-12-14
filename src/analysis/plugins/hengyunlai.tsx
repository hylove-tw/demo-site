import { AnalysisPlugin, registerPlugin } from '../registry';
import { hrAnalysis } from '../../config/analysisMethods';
import { renderHRReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'hengyunlai',
  group: '',
  name: '亨運來',
  shortDescription: 'H.R 人力資源評估，結合易經八卦理論分析八大職能潛能',
  description: 'H.R (Human Resource) 評估系統，透過腦波分析評估個人的人力資源潛能，結合易經八卦理論對應領導統御、創新發展、研發整合、人事行政、業務拓展、公關行銷、生產管理、任務執行八大職能面向，提供職涯發展與工作適配度參考。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: hrAnalysis,
  renderReport: renderHRReport,
};

registerPlugin(plugin);
export default plugin;
