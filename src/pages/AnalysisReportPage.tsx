// src/pages/AnalysisReportPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisConfigs, AnalysisConfig } from '../config/analysisConfigs';
import { useAnalysisManager, AnalysisHistory } from '../hooks/useAnalysisManager';

const AnalysisReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { history } = useAnalysisManager();
  const [record, setRecord] = useState<AnalysisHistory | null>(null);
  const [config, setConfig] = useState<AnalysisConfig | null>(null);

  useEffect(() => {
    if (reportId) {
      const id = Number(reportId);
      const foundRecord = history.find(r => r.id === id) || null;
      setRecord(foundRecord);
      if (foundRecord) {
        const foundConfig = analysisConfigs.find(c => c.id === foundRecord.analysisId) || null;
        setConfig(foundConfig);
      }
    }
  }, [reportId, history]);

  if (!record) {
    return (
      <div>
        找不到報告。<Link to="/">返回分析頁</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>分析報告</h1>
      {config ? (
        config.renderReport(record.result)
      ) : (
        <p>找不到對應的分析配置。</p>
      )}
      <Link to="/">返回分析頁</Link>
    </div>
  );
};

export default AnalysisReportPage;