// src/pages/AnalysisDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPlugins, AnalysisPlugin } from '../analysis/registry';
import { useFileManager, UploadedFile } from '../hooks/useFileManager';
import { useUserContext } from '../context/UserContext';
import {
  useAnalysisManager,
  AnalysisHistory,
} from '../hooks/useAnalysisManager';
import { Status } from './AnalysisPage';
import FileGroupSelector from '../components/FileGroupSelector';

const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { files } = useFileManager();
  const { currentUser, users } = useUserContext();
  const { history, addHistoryRecord, removeHistoryRecord } = useAnalysisManager();

  const [plugin, setPlugin] = useState<AnalysisPlugin | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<(number | null)[]>([]);
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // 篩選出屬於當前分析功能的歷史紀錄
  const pluginHistory = history.filter((record) => record.analysisId === id);

  useEffect(() => {
    const foundPlugin = getPlugins().find((p) => p.id === id);
    if (foundPlugin) {
      setPlugin(foundPlugin);
      setSelectedFileIds(Array(foundPlugin.requiredFiles.length).fill(null));
      if (foundPlugin.customFields) {
        const defaults: Record<string, any> = {};
        foundPlugin.customFields.forEach((field) => {
          defaults[field.fieldName] = field.defaultValue;
        });
        setCustomParams(defaults);
      } else {
        setCustomParams({});
      }
    } else {
      setPlugin(null);
    }
  }, [id]);

  const handleFileSelection = (index: number, fileId: number) => {
    const newSelections = [...selectedFileIds];
    newSelections[index] = fileId;
    setSelectedFileIds(newSelections);
  };

  const handleGroupSelect = (fileIds: number[]) => {
    setSelectedFileIds(fileIds);
  };

  const handleAnalyze = async () => {
    setError(null);
    if (!plugin) {
      alert('找不到分析功能');
      return;
    }
    if (!currentUser) {
      alert('請先選擇使用者');
      return;
    }
    if (selectedFileIds.some((fid) => fid === null)) {
      alert(`請選擇所有檔案：需要 ${plugin.requiredFiles.length} 個檔案`);
      return;
    }

    const selectedFiles: UploadedFile[] = [];
    for (const fid of selectedFileIds as number[]) {
      const file = files.find((f) => f.id === fid);
      if (!file) {
        alert('選擇的檔案不存在，請重新選擇');
        return;
      }
      selectedFiles.push(file);
    }

    let combinedData: any[][] = [];
    selectedFiles.forEach((file) => {
      combinedData = combinedData.concat(file.data);
    });

    setLoading(true);
    try {
      const result = await plugin.execute(combinedData, customParams);
      const newRecord: AnalysisHistory = {
        id: Date.now(),
        analysisId: plugin.id,
        analysisName: plugin.name,
        selectedFileIds: selectedFileIds as number[],
        result,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        status: Status.Success,
        customParams,
        description,
      };
      addHistoryRecord(newRecord);
      navigate(`/analysis/report/${newRecord.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '分析失敗';
      setError(message);
      const newRecord: AnalysisHistory = {
        id: Date.now(),
        analysisId: plugin.id,
        analysisName: plugin.name,
        selectedFileIds: selectedFileIds as number[],
        result: message,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        status: Status.Failure,
        customParams,
        description,
      };
      addHistoryRecord(newRecord);
    } finally {
      setLoading(false);
    }
  };

  if (!plugin) {
    return (
      <div className="container mx-auto">
        <div className="alert alert-error">
          <span>找不到此分析功能</span>
        </div>
        <Link to="/" className="btn btn-ghost mt-4">
          返回首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link to="/">首頁</Link>
          </li>
          {plugin.group && <li>{plugin.group}</li>}
          <li>{plugin.name}</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        {plugin.group ? `${plugin.group} - ${plugin.name}` : plugin.name}
      </h1>
      <p className="text-base-content/70 mb-6">{plugin.description}</p>

      {/* 設定卡片 */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title mb-4">分析設定</h2>

          {/* 檔案選擇 */}
          <div className="space-y-4">
            <h3 className="font-semibold">選擇檔案</h3>
            {currentUser ? (
              <FileGroupSelector
                requiredFileCount={plugin.requiredFiles.length}
                requiredFileLabels={plugin.requiredFiles.map(
                  (rf) => rf.verbose_name
                )}
                selectedFileIds={selectedFileIds}
                onFileSelect={handleFileSelection}
                onGroupSelect={handleGroupSelect}
                userId={currentUser.id}
              />
            ) : (
              <div className="alert alert-warning">
                <span>
                  請先選擇使用者。
                  <Link to="/users" className="link link-primary ml-1">
                    前往使用者管理
                  </Link>
                </span>
              </div>
            )}
          </div>

          {/* 自訂參數 */}
          {plugin.editComponent && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">自訂參數</h3>
              <plugin.editComponent
                customParams={customParams}
                onChange={setCustomParams}
              />
            </div>
          )}

          {/* 描述 */}
          <div className="form-control form-control-minimal mt-6">
            <label className="label label-minimal">
              <span className="label-text">分析描述</span>
              <span className="label-text-alt">選填</span>
            </label>
            <textarea
              className="textarea textarea-underline w-full"
              placeholder="輸入此次分析的描述或備註"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}

          {/* 執行按鈕 */}
          <div className="card-actions justify-end mt-6">
            <Link to="/" className="btn btn-ghost">
              取消
            </Link>
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !currentUser}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  分析中...
                </>
              ) : (
                '開始分析'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 分析歷史紀錄 */}
      <div className="card bg-base-100 shadow-md mt-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-5 hover:bg-base-200 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-medium">分析歷史</h3>
              <p className="text-sm text-base-content/60">{pluginHistory.length} 筆紀錄</p>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-base-content/40 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showHistory && (
          <div className="border-t border-base-200">
            {pluginHistory.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium">尚無分析紀錄</p>
                <p className="text-sm text-base-content/60 mt-1">完成分析後紀錄將顯示於此</p>
              </div>
            ) : (
              <div className="divide-y divide-base-200">
                {pluginHistory.map((record) => {
                  const userForRecord = users.find((u) => u.id === record.userId);
                  return (
                    <div key={record.id} className="p-4 hover:bg-base-200/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {record.description || '無描述'}
                            </span>
                            {record.status === Status.Success ? (
                              <span className="badge badge-success badge-sm">完成</span>
                            ) : (
                              <span className="badge badge-error badge-sm">失敗</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60 mb-2">
                            <span>{userForRecord?.name || '未知使用者'}</span>
                            <span>·</span>
                            <span>{new Date(record.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {record.selectedFileIds.map((fileId, index) => {
                              const file = files.find((f) => f.id === fileId);
                              return (
                                <Link
                                  key={index}
                                  to={`/files/${file?.id}`}
                                  className="badge badge-ghost"
                                >
                                  {file?.alias || file?.fileName || '未知'}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {record.status === Status.Success ? (
                            <Link
                              to={`/analysis/report/${record.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              檢視
                            </Link>
                          ) : (
                            <span className="btn btn-ghost btn-sm btn-disabled">失敗</span>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('確定要刪除此紀錄嗎？')) {
                                removeHistoryRecord(record.id);
                              }
                            }}
                            className="btn btn-ghost btn-sm text-error"
                            title="刪除紀錄"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDetailPage;
