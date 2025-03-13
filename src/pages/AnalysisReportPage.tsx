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
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <span>找不到報告。 </span>
          <Link className="link" to="/">返回分析頁</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">分析報告</h1>
          {config ? (
            <div>{config.renderReport(record.result)}</div>
          ) : (
            <p>找不到對應的分析配置。</p>
          )}
          <div className="card-actions justify-end">
            <Link to="/" className="btn btn-primary">
              返回分析頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportPage;