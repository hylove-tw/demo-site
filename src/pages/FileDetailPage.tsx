// src/pages/FileDetailPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFileManager } from '../hooks/useFileManager';

const FileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const fileId = Number(id);
  const { files } = useFileManager();

  const file = files.find(f => f.id === fileId);

  if (!file) {
    return (
      <div>
        <p>找不到該檔案</p>
        <Link to="/files">返回檔案列表</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>檔案詳細資訊</h1>
      <h2>{file.alias || file.fileName}</h2>
      <p>上傳時間：{new Date(file.uploadedAt).toLocaleString()}</p>
      <h3>資料內容：</h3>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(file.data, null, 2)}
      </pre>
      <Link to="/files">返回檔案列表</Link>
    </div>
  );
};

export default FileDetailPage;