// src/config/analysisFunctions.ts

// 定義單一檔案需求型別
export interface AnalysisRequiredFile {
  verbose_name: string; // 顯示用名稱，例如「前測檔案」
  name: string;         // 內部識別用的 key，例如 "first_file"
}

// 定義整個分析功能的設定型別
export interface AnalysisFunctionConfig {
  id: string; // 唯一識別碼，例如 "difference"
  name: string; // 分析功能名稱，例如 "差異度分析"
  requiredFiles: AnalysisRequiredFile[]; // 所需檔案需求列表
  func: (data: any[][]) => Promise<any>; // 分析函式：接受合併後的資料並回傳結果
}

// 差異度分析範例：需要前測檔案與後測檔案
export async function differenceAnalysis(data: any[][]): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模擬分析邏輯：僅回傳資料筆數與一則訊息
      resolve({
        analysis: 'difference',
        totalRecords: data.length,
        message: '差異度分析已完成',
      });
    }, 1000);
  });
}

// 趨勢分析範例：僅需要一個測試檔案
export async function trendAnalysis(data: any[][]): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        analysis: 'trend',
        totalRecords: data.length,
        trend: 'upward',
        message: '趨勢分析已完成',
      });
    }, 1000);
  });
}

// 綜合分析範例：需要三個檔案
export async function combinedAnalysis(data: any[][]): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        analysis: 'combined',
        totalRecords: data.length,
        details: '綜合分析細節',
        message: '綜合分析已完成',
      });
    }, 1000);
  });
}

// 分析功能設定陣列，包含三個範例
export const analysisFunctions: AnalysisFunctionConfig[] = [
  {
    id: 'difference',
    name: '差異度分析',
    requiredFiles: [
      { verbose_name: '前測檔案', name: 'first_file' },
      { verbose_name: '後測檔案', name: 'second_file' },
    ],
    func: differenceAnalysis,
  },
  {
    id: 'trend',
    name: '趨勢分析',
    requiredFiles: [
      { verbose_name: '測試檔案', name: 'test_file' },
    ],
    func: trendAnalysis,
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
  },
];