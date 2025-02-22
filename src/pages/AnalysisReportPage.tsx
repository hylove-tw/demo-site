// src/pages/AnalysisReportPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFileManager, UploadedFile } from '../hooks/useFileManager';

export interface AnalysisHistory {
  id: number;
  analysisId: string;
  analysisName: string;
  selectedFileIds: number[];
  result: any;
  timestamp: string;
  status: '成功' | '失敗';
}

const ANALYSIS_HISTORY_KEY = 'analysisHistory';

function getAnalysisHistory(): AnalysisHistory[] {
  const stored = window.localStorage.getItem(ANALYSIS_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

const AnalysisReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [record, setRecord] = useState<AnalysisHistory | null>(null);
  const { files } = useFileManager();

  // 讀取分析紀錄，找出對應 reportId 的紀錄
  useEffect(() => {
    const history = getAnalysisHistory();
    const rec = history.find(r => r.id === Number(reportId)) || null;
    setRecord(rec);
  }, [reportId]);

  if (!record) {
    return (
      <div>
        <p>找不到該分析報告。</p>
        <Link to="/analysis">返回分析報告列表</Link>
      </div>
    );
  }

  // 根據 record.selectedFileIds 取得檔案資訊
  const renderSelectedFiles = () => {
    return record.selectedFileIds.map((id, index) => {
      const file: UploadedFile | undefined = files.find(f => f.id === id);
      return (
        <li key={id}>
          {file ? (
            <Link to={`/files/${file.id}`}>
              {file.alias || file.fileName}
            </Link>
          ) : (
            <span>ID {id} (已刪除)</span>
          )}
        </li>
      );
    });
  };

  return (
    <div>
      <h1>分析報告 - {record.analysisName}</h1>
      <p>分析時間：{new Date(record.timestamp).toLocaleString()}</p>
      <p>狀態：{record.status}</p>
      <h2>使用的檔案</h2>
      <ul>{renderSelectedFiles()}</ul>
      <h2>詳細報告</h2>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(record.result, null, 2)}
      </pre>
      <div style={{ marginTop: '1rem' }}>
        <Link to="/analysis">返回分析報告列表</Link>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <Link to="/files">返回檔案管理頁面</Link>
      </div>
    </div>
  );
};

export default AnalysisReportPage;