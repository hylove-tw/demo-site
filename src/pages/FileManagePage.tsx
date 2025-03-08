// src/pages/FileManagePage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { useFileManager, UploadedFile } from '../hooks/useFileManager';
import { useUserManager } from '../hooks/useUserManager';

const FileManagePage: React.FC = () => {
  const { files, addFile, updateFileAlias, deleteFile } = useFileManager();
  const { currentUser } = useUserManager();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAlias, setNewAlias] = useState<string>('');

  const handleUpload = async (file: File) => {
    if (!currentUser) {
      alert("請先設定使用者資訊");
      return;
    }
    try {
      await addFile(file, currentUser.id);
    } catch (error: any) {
      alert(error.message || "檔案上傳失敗");
    }
  };

  const handleEditAlias = (file: UploadedFile) => {
    setEditingId(file.id);
    setNewAlias(file.alias || file.fileName);
  };

  const handleUpdateAlias = (id: number) => {
    updateFileAlias(id, newAlias);
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("確定要刪除該檔案嗎？")) {
      deleteFile(id);
    }
  };

  return (
    <div>
      <h1>檔案管理</h1>
      {!currentUser && <p style={{ color: 'red' }}>請先設定使用者資訊</p>}
      <div>
        <h2>上傳檔案 (CSV 或 XLSX)</h2>
        <FileUploader onUpload={handleUpload} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>已上傳檔案</h2>
        {files.length === 0 ? (
          <p>尚無檔案上傳</p>
        ) : (
          <ul>
            {files.map(file => (
              <li key={file.id} style={{ marginBottom: '1rem' }}>
                <div>
                  <strong>
                    <Link to={`/files/${file.id}`}>
                      {file.alias || file.fileName}
                    </Link>
                  </strong>
                  <span> (上傳時間: {new Date(file.uploadedAt).toLocaleString()})</span>
                </div>
                <div>
                  <button onClick={() => handleEditAlias(file)}>修改別稱</button>
                  <button onClick={() => handleDelete(file.id)}>刪除</button>
                </div>
                {editingId === file.id && (
                  <div>
                    <input
                      type="text"
                      value={newAlias}
                      onChange={e => setNewAlias(e.target.value)}
                    />
                    <button onClick={() => handleUpdateAlias(file.id)}>確認</button>
                    <button onClick={() => setEditingId(null)}>取消</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FileManagePage;