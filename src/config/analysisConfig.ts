// src/config/analysisConfig.ts
import React from 'react';
import { differenceAnalysis, trendAnalysis, combinedAnalysis } from './analysisMethods';
import { renderDifferenceReport, renderTrendReport, renderCombinedReport } from './analysisRenderers';

// 定義單一檔案需求型別
export interface AnalysisRequiredFile {
  verbose_name: string;
  name: string;
}

// 定義整個分析功能的設定型別
export interface AnalysisFunctionConfig {
  id: string;
  name: string;
  requiredFiles: AnalysisRequiredFile[];
  func: (data: any[][]) => Promise<any>;
  renderReport: (result: any) => React.ReactNode;
}

// 分析功能設定陣列
export const analysisConfig: AnalysisFunctionConfig[] = [
  {
    id: 'difference',
    name: '差異度分析',
    requiredFiles: [
      { verbose_name: '前測檔案', name: 'first_file' },
      { verbose_name: '後測檔案', name: 'second_file' },
    ],
    func: differenceAnalysis,
    renderReport: renderDifferenceReport,
  },
  {
    id: 'trend',
    name: '趨勢分析',
    requiredFiles: [{ verbose_name: '測試檔案', name: 'test_file' }],
    func: trendAnalysis,
    renderReport: renderTrendReport,
  },
  {
    id: 'combined',
    name: '綜合分析',
    requiredFiles: [
      { verbose_name: '檔案一', name: 'file_one' },
      { verbose_name: '檔案二', name: 'file_two' },
      { verbose_name: '檔案三', name: 'file_three' },
    ],
    func: combinedAnalysis,
    renderReport: renderCombinedReport,
  },
];