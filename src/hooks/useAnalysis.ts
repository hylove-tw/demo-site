// src/hooks/useAnalysis.ts
import { useState } from 'react';
import { parseExcelFile } from '../services/excelParser';
import { analyzeData, AnalysisResponse } from '../services/analysisApi';

const LOCAL_STORAGE_KEY = 'uploadedExcelData';

/** 從 localStorage 取出已上傳的資料陣列 */
function getLocalStoredData(): any[] {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/** 將新的資料陣列存入 localStorage */
function setLocalStoredData(data: any[]) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

export function useAnalysis() {
  const [excelData, setExcelData] = useState<any[][] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 上傳並解析 Excel
  const handleFileUpload = async (file: File) => {
    setError(null);
    setAnalysisResult(null);

    try {
      const jsonData = await parseExcelFile(file);
      setExcelData(jsonData);

      // 2. 解析成功後，存進 localStorage
      const existingData = getLocalStoredData();
      const newItem = {
        id: Date.now(),             // 可用 timestamp 當作唯一 ID
        fileName: file.name,       // 檔名
        uploadedAt: new Date().toISOString(),
        data: jsonData,            // 解析後的二維陣列 / JSON
      };
      const updatedData = [...existingData, newItem];
      setLocalStoredData(updatedData);

    } catch (err: any) {
      setError(err.message || 'Error parsing Excel file');
    }
  };

  // 3. 呼叫分析 API（與原本邏輯相同）
  const handleAnalyze = async (analysisType: string) => {
    if (!excelData) {
      setError('請先上傳並解析 Excel');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeData(excelData, analysisType);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Error calling analysis API');
    } finally {
      setLoading(false);
    }
  };

  return {
    excelData,
    analysisResult,
    loading,
    error,
    handleFileUpload,
    handleAnalyze,
  };
}