// src/pages/AnalysisPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFileManager, UploadedFile } from "../hooks/useFileManager";
import { getPlugins, AnalysisPlugin } from "../analysis/registry";
import { useUserContext } from "../context/UserContext";
import {
  useAnalysisManager,
  AnalysisHistory,
} from "../hooks/useAnalysisManager";

export enum Status {
  Success = "成功",
  Failure = "失敗",
}

const AnalysisPage: React.FC = () => {
  const { files } = useFileManager();
  const { currentUser, users } = useUserContext();
  const {
    history,
    addHistoryRecord,
    removeHistoryRecord,
    updateHistoryRecord,
  } = useAnalysisManager();

  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisPlugin | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<(number | null)[]>([]);
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterAnalysisId, setFilterAnalysisId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAnalysisId, history]);

  // 當選擇的分析功能改變時，初始化檔案選擇欄位與自訂參數
  useEffect(() => {
    if (selectedAnalysis) {
      setSelectedFileIds(
        Array(selectedAnalysis.requiredFiles.length).fill(null),
      );
      if (selectedAnalysis.customFields) {
        const defaults: Record<string, any> = {};
        selectedAnalysis.customFields.forEach((field) => {
          defaults[field.fieldName] = field.defaultValue;
        });
        setCustomParams(defaults);
      } else {
        setCustomParams({});
      }
      setDescription("");
    } else {
      setSelectedFileIds([]);
      setCustomParams({});
      setDescription("");
    }
  }, [selectedAnalysis]);

  const handleAnalysisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const analysisId = e.target.value;
    const analysis = getPlugins().find((fn) => fn.id === analysisId) || null;
    setSelectedAnalysis(analysis);
  };

  const handleFileSelection = (index: number, fileId: number) => {
    const newSelections = [...selectedFileIds];
    newSelections[index] = fileId;
    setSelectedFileIds(newSelections);
  };

  const handleAnalyze = async () => {
    setError(null);
    if (!selectedAnalysis) {
      alert("請先選擇分析功能");
      return;
    }
    if (selectedFileIds.some((id) => id === null)) {
      alert(
        `請選擇所有檔案：需要 ${selectedAnalysis.requiredFiles.length} 個檔案`,
      );
      return;
    }
    // 根據所選檔案 id 取得檔案資料
    const selectedFiles: UploadedFile[] = [];
    for (const id of selectedFileIds as number[]) {
      const file = files.find((f) => f.id === id);
      if (!file) {
        alert("選擇的檔案不存在，請重新選擇");
        return;
      }
      selectedFiles.push(file);
    }
    // 合併所有檔案資料（以 concat 合併二維陣列）
    let combinedData: any[][] = [];
    selectedFiles.forEach((file) => {
      combinedData = combinedData.concat(file.data);
    });

    setLoading(true);
    try {
      const result = await selectedAnalysis.execute(combinedData, customParams);
      // 建立新的分析歷史紀錄（成功）
      const newRecord: AnalysisHistory = {
        id: Date.now(),
        analysisId: selectedAnalysis.id,
        analysisName: selectedAnalysis.name,
        selectedFileIds: selectedFileIds as number[],
        result,
        timestamp: new Date().toISOString(),
        userId: currentUser ? currentUser.id : "unknown",
        status: Status.Success,
        // 假設在 history 中也儲存使用者自訂欄位
        customParams,
        description,
      };
      addHistoryRecord(newRecord);
      setDescription("");
    } catch (err: any) {
      setError(err.message || "分析失敗");
      // 失敗也記錄下來
      const newRecord: AnalysisHistory = {
        id: Date.now(),
        analysisId: selectedAnalysis.id,
        analysisName: selectedAnalysis.name,
        selectedFileIds: selectedFileIds as number[],
        result: err.message || "未知錯誤",
        timestamp: new Date().toISOString(),
        userId: currentUser ? currentUser.id : "unknown",
        status: Status.Failure,
        customParams,
        description,
      };
      addHistoryRecord(newRecord);
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  // 產生檔案選擇欄位
  const renderFileSelections = () => {
    return selectedAnalysis?.requiredFiles.map((reqFile, index) => (
      <div key={index} className="form-control mb-2">
        <label className="label">
          <span className="label-text">{reqFile.verbose_name}</span>
        </label>
        <select
          className="select select-bordered"
          value={selectedFileIds[index] || ""}
          onChange={(e) => handleFileSelection(index, Number(e.target.value))}
        >
          <option value="">{`請選擇 ${reqFile.verbose_name}`}</option>
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.alias || file.fileName}
            </option>
          ))}
        </select>
      </div>
    ));
  };

  // 若選擇的分析功能有自訂欄位，則顯示其編輯元件
  const renderCustomFields = () => {
    if (selectedAnalysis && selectedAnalysis.editComponent) {
      const EditComponent = selectedAnalysis.editComponent;
      return (
        <div className="mb-4">
          <EditComponent
            customParams={customParams}
            onChange={setCustomParams}
          />
        </div>
      );
    }
    return null;
  };

  const filteredHistory = history.filter((record) => {
    if (filterAnalysisId && record.analysisId !== filterAnalysisId) {
      return false;
    }
    if (!searchTerm) return true;
    const userForRecord = users.find((u) => u.id === record.userId);
    const fileNames = record.selectedFileIds
      .map((id) => {
        const f = files.find((fl) => fl.id === id);
        return f?.alias || f?.fileName || "";
      })
      .join(" ");
    const target =
      `${record.analysisName} ${userForRecord?.name || ""} ${fileNames} ${record.description || ""}`.toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const renderPagination = () => (
    <div className="flex justify-center mt-4">
      <div className="btn-group">
        <button
          className="btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          上一頁
        </button>
        <button className="btn" disabled>
          第 {currentPage} / {totalPages || 1} 頁
        </button>
        <button
          className="btn"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() =>
            setCurrentPage((p) =>
              Math.min(totalPages === 0 ? 1 : totalPages, p + 1),
            )
          }
        >
          下一頁
        </button>
      </div>
    </div>
  );

  // 使用 DaisyUI 樣式顯示分析歷史
  const renderHistoryTable = () => (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>分析時間</th>
            <th>分析功能</th>
            <th>使用者</th>
            <th>描述</th>
            <th>選擇檔案</th>
            <th>結果</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {paginatedHistory.map((record) => {
            const userForRecord = users.find((u) => u.id === record.userId);
            return (
              <tr key={record.id}>
                <td>{new Date(record.timestamp).toLocaleString()}</td>
                <td>{record.analysisName}</td>
                <td>{userForRecord ? userForRecord.name : record.userId}</td>
                <td>{record.description || ""}</td>
                <td>
                  {record.selectedFileIds.map((fileId, index) => {
                    const file = files.find((f) => f.id === fileId);
                    return (
                      <span key={index} className="mr-2">
                        <Link
                          className="badge badge-outline badge-sm"
                          to={`/files/${file?.id}`}
                        >
                          {file?.alias || file?.fileName}
                        </Link>
                      </span>
                    );
                  })}
                </td>
                <td>
                  {record.status === Status.Success ? (
                    <span className="badge badge-success">
                      {Status.Success}
                    </span>
                  ) : (
                    <span className="badge badge-error">{Status.Failure}</span>
                  )}
                </td>
                <td>
                  <div className="flex space-x-2">
                    {record.status === Status.Success ? (
                      <Link
                        to={`/analysis/report/${record.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        檢視報告
                      </Link>
                    ) : (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleAnalyze()}
                      >
                        重試
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        const desc = prompt(
                          "更新描述",
                          record.description || "",
                        );
                        if (desc !== null) {
                          updateHistoryRecord(record.id, {
                            ...record,
                            description: desc,
                          });
                        }
                      }}
                    >
                      編輯
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => removeHistoryRecord(record.id)}
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">腦波分析</h1>
      <div className="card bg-base-100 shadow-md mb-6 p-4">
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">選擇分析功能</span>
          </label>
          <select
            className="select select-bordered"
            value={selectedAnalysis?.id || ""}
            onChange={handleAnalysisChange}
          >
            <option value="">請選擇分析功能</option>
            {getPlugins().map((config) => (
              <option key={config.id} value={config.id}>
                {config.name} (需 {config.requiredFiles.length} 個檔案)
              </option>
            ))}
          </select>
        </div>

        {selectedAnalysis && (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {selectedAnalysis.group
                ? `${selectedAnalysis.group} - ${selectedAnalysis.name}`
                : selectedAnalysis.name}
            </h2>
            <p className="mb-4">{selectedAnalysis.description}</p>
            {/* 檔案選擇欄位 */}
            {renderFileSelections()}
            {/* 自訂欄位編輯介面 */}
            {renderCustomFields()}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">分析描述</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="輸入此分析的描述"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? "分析中..." : "開始分析"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-2">分析歷史紀錄</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">篩選分析功能</span>
          </label>
          <select
            className="select select-bordered"
            value={filterAnalysisId}
            onChange={(e) => setFilterAnalysisId(e.target.value)}
          >
            <option value="">全部</option>
            {getPlugins().map((config) => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">搜尋</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            placeholder="輸入關鍵字"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredHistory.length === 0 ? (
        <p>找不到符合的歷史紀錄</p>
      ) : (
        renderHistoryTable()
      )}
    </div>
  );
};

export default AnalysisPage;
