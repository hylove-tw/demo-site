// src/pages/AnalysisHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFileManager } from '../hooks/useFileManager';
import { getPlugins } from '../analysis/registry';
import { useUserContext } from '../context/UserContext';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { Status } from './AnalysisPage';

// 群組樣式
const groupMeta: Record<string, { badgeClass: string }> = {
  '主要功能': { badgeClass: 'badge-primary' },
  '利養炁': { badgeClass: 'badge-secondary' },
  '易 Motion': { badgeClass: 'badge-accent' },
};

const AnalysisHistoryPage: React.FC = () => {
  const { files } = useFileManager();
  const { users } = useUserContext();
  const { history, removeHistoryRecord, updateHistoryRecord } = useAnalysisManager();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAnalysisId, setFilterAnalysisId] = useState<string>('all');
  const [filterUserId, setFilterUserId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const plugins = getPlugins();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAnalysisId, filterUserId, filterStatus, history]);

  const filteredHistory = history.filter((record) => {
    if (filterAnalysisId !== 'all' && record.analysisId !== filterAnalysisId) {
      return false;
    }
    if (filterUserId !== 'all' && record.userId !== filterUserId) {
      return false;
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'success' && record.status !== Status.Success) return false;
      if (filterStatus === 'failure' && record.status !== Status.Failure) return false;
    }
    if (!searchTerm) return true;
    const userForRecord = users.find((u) => u.id === record.userId);
    const fileNames = record.selectedFileIds
      .map((id) => {
        const f = files.find((fl) => fl.id === id);
        return f?.alias || f?.fileName || '';
      })
      .join(' ');
    const target =
      `${record.analysisName} ${userForRecord?.name || ''} ${fileNames} ${record.description || ''}`.toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const allCount = history.length;
  const successCount = history.filter((r) => r.status === Status.Success).length;
  const failureCount = history.filter((r) => r.status === Status.Failure).length;

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAnalysisId('all');
    setFilterUserId('all');
    setFilterStatus('all');
  };

  const hasActiveFilters = searchTerm || filterAnalysisId !== 'all' || filterUserId !== 'all';

  return (
    <div className="container mx-auto max-w-5xl">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link to="/">首頁</Link>
          </li>
          <li>分析歷史</li>
        </ul>
      </div>

      {/* 標題區 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">分析歷史紀錄</h1>
        <Link to="/" className="btn btn-primary btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新增分析
        </Link>
      </div>

      {/* 主要內容區 */}
      <div className="card bg-base-100 shadow-md overflow-hidden">
        {/* 狀態標籤頁 */}
        <div className="flex border-b border-base-200">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filterStatus === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            全部
            <span className="badge badge-sm">{allCount}</span>
          </button>
          <button
            onClick={() => setFilterStatus('success')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filterStatus === 'success'
                ? 'border-success text-success'
                : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            成功
            <span className="badge badge-success badge-sm">{successCount}</span>
          </button>
          <button
            onClick={() => setFilterStatus('failure')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filterStatus === 'failure'
                ? 'border-error text-error'
                : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            失敗
            <span className="badge badge-error badge-sm">{failureCount}</span>
          </button>
        </div>

        {/* 搜尋與篩選列 */}
        <div className="p-4 bg-base-200/30 border-b border-base-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜尋框 */}
            <div className="flex-1">
              <input
                type="text"
                className="input input-underline w-full"
                placeholder="搜尋分析名稱、描述、檔案..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 篩選下拉選單 */}
            <div className="flex gap-3">
              <select
                className="select select-underline min-w-[120px]"
                value={filterAnalysisId}
                onChange={(e) => setFilterAnalysisId(e.target.value)}
              >
                <option value="all">所有功能</option>
                {plugins.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                className="select select-underline min-w-[120px]"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              >
                <option value="all">所有受測者</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 篩選狀態提示 */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 text-sm">
              <span className="text-base-content/60">
                找到 {filteredHistory.length} 筆結果
              </span>
              <button
                onClick={clearFilters}
                className="link link-primary"
              >
                清除篩選
              </button>
            </div>
          )}
        </div>

        {/* 歷史列表 */}
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium">
              {hasActiveFilters ? '沒有符合條件的紀錄' : '尚無分析紀錄'}
            </p>
            <p className="text-sm text-base-content/60 mt-1">
              {hasActiveFilters ? '嘗試調整篩選條件' : '開始執行分析以建立紀錄'}
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn btn-ghost btn-sm mt-4">
                清除篩選
              </button>
            ) : (
              <Link to="/" className="btn btn-primary btn-sm mt-4">
                前往分析
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-base-200">
              {paginatedHistory.map((record) => {
                const userForRecord = users.find((u) => u.id === record.userId);
                const plugin = plugins.find((p) => p.id === record.analysisId);
                const group = plugin?.group || '主要功能';
                return (
                  <div key={record.id} className="p-4 hover:bg-base-200/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* 狀態圖示 */}
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        record.status === Status.Success ? 'bg-success/20' : 'bg-error/20'
                      }`}>
                        {record.status === Status.Success ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>

                      {/* 內容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`badge badge-sm ${groupMeta[group]?.badgeClass || 'badge-ghost'}`}>
                            {group}
                          </span>
                          <Link
                            to={`/analysis/${record.analysisId}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {record.analysisName}
                          </Link>
                          <span className="text-base-content/40">·</span>
                          <span className="text-sm text-base-content/60">
                            {record.description || '無描述'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-base-content/60">
                          <span className="inline-flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {userForRecord?.name || '未知'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(record.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {record.selectedFileIds.map((fileId, index) => {
                            const file = files.find((f) => f.id === fileId);
                            return (
                              <Link
                                key={index}
                                to={`/files/${file?.id}`}
                                className="badge badge-ghost badge-sm"
                              >
                                {file?.alias || file?.fileName || '未知'}
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* 操作按鈕 */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {record.status === Status.Success ? (
                          <Link
                            to={`/analysis/report/${record.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            檢視
                          </Link>
                        ) : (
                          <Link
                            to={`/analysis/${record.analysisId}`}
                            className="btn btn-ghost btn-sm"
                          >
                            重試
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            const desc = window.prompt('更新描述', record.description || '');
                            if (desc !== null) {
                              updateHistoryRecord(record.id, { ...record, description: desc });
                            }
                          }}
                          className="btn btn-ghost btn-sm btn-square"
                          title="編輯描述"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('確定要刪除此紀錄嗎？')) {
                              removeHistoryRecord(record.id);
                            }
                          }}
                          className="btn btn-ghost btn-sm btn-square text-error"
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

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-base-200 bg-base-200/30">
                <span className="text-sm text-base-content/60">
                  第 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredHistory.length)} 筆，共 {filteredHistory.length} 筆
                </span>
                <div className="join">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-sm join-item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="btn btn-sm join-item btn-disabled">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm join-item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisHistoryPage;
