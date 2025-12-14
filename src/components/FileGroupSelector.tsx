// src/components/FileGroupSelector.tsx
import React, { useState } from 'react';
import {
  useFileManager,
  UploadedFile,
  FileGroup,
} from '../hooks/useFileManager';

interface FileGroupSelectorProps {
  requiredFileCount: number;
  requiredFileLabels: string[];
  selectedFileIds: (number | null)[];
  onFileSelect: (index: number, fileId: number) => void;
  onGroupSelect: (fileIds: number[]) => void;
  userId: string;
}

const FileGroupSelector: React.FC<FileGroupSelectorProps> = ({
  requiredFileCount,
  requiredFileLabels,
  selectedFileIds,
  onFileSelect,
  onGroupSelect,
  userId,
}) => {
  const { files, groups, addFilesAsGroup } = useFileManager();
  const [selectionMode, setSelectionMode] = useState<'individual' | 'group'>(
    'individual'
  );
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const userGroups = groups.filter((g) => g.userId === userId);

  const handleGroupChange = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      const groupFiles = files.filter((f) => f.groupId === groupId);
      const fileIds = groupFiles.slice(0, requiredFileCount).map((f) => f.id);
      onGroupSelect(fileIds);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(Array.from(e.target.files));
    }
  };

  const handleUploadGroup = async () => {
    if (filesToUpload.length === 0) {
      alert('請選擇檔案');
      return;
    }
    if (!newGroupName.trim()) {
      alert('請輸入群組名稱');
      return;
    }
    if (filesToUpload.length !== requiredFileCount) {
      alert(`請選擇 ${requiredFileCount} 個檔案`);
      return;
    }

    setUploading(true);
    try {
      const newGroup = await addFilesAsGroup(
        filesToUpload,
        newGroupName.trim(),
        userId
      );
      onGroupSelect(newGroup.fileIds);
      setUploadModalOpen(false);
      setNewGroupName('');
      setFilesToUpload([]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '上傳失敗';
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  const handleModalCancel = () => {
    setUploadModalOpen(false);
    setNewGroupName('');
    setFilesToUpload([]);
  };

  return (
    <div className="space-y-4">
      {/* 選擇模式切換 */}
      <div className="flex gap-2">
        <button
          type="button"
          className={`btn btn-sm ${selectionMode === 'individual' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectionMode('individual')}
        >
          個別選擇
        </button>
        <button
          type="button"
          className={`btn btn-sm ${selectionMode === 'group' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectionMode('group')}
        >
          群組選擇
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => setUploadModalOpen(true)}
        >
          上傳腦波資料群組
        </button>
      </div>

      {selectionMode === 'individual' ? (
        /* 個別檔案選擇 */
        <div className="space-y-4">
          {requiredFileLabels.map((label, index) => (
            <div key={index} className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">{label}</span>
              </label>
              <select
                className="select select-underline w-full"
                value={selectedFileIds[index] || ''}
                onChange={(e) => onFileSelect(index, Number(e.target.value))}
              >
                <option value="">{`請選擇 ${label}`}</option>
                {files.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.alias || file.fileName}
                    {file.groupId && ` (群組)`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : (
        /* 群組選擇 */
        <div className="space-y-4">
          {userGroups.length === 0 ? (
            <div className="alert alert-info">
              <span>
                尚無腦波資料群組，請點擊「上傳腦波資料群組」建立
              </span>
            </div>
          ) : (
            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">選擇腦波資料群組</span>
              </label>
              <select
                className="select select-underline w-full"
                onChange={(e) => handleGroupChange(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  請選擇群組
                </option>
                {userGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.fileIds.length} 個檔案)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 顯示已選群組的檔案 */}
          {selectedFileIds.some((id) => id !== null) && (
            <div className="bg-base-200 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">已選擇的檔案：</p>
              <ul className="list-disc list-inside text-sm">
                {selectedFileIds.map((fileId, index) => {
                  const file = files.find((f) => f.id === fileId);
                  return (
                    <li key={index}>
                      <span className="text-base-content/60">
                        {requiredFileLabels[index]}：
                      </span>{' '}
                      {file?.alias || file?.fileName || '未選擇'}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {files.length === 0 && selectionMode === 'individual' && (
        <div className="alert alert-warning">
          <span>尚未上傳任何檔案，請點擊「上傳腦波資料群組」上傳檔案</span>
        </div>
      )}

      {/* 上傳新群組 Modal */}
      {uploadModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleModalCancel}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-6">上傳腦波資料群組</h3>

            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">群組名稱</span>
              </label>
              <input
                type="text"
                className="input input-underline w-full"
                placeholder="例：2024/01/01 測試資料"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>

            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">
                  選擇腦波檔案（需要 {requiredFileCount} 個檔案）
                </span>
              </label>
              <input
                type="file"
                accept=".csv"
                multiple
                className="file-input file-input-underline w-full"
                onChange={handleFilesChange}
              />
              <p className="text-xs text-base-content/50 mt-2">僅支援 CSV 格式</p>
            </div>

            {filesToUpload.length > 0 && (
              <div className="bg-base-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium mb-2">
                  已選擇 {filesToUpload.length} 個檔案：
                </p>
                <ul className="list-disc list-inside text-sm">
                  {filesToUpload.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={handleModalCancel}>
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUploadGroup}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    上傳中...
                  </>
                ) : (
                  '上傳並建立群組'
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleModalCancel} />
        </div>
      )}
    </div>
  );
};

export default FileGroupSelector;
