// src/hooks/useAnalysisManager.ts
import { useState, useEffect } from "react";
import { Status } from "../pages/AnalysisPage";

export interface AnalysisHistory {
  id: number;
  analysisId: string;
  analysisName: string;
  selectedFileIds: number[];
  result: any; // 分析結果，等同於 analysisReport
  customParams?: Record<string, any>;
  description?: string;
  timestamp: string;
  userId: string;
  status: Status;
}

const ANALYSIS_HISTORY_KEY = "analysisHistory";

function loadAnalysisHistory(): AnalysisHistory[] {
  try {
    const stored = localStorage.getItem(ANALYSIS_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * 儲存分析紀錄到 localStorage。
 * 當超出配額時，自動刪除最舊的紀錄後重試（最多刪除 10 筆）。
 */
function saveAnalysisHistory(history: AnalysisHistory[]): void {
  let records = [...history];
  for (let attempt = 0; attempt <= 10; attempt++) {
    try {
      localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(records));
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError' && records.length > 1) {
        // 移除最舊的紀錄（陣列尾端）後重試
        records = records.slice(0, -1);
      } else {
        console.error('Failed to save analysis history:', e);
        return;
      }
    }
  }
}

export function useAnalysisManager() {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);

  useEffect(() => {
    setHistory(loadAnalysisHistory());
  }, []);

  const addHistoryRecord = (record: AnalysisHistory) => {
    const newHistory = [record, ...history];
    setHistory(newHistory);
    saveAnalysisHistory(newHistory);
  };

  const updateHistoryRecord = (
    recordId: number,
    updatedRecord: AnalysisHistory,
  ) => {
    const newHistory = history.map((record) =>
      record.id === recordId ? updatedRecord : record,
    );
    setHistory(newHistory);
    saveAnalysisHistory(newHistory);
  };

  const removeHistoryRecord = (recordId: number) => {
    const newHistory = history.filter((record) => record.id !== recordId);
    setHistory(newHistory);
    saveAnalysisHistory(newHistory);
  };

  return {
    history,
    addHistoryRecord,
    updateHistoryRecord,
    removeHistoryRecord,
  };
}
