// src/services/analysisApi.ts
import axios from 'axios/dist/node/axios.cjs';

const BASE_URL = 'https://example.com/api'; // 後端 API 網址

// 將多種分析類型對應到不同的後端路徑
const endpoints: Record<string, string> = {
  trend: '/analysis/trend',
  forecast: '/analysis/forecast',
  stats: '/analysis/stats',
  // ...其他分析類型
};

// 後端回傳的資料結構可依需求擴充
export interface AnalysisResponse {
  [key: string]: any;
}

/**
 * analyzeData
 * @param data - 解析後的 Excel 資料 (二維陣列)
 * @param analysisType - 分析類型 (trend/forecast/stats/...)
 * @returns 後端回傳的分析結果
 */
export async function analyzeData(
  data: any[][],
  analysisType: string
): Promise<AnalysisResponse> {
  if (!endpoints[analysisType]) {
    throw new Error(`Unknown analysis type: ${analysisType}`);
  }

  const url = `${BASE_URL}${endpoints[analysisType]}`;
  // 根據後端 API 需求，自行調整傳送的 body 結構
  const response = await axios.post(url, { data });
  return response.data;
}