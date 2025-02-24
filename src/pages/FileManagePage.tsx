// src/pages/FileManagePage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { useFileManager, UploadedFile } from '../hooks/useFileManager';

const FileManagePage: React.FC = () => {
  const { files, addFile, updateFileAlias, deleteFile } = useFileManager();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAlias, setNewAlias] = useState<string>('');

  // 上傳檔案，直接將原始 File 物件傳入 addFile
  const handleUpload = async (file: File) => {
    try {
      await addFile(file);
    } catch (error: any) {
      alert(error.message || '檔案上傳失敗');
    }
  };

  // 進入編輯模式以修改檔案別稱
  const handleEditAlias = (file: UploadedFile) => {
    setEditingId(file.id);
    setNewAlias(file.alias || file.fileName);
  };

  // 更新檔案別稱後退出編輯模式
  const handleUpdateAlias = (id: number) => {
    updateFileAlias(id, newAlias);
    setEditingId(null);
  };

  // 刪除檔案，顯示確認視窗後進行刪除
  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除該檔案嗎？')) {
      deleteFile(id);
    }
  };

  return (
    <div>
      <h1>檔案管理</h1>

      {/* 上傳區塊 */}
      <div>
        <h2>上傳檔案 (CSV 或 XLSX)</h2>
        <FileUploader onUpload={handleUpload} />
      </div>

      {/* 檔案列表區塊 */}
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