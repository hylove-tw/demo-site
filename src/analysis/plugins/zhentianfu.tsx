import { AnalysisPlugin, registerPlugin } from '../registry';
import { potentialAnalysis } from '../../config/analysisMethods';
import { renderPotentialReport } from '../../config/analysisRenderers';

const plugin: AnalysisPlugin = {
  id: 'zhentianfu',
  group: '主要功能',
  name: '貞天賦',
  shortDescription: '潛能評估系統，分析自然科學、創新藝術等八項天賦人格特質',
  description: '潛能 (Potential) 評估系統，分析與生俱來的八項人格特質：自然科學、創新藝術、邏輯判斷、記憶計算、活潑合群、社交公關、機智反應、堅毅忍耐，結合易經八卦理論提供天賦能量分布與潛能發展建議。',
  requiredFiles: [
    { verbose_name: '前測資料', name: 'beforeBrainData' },
    { verbose_name: '後測資料', name: 'afterBrainData' },
  ],
  execute: potentialAnalysis,
  renderReport: renderPotentialReport,
};

registerPlugin(plugin);
export default plugin;
