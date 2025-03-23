// src/pages/AnalysisReportPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisConfigs, AnalysisConfig } from '../config/analysisConfigs';
import { useAnalysisManager, AnalysisHistory } from '../hooks/useAnalysisManager';
import { useUserContext } from '../context/UserContext';
import ReportLayout, { ReportLayoutProps } from '../components/ReportLayout';

const AnalysisReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { history } = useAnalysisManager();
  const { users } = useUserContext();
  const [record, setRecord] = useState<AnalysisHistory | null>(null);
  const [config, setConfig] = useState<AnalysisConfig | null>(null);

  useEffect(() => {
    if (reportId) {
      const id = Number(reportId);
      const foundRecord = history.find((r) => r.id === id) || null;
      setRecord(foundRecord);
      if (foundRecord) {
        const foundConfig =
          analysisConfigs.find((c) => c.id === foundRecord.analysisId) || null;
        setConfig(foundConfig);
      }
    }
  }, [reportId, history]);

  if (!record) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <span>找不到報告。</span>
          <Link className="link" to="/">
            返回分析頁
          </Link>
        </div>
      </div>
    );
  }

  // 根據 record.userId 從全域使用者中找出使用者資訊
  const userForRecord = users.find((u) => u.id === record.userId);
  const userInfo = {
    id: userForRecord ? userForRecord.id : 'unknown',
    name: userForRecord ? userForRecord.name : '未知使用者',
    phone: userForRecord ? userForRecord.phone : '未設定',
    email: userForRecord ? userForRecord.email : '未設定',
  };

  // 測試資訊（從 record 中取得或自行定義）
  const testInfo = {
    testName: record.analysisName,
    testTime: new Date(record.timestamp).toLocaleString(),
    bluetoothSerial: 'BT-001',
    availableBase: '100',
  };

  // 公司資訊可以從使用者中取得，若未設定則顯示預設值
  const companyInfo = {
    name: userForRecord ? userForRecord.company.name : '未設定',
    address: userForRecord ? userForRecord.company.address : '未設定',
    id: userForRecord ? userForRecord.company.id : '未設定',
    phone: userForRecord ? userForRecord.company.phone : '未設定',
    fax: userForRecord ? userForRecord.company.fax : '未設定',
  };

  // 將自訂欄位參數從 record 中傳入，若 record.customParams 不存在則傳入空物件
  const resultContent =
    config && config.renderReport
      ? config.renderReport(record.result, record.customParams || {})
      : <p>找不到對應的分析配置</p>;

  const reportProps: ReportLayoutProps = {
    company: companyInfo,
    user: userInfo,
    test: testInfo,
    explanation: config ? config.description : '',
    resultContent,
  };

  return (
    <div className="container mx-auto p-4">
      <ReportLayout {...reportProps} />
      <div className="mt-4">
        <Link to="/" className="btn btn-primary">
          返回分析頁
        </Link>
      </div>
    </div>
  );
};

export default AnalysisReportPage;