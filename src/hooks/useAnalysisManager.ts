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
  const stored = localStorage.getItem(ANALYSIS_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveAnalysisHistory(history: AnalysisHistory[]) {
  localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(history));
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
