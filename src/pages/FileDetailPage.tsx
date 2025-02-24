// src/pages/FileDetailPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFileManager, UploadedFile } from '../hooks/useFileManager';

const FileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const fileId = Number(id);
  const { files } = useFileManager();

  const file: UploadedFile | undefined = files.find((f) => f.id === fileId);

  if (!file) {
    return (
      <div>
        <p>找不到該檔案。</p>
        <Link to="/files">返回檔案列表</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>檔案詳細資訊</h1>
      <h2>{file.alias}</h2>
      <p><strong>原檔名：</strong>{file.fileName}</p>
      <p><strong>上傳時間：</strong>{new Date(file.uploadedAt).toLocaleString()}</p>
      <h3>資料內容：</h3>
      <textarea
        readOnly
        style={{ width: '100%', height: '400px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
        value={JSON.stringify(file.data, null, 2)}
      />
      <Link to="/files">返回檔案列表</Link>
    </div>
  );
};

export default FileDetailPage;