// src/components/AnalysisSelector.tsx
import React, { ChangeEvent } from 'react';

interface AnalysisSelectorProps {
  onAnalyze: (analysisType: string) => void;
}

const AnalysisSelector: React.FC<AnalysisSelectorProps> = ({ onAnalyze }) => {
  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    onAnalyze(e.target.value);
  };

  return (
    <div>
      <label>選擇分析類型：</label>
      <select onChange={handleSelect} defaultValue="">
        <option value="">-- 請選擇 --</option>
        <option value="trend">趨勢分析 (需 1 檔)</option>
        <option value="forecast">預測 (需 1 檔)</option>
        <option value="stats">統計量分析 (需 2 檔)</option>
      </select>
    </div>
  );
};

export default AnalysisSelector;