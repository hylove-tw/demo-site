// src/pages/AnalysisReportPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlugins, AnalysisPlugin } from '../analysis/registry';
import {
  useAnalysisManager,
  AnalysisHistory,
} from '../hooks/useAnalysisManager';
import { useUserContext } from '../context/UserContext';
import ReportLayout, { ReportLayoutProps } from '../components/ReportLayout';

// 群組樣式與描述
const groupMeta: Record<string, { badgeClass: string; description: string }> = {
  '主要功能': { badgeClass: 'badge-primary', description: '核心分析系統' },
  '利養炁': { badgeClass: 'badge-secondary', description: '正念修行系列' },
  '易 Motion': { badgeClass: 'badge-accent', description: '情緒評比系列' },
};

const AnalysisReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { history } = useAnalysisManager();
  const { users } = useUserContext();
  const [record, setRecord] = useState<AnalysisHistory | null>(null);
  const [config, setConfig] = useState<AnalysisPlugin | null>(null);

  useEffect(() => {
    if (reportId) {
      const id = Number(reportId);
      const foundRecord = history.find((r) => r.id === id) || null;
      setRecord(foundRecord);
      if (foundRecord) {
        const foundConfig =
          getPlugins().find((c) => c.id === foundRecord.analysisId) || null;
        setConfig(foundConfig);
      }
    }
  }, [reportId, history]);

  if (!record) {
    return (
      <div className="container mx-auto">
        <div className="alert alert-error">
          <span>找不到報告</span>
        </div>
        <Link to="/" className="btn btn-ghost mt-4">
          返回首頁
        </Link>
      </div>
    );
  }

  const userForRecord = users.find((u) => u.id === record.userId);
  const userInfo = {
    id: userForRecord?.id || 'unknown',
    name: userForRecord?.name || '未知受測者',
    phone: userForRecord?.phone || '未設定',
    email: userForRecord?.email || '未設定',
  };

  const testInfo = {
    testName: record.analysisName,
    testTime: new Date(record.timestamp).toLocaleString(),
    bluetoothSerial: 'BT-001',
    availableBase: '100',
  };

  const companyInfo = {
    name: userForRecord?.company.name || '未設定',
    address: userForRecord?.company.address || '未設定',
    id: userForRecord?.company.id || '未設定',
    phone: userForRecord?.company.phone || '未設定',
    fax: userForRecord?.company.fax || '未設定',
  };

  const resultContent =
    config && config.renderReport ? (
      config.renderReport(record.result, record.customParams || {})
    ) : (
      <p>找不到對應的分析配置</p>
    );

  const reportProps: ReportLayoutProps = {
    company: companyInfo,
    user: userInfo,
    test: testInfo,
    explanation: config?.description || '',
    resultContent,
  };

  return (
    <div className="container mx-auto">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link to="/">首頁</Link>
          </li>
          <li>
            <Link to={`/analysis/${record.analysisId}`}>
              {record.analysisName}
            </Link>
          </li>
          <li>分析報告</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          {config?.group && (
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge badge-sm ${groupMeta[config.group]?.badgeClass || 'badge-ghost'}`}>
                {config.group}
              </span>
              <span className="text-sm text-base-content/60">
                {groupMeta[config.group]?.description || ''}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2">{record.analysisName}</h1>
          <p className="text-base-content/60">分析報告</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.print()}
            className="btn btn-outline btn-secondary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
              />
            </svg>
            列印報告
          </button>
          <Link to="/" className="btn btn-ghost">
            返回首頁
          </Link>
          <Link
            to={`/analysis/${record.analysisId}`}
            className="btn btn-primary"
          >
            再次分析
          </Link>
        </div>
      </div>

      {/* 報告內容 */}
      <ReportLayout {...reportProps} />
    </div>
  );
};

export default AnalysisReportPage;
