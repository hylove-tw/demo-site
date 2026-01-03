// src/components/FileGroupSelector.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFileManager } from '../hooks/useFileManager';

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
  const { files, groups } = useFileManager();
  const [selectionMode, setSelectionMode] = useState<'individual' | 'group'>(
    'individual'
  );

  const userGroups = groups.filter((g) => g.userId === userId);

  const handleGroupChange = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      const groupFiles = files.filter((f) => f.groupId === groupId);
      const fileIds = groupFiles.slice(0, requiredFileCount).map((f) => f.id);
      onGroupSelect(fileIds);
    }
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

          {files.length === 0 && (
            <div className="alert alert-warning">
              <span>
                尚未上傳任何檔案，請先至
                <Link to="/files" className="link link-primary mx-1">
                  腦波檔案管理
                </Link>
                上傳檔案
              </span>
            </div>
          )}
        </div>
      ) : (
        /* 群組選擇 */
        <div className="space-y-4">
          {userGroups.length === 0 ? (
            <div className="alert alert-info">
              <span>
                尚無腦波資料群組，請先至
                <Link to="/files" className="link link-primary mx-1">
                  腦波檔案管理
                </Link>
                建立群組
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
    </div>
  );
};

export default FileGroupSelector;
