// src/pages/FileManagePage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useFileManager,
  UploadedFile,
  FileGroup,
} from '../hooks/useFileManager';
import { useUserContext } from '../context/UserContext';


const FileManagePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    files,
    groups,
    addFiles,
    addFilesAsGroup,
    updateFileAlias,
    deleteFile,
    deleteGroup,
    updateGroup,
    createGroup,
  } = useFileManager();
  const { users, currentUser } = useUserContext();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'files' | 'groups'>('files');

  // Modal 狀態與編輯用狀態
  const [aliasModalOpen, setAliasModalOpen] = useState<boolean>(false);
  const [selectedFileToEdit, setSelectedFileToEdit] =
    useState<UploadedFile | null>(null);
  const [newAlias, setNewAlias] = useState<string>('');

  // 群組上傳 Modal
  const [groupUploadModalOpen, setGroupUploadModalOpen] =
    useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  // 群組編輯 Modal
  const [groupEditModalOpen, setGroupEditModalOpen] = useState<boolean>(false);
  const [selectedGroupToEdit, setSelectedGroupToEdit] =
    useState<FileGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState<string>('');
  const [editGroupFileIds, setEditGroupFileIds] = useState<number[]>([]);

  // 建立新群組 Modal（從現有檔案）
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState<boolean>(false);
  const [createGroupName, setCreateGroupName] = useState<string>('');
  const [createGroupFileIds, setCreateGroupFileIds] = useState<number[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('請選擇檔案');
      return;
    }
    if (!currentUser) {
      alert('請先選擇受測者');
      return;
    }
    try {
      const count = selectedFiles.length;
      await addFiles(selectedFiles, currentUser.id);
      setSelectedFiles([]);
      const fileInput = document.querySelector(
        'input[type="file"]#single-file-input'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert(`成功上傳 ${count} 個檔案`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知錯誤';
      alert('檔案上傳失敗：' + message);
    }
  };

  const openAliasModal = (file: UploadedFile) => {
    setSelectedFileToEdit(file);
    setNewAlias(file.alias);
    setAliasModalOpen(true);
  };

  const handleAliasModalSave = () => {
    if (selectedFileToEdit) {
      updateFileAlias(selectedFileToEdit.id, newAlias);
      setAliasModalOpen(false);
      setSelectedFileToEdit(null);
      setNewAlias('');
    }
  };

  const handleAliasModalCancel = () => {
    setAliasModalOpen(false);
    setSelectedFileToEdit(null);
    setNewAlias('');
  };

  // 群組上傳相關
  const handleGroupFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(Array.from(e.target.files));
    }
  };

  const handleGroupUpload = async () => {
    if (filesToUpload.length === 0) {
      alert('請選擇檔案');
      return;
    }
    if (!newGroupName.trim()) {
      alert('請輸入群組名稱');
      return;
    }
    if (!currentUser) {
      alert('請先選擇受測者');
      return;
    }

    setUploading(true);
    try {
      await addFilesAsGroup(filesToUpload, newGroupName.trim(), currentUser.id);
      setGroupUploadModalOpen(false);
      setNewGroupName('');
      setFilesToUpload([]);
      alert('群組上傳成功');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知錯誤';
      alert('群組上傳失敗：' + message);
    } finally {
      setUploading(false);
    }
  };

  const handleGroupUploadModalCancel = () => {
    setGroupUploadModalOpen(false);
    setNewGroupName('');
    setFilesToUpload([]);
  };

  // 群組編輯相關
  const openGroupEditModal = (group: FileGroup) => {
    setSelectedGroupToEdit(group);
    setEditGroupName(group.name);
    setEditGroupFileIds(group.fileIds);
    setGroupEditModalOpen(true);
  };

  const handleGroupEditSave = () => {
    if (selectedGroupToEdit) {
      updateGroup(selectedGroupToEdit.id, {
        name: editGroupName,
        fileIds: editGroupFileIds,
      });
      setGroupEditModalOpen(false);
      setSelectedGroupToEdit(null);
      setEditGroupName('');
      setEditGroupFileIds([]);
    }
  };

  const handleGroupEditCancel = () => {
    setGroupEditModalOpen(false);
    setSelectedGroupToEdit(null);
    setEditGroupName('');
    setEditGroupFileIds([]);
  };

  const toggleFileInGroup = (fileId: number) => {
    setEditGroupFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const getGroupFiles = (group: FileGroup): UploadedFile[] => {
    return files.filter((f) => f.groupId === group.id);
  };

  // 建立新群組相關
  const openCreateGroupModal = () => {
    setCreateGroupName('');
    setCreateGroupFileIds([]);
    setCreateGroupModalOpen(true);
  };

  const handleCreateGroupSave = () => {
    if (!createGroupName.trim()) {
      alert('請輸入群組名稱');
      return;
    }
    if (createGroupFileIds.length === 0) {
      alert('請至少選擇一個檔案');
      return;
    }
    if (!currentUser) {
      alert('請先選擇受測者');
      return;
    }

    createGroup(createGroupName.trim(), createGroupFileIds, currentUser.id);
    setCreateGroupModalOpen(false);
    setCreateGroupName('');
    setCreateGroupFileIds([]);
    setActiveTab('groups');
  };

  const handleCreateGroupCancel = () => {
    setCreateGroupModalOpen(false);
    setCreateGroupName('');
    setCreateGroupFileIds([]);
  };

  const toggleFileInCreateGroup = (fileId: number) => {
    setCreateGroupFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 檔案群組編輯相關（從檔案列表編輯）
  const [fileGroupEditModalOpen, setFileGroupEditModalOpen] =
    useState<boolean>(false);
  const [selectedFileForGroup, setSelectedFileForGroup] =
    useState<UploadedFile | null>(null);
  const [selectedGroupIdForFile, setSelectedGroupIdForFile] =
    useState<string>('');

  const openFileGroupEditModal = (file: UploadedFile) => {
    setSelectedFileForGroup(file);
    setSelectedGroupIdForFile(file.groupId || '');
    setFileGroupEditModalOpen(true);
  };

  const handleFileGroupEditSave = () => {
    if (selectedFileForGroup) {
      const oldGroupId = selectedFileForGroup.groupId;
      const newGroupId = selectedGroupIdForFile || undefined;

      // 從舊群組移除
      if (oldGroupId && oldGroupId !== newGroupId) {
        const oldGroup = groups.find((g) => g.id === oldGroupId);
        if (oldGroup) {
          updateGroup(oldGroupId, {
            fileIds: oldGroup.fileIds.filter(
              (id) => id !== selectedFileForGroup.id
            ),
          });
        }
      }

      // 加入新群組
      if (newGroupId && newGroupId !== oldGroupId) {
        const newGroup = groups.find((g) => g.id === newGroupId);
        if (newGroup) {
          updateGroup(newGroupId, {
            fileIds: [...newGroup.fileIds, selectedFileForGroup.id],
          });
        }
      }

      setFileGroupEditModalOpen(false);
      setSelectedFileForGroup(null);
      setSelectedGroupIdForFile('');
    }
  };

  const handleFileGroupEditCancel = () => {
    setFileGroupEditModalOpen(false);
    setSelectedFileForGroup(null);
    setSelectedGroupIdForFile('');
  };

  return (
    <div className="container mx-auto">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link to="/">首頁</Link>
          </li>
          <li>腦波檔案管理</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold mb-6">腦波檔案管理</h1>

      {/* 上傳區域 */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="card-title">上傳腦波檔案</h2>
              <p className="text-sm text-base-content/60">
                僅支援 CSV 格式，可同時選擇多個檔案
              </p>
            </div>
            <button
              className="btn btn-ghost mt-2 sm:mt-0"
              onClick={() => setGroupUploadModalOpen(true)}
              disabled={!currentUser}
            >
              上傳腦波資料群組
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="w-full max-w-xs">
              <input
                id="single-file-input"
                type="file"
                accept=".csv"
                multiple
                className="file-input file-input-bordered w-full"
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-base-content/60 mt-1">
                  已選擇 {selectedFiles.length} 個檔案
                </p>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || !currentUser}
            >
              上傳檔案
            </button>
          </div>
          {!currentUser && (
            <div className="alert alert-warning mt-4">
              <span>
                請先選擇受測者。
                <Link to="/users" className="link link-primary ml-1">
                  前往受測者管理
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tab 切換 */}
      <div className="tabs tabs-boxed mb-4">
        <button
          className={`tab ${activeTab === 'files' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          所有檔案 ({files.length})
        </button>
        <button
          className={`tab ${activeTab === 'groups' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          腦波資料群組 ({groups.length})
        </button>
      </div>

      {/* 檔案列表 */}
      {activeTab === 'files' && (
        <>
          <h2 className="text-2xl font-bold mb-4">已上傳檔案</h2>
          {files.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <p>尚無檔案上傳</p>
              <p className="text-sm mt-2">請使用上方區塊上傳檔案</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>檔案名稱</th>
                    <th>群組</th>
                    <th>上傳時間</th>
                    <th>受測者</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => {
                    const group = file.groupId
                      ? groups.find((g) => g.id === file.groupId)
                      : null;
                    return (
                      <tr key={file.id}>
                        <td>
                          <Link
                            to={`/files/${file.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            <div className="font-medium">{file.alias}</div>
                            <div className="text-xs text-base-content/50">{file.fileName}</div>
                          </Link>
                        </td>
                        <td>
                          {group ? (
                            <span className="badge badge-outline badge-sm">
                              {group.name}
                            </span>
                          ) : (
                            <span className="text-base-content/40">-</span>
                          )}
                        </td>
                        <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                        <td>
                          {users.find((user) => user.id === file.userId)?.name ||
                            '未知'}
                        </td>
                        <td>
                          <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-sm btn-ghost btn-circle">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current">
                                <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                              </svg>
                            </label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40 border border-base-200">
                              <li>
                                <button onClick={() => {
                                  (document.activeElement as HTMLElement)?.blur();
                                  navigate(`/files/${file.id}`);
                                }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                  </svg>
                                  檢視
                                </button>
                              </li>
                              <li>
                                <button onClick={() => openAliasModal(file)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                  </svg>
                                  修改別稱
                                </button>
                              </li>
                              <li>
                                <button onClick={() => openFileGroupEditModal(file)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                  </svg>
                                  編輯群組
                                </button>
                              </li>
                              <li className="border-t border-base-200 mt-1 pt-1">
                                <button
                                  className="text-error hover:bg-error hover:text-white"
                                  onClick={() => {
                                    if (window.confirm('確定要刪除此檔案？')) {
                                      deleteFile(file.id);
                                    }
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                  刪除
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 群組列表 */}
      {activeTab === 'groups' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">腦波資料群組</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={openCreateGroupModal}
              disabled={!currentUser || files.length === 0}
            >
              建立新群組
            </button>
          </div>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <p>尚無腦波資料群組</p>
              <p className="text-sm mt-2">
                請點擊「建立新群組」或「上傳腦波資料群組」建立新群組
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => {
                const groupFiles = getGroupFiles(group);
                const owner = users.find((u) => u.id === group.userId);
                return (
                  <div key={group.id} className="card bg-base-100 shadow-md">
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <h3 className="card-title text-lg">{group.name}</h3>
                        <span className="badge badge-primary badge-sm">
                          {groupFiles.length} 個檔案
                        </span>
                      </div>
                      <div className="text-sm text-base-content/60 mt-2">
                        <p>建立時間：{new Date(group.createdAt).toLocaleString()}</p>
                        <p>所屬受測者：{owner?.name || '未知'}</p>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">包含檔案：</p>
                        <ul className="list-disc list-inside text-sm text-base-content/70">
                          {groupFiles.map((file) => (
                            <li key={file.id}>{file.alias || file.fileName}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-sm btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current">
                              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                            </svg>
                          </label>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40 border border-base-200">
                            <li>
                              <button onClick={() => openGroupEditModal(group)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                </svg>
                                編輯群組
                              </button>
                            </li>
                            <li className="border-t border-base-200 mt-1 pt-1">
                              <button
                                className="text-error hover:bg-error hover:text-white"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      '確定要刪除此群組？（檔案不會被刪除）'
                                    )
                                  ) {
                                    deleteGroup(group.id);
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                刪除群組
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 修改別稱 Modal */}
      {aliasModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleAliasModalCancel}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-6">修改檔案別稱</h3>
            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">別稱</span>
              </label>
              <input
                type="text"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                className="input input-underline w-full"
                placeholder="請輸入新別稱"
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={handleAliasModalCancel}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleAliasModalSave}>
                儲存
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleAliasModalCancel} />
        </div>
      )}

      {/* 群組上傳 Modal */}
      {groupUploadModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleGroupUploadModalCancel}
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
                <span className="label-text">選擇腦波檔案（可多選）</span>
              </label>
              <input
                type="file"
                accept=".csv"
                multiple
                className="file-input file-input-underline w-full"
                onChange={handleGroupFilesChange}
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
              <button
                className="btn btn-ghost"
                onClick={handleGroupUploadModalCancel}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGroupUpload}
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
          <div
            className="modal-backdrop"
            onClick={handleGroupUploadModalCancel}
          />
        </div>
      )}

      {/* 群組編輯 Modal */}
      {groupEditModalOpen && selectedGroupToEdit && (
        <div className="modal modal-open">
          <div className="modal-box relative max-w-2xl">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleGroupEditCancel}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-6">編輯群組</h3>

            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">群組名稱</span>
              </label>
              <input
                type="text"
                className="input input-underline w-full"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
              />
            </div>

            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">群組檔案</span>
                <span className="label-text-alt">
                  已選 {editGroupFileIds.length} 個檔案
                </span>
              </label>
              <div className="bg-base-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                {files.length === 0 ? (
                  <p className="text-sm text-base-content/60">尚無檔案</p>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <label
                        key={file.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-base-300 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={editGroupFileIds.includes(file.id)}
                          onChange={() => toggleFileInGroup(file.id)}
                        />
                        <span className="flex-1">
                          {file.alias || file.fileName}
                        </span>
                        {file.groupId &&
                          file.groupId !== selectedGroupToEdit.id && (
                            <span className="badge badge-outline badge-sm">
                              {groups.find((g) => g.id === file.groupId)?.name}
                            </span>
                          )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={handleGroupEditCancel}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleGroupEditSave}>
                儲存
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleGroupEditCancel} />
        </div>
      )}

      {/* 建立新群組 Modal */}
      {createGroupModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative max-w-2xl">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleCreateGroupCancel}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-6">建立腦波資料群組</h3>

            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">群組名稱</span>
              </label>
              <input
                type="text"
                className="input input-underline w-full"
                placeholder="請輸入群組名稱"
                value={createGroupName}
                onChange={(e) => setCreateGroupName(e.target.value)}
              />
            </div>

            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">選擇檔案</span>
                <span className="label-text-alt">
                  已選 {createGroupFileIds.length} 個檔案
                </span>
              </label>
              <div className="bg-base-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                {files.length === 0 ? (
                  <p className="text-sm text-base-content/60">尚無檔案可選擇</p>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <label
                        key={file.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-base-300 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={createGroupFileIds.includes(file.id)}
                          onChange={() => toggleFileInCreateGroup(file.id)}
                        />
                        <span className="flex-1">
                          {file.alias || file.fileName}
                        </span>
                        {file.groupId && (
                          <span className="badge badge-outline badge-sm">
                            {groups.find((g) => g.id === file.groupId)?.name}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-base-content/50 mt-2">
                檔案可同時屬於多個群組
              </p>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={handleCreateGroupCancel}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleCreateGroupSave}>
                建立群組
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCreateGroupCancel} />
        </div>
      )}

      {/* 檔案群組編輯 Modal */}
      {fileGroupEditModalOpen && selectedFileForGroup && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleFileGroupEditCancel}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-6">編輯檔案群組</h3>

            <div className="mb-6">
              <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-1">檔案</p>
              <p className="font-medium">
                {selectedFileForGroup.alias || selectedFileForGroup.fileName}
              </p>
            </div>

            <div className="form-control form-control-minimal">
              <label className="label label-minimal">
                <span className="label-text">所屬群組</span>
              </label>
              <select
                className="select select-underline w-full"
                value={selectedGroupIdForFile}
                onChange={(e) => setSelectedGroupIdForFile(e.target.value)}
              >
                <option value="">無群組</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.fileIds.length} 個檔案)
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={handleFileGroupEditCancel}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleFileGroupEditSave}
              >
                儲存
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleFileGroupEditCancel} />
        </div>
      )}
    </div>
  );
};

export default FileManagePage;
