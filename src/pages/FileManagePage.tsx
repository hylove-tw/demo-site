// src/pages/FileManagePage.tsx
import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useFileManager, UploadedFile} from '../hooks/useFileManager';
import {useUserContext} from '../context/UserContext';

const FileManagePage: React.FC = () => {
    const {files, addFile, updateFileAlias, deleteFile} = useFileManager();
    const {users, currentUser} = useUserContext();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Modal 狀態與編輯用狀態
    const [aliasModalOpen, setAliasModalOpen] = useState<boolean>(false);
    const [selectedFileToEdit, setSelectedFileToEdit] = useState<UploadedFile | null>(null);
    const [newAlias, setNewAlias] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('請選擇檔案');
            return;
        }
        if (!currentUser) {
            alert('請先設定使用者');
            return;
        }
        try {
            await addFile(selectedFile, currentUser.id);
            setSelectedFile(null);
            alert('檔案上傳成功');
        } catch (err: any) {
            alert('檔案上傳失敗：' + err.message);
        }
    };

    // 開啟修改別稱的 modal
    const openAliasModal = (file: UploadedFile) => {
        setSelectedFileToEdit(file);
        setNewAlias(file.alias);
        setAliasModalOpen(true);
    };

    // 儲存別稱修改
    const handleAliasModalSave = () => {
        if (selectedFileToEdit) {
            updateFileAlias(selectedFileToEdit.id, newAlias);
            setAliasModalOpen(false);
            setSelectedFileToEdit(null);
            setNewAlias('');
        }
    };

    // 取消修改
    const handleAliasModalCancel = () => {
        setAliasModalOpen(false);
        setSelectedFileToEdit(null);
        setNewAlias('');
    };

    // 將檔案 ID 列表轉換成檔案連結
    const renderSelectedFiles = (fileIds: number[]) => {
        return fileIds.map((id, index) => {
            const file = files.find(f => f.id === id);
            return (
                <span key={id}>
          {file ? (
              <Link to={`/files/${file.id}`}>
                  {file.alias || file.fileName}
              </Link>
          ) : (
              `ID ${id} (已刪除)`
          )}
                    {index < fileIds.length - 1 && ", "}
        </span>
            );
        });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">檔案管理</h1>

            {/* 上傳檔案區 */}
            <div className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                    <h2 className="card-title">上傳新檔案</h2>
                    <input
                        type="file"
                        className="file-input file-input-bordered w-full max-w-xs"
                        onChange={handleFileChange}
                    />
                    <div className="mt-4">
                        <button className="btn btn-primary" onClick={handleUpload}>
                            上傳檔案
                        </button>
                    </div>
                </div>
            </div>

            {/* 檔案列表 */}
            <h2 className="text-2xl font-bold mb-2">已上傳檔案</h2>
            {files.length === 0 ? (
                <p>尚無檔案上傳</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>檔案名稱</th>
                            <th>別名</th>
                            <th>上傳時間</th>
                            <th>使用者</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {files.map(file => (
                            <tr key={file.id}>
                                <td>{file.id}</td>
                                <td>{file.fileName}</td>
                                <td>{file.alias}</td>
                                <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                                <td>
                                    {users.find(user => user.id === file.userId)?.name || '未知'}
                                </td>
                                <td>
                                    <div className="flex space-x-2">
                                        <Link to={`/files/${file.id}`} className="btn btn-sm btn-primary">
                                            檢視
                                        </Link>
                                        <button
                                            className="btn btn-sm btn-warning"
                                            onClick={() => openAliasModal(file)}
                                        >
                                            修改別稱
                                        </button>
                                        <button
                                            className="btn btn-sm btn-error"
                                            onClick={() => deleteFile(file.id)}
                                        >
                                            刪除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 修改別稱 Modal */}
            {aliasModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box relative">
                        <label
                            htmlFor="modal-close"
                            className="btn btn-sm btn-circle absolute right-2 top-2"
                            onClick={handleAliasModalCancel}
                        >
                            ✕
                        </label>
                        <h3 className="text-lg font-bold mb-4">修改檔案別稱</h3>
                        <input
                            type="text"
                            value={newAlias}
                            onChange={(e) => setNewAlias(e.target.value)}
                            className="input input-bordered w-full"
                            placeholder="請輸入新別稱"
                        />
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={handleAliasModalSave}>
                                儲存
                            </button>
                            <button className="btn" onClick={handleAliasModalCancel}>
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileManagePage;