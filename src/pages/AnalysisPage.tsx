// src/pages/AnalysisPage.tsx
import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useFileManager, UploadedFile} from '../hooks/useFileManager';
import {analysisConfigs, AnalysisConfig, AnalysisOptions} from '../config/analysisConfigs';

export enum Status {
    Success = '成功',
    Failure = '失敗',
}

export interface AnalysisHistory {
    id: number;
    analysisId: string;
    analysisName: string;
    selectedFileIds: number[];
    result: any;
    timestamp: string;
    status: Status;
}

const ANALYSIS_HISTORY_KEY = 'analysisHistory';

function getAnalysisHistory(): AnalysisHistory[] {
    const stored = window.localStorage.getItem(ANALYSIS_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveAnalysisHistory(history: AnalysisHistory[]) {
    window.localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(history));
}

const AnalysisPage: React.FC = () => {
    const {files} = useFileManager();
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisConfig | null>(null);
    const [selectedFileIds, setSelectedFileIds] = useState<(number | null)[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);

    useEffect(() => {
        setAnalysisHistory(getAnalysisHistory());
    }, []);

    // 當選擇的分析功能改變時，初始化對應數量的檔案選擇欄位
    useEffect(() => {
        if (selectedAnalysis) {
            setSelectedFileIds(Array(selectedAnalysis.requiredFiles.length).fill(null));
        } else {
            setSelectedFileIds([]);
        }
    }, [selectedAnalysis]);

    const handleAnalysisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const analysisId = e.target.value;
        const analysis = analysisConfigs.find(fn => fn.id === analysisId) || null;
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
        if (selectedFileIds.some(id => id === null)) {
            alert(`請選擇所有檔案：需要 ${selectedAnalysis.requiredFiles.length} 個檔案`);
            return;
        }
        // 根據所選檔案 id 取得檔案資料
        const selectedFiles: UploadedFile[] = [];
        for (const id of selectedFileIds as number[]) {
            const file = files.find(f => f.id === id);
            if (!file) {
                alert("選擇的檔案不存在，請重新選擇");
                return;
            }
            selectedFiles.push(file);
        }
        // 合併所有選取檔案的資料（根據需求可做其他處理）
        let combinedData: any[][] = [];
        selectedFiles.forEach(file => {
            combinedData = combinedData.concat(file.data);
        });

        console.log(combinedData)

        setLoading(true);
        try {
            // 呼叫所選分析功能的分析方法
            const result = await selectedAnalysis.func(combinedData);

            // 建立新的分析歷史紀錄（成功）
            const newRecord: AnalysisHistory = {
                id: Date.now(),
                analysisId: selectedAnalysis.id,
                analysisName: selectedAnalysis.name,
                selectedFileIds: selectedFileIds as number[],
                result,
                timestamp: new Date().toISOString(),
                status: Status.Success
            };
            const updatedHistory = [newRecord, ...analysisHistory];
            setAnalysisHistory(updatedHistory);
            saveAnalysisHistory(updatedHistory);
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
                status: Status.Failure
            };
            const updatedHistory = [newRecord, ...analysisHistory];
            setAnalysisHistory(updatedHistory);
            saveAnalysisHistory(updatedHistory);
        } finally {
            setLoading(false);
        }
    };

    // 根據歷史紀錄中的 selectedFileIds 取得檔案資訊連結
    const renderSelectedFiles = (record: AnalysisHistory) => {
        return record.selectedFileIds.map((id, index) => {
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
                    {index < record.selectedFileIds.length - 1 && ", "}
        </span>
            );
        });
    };

    const handleRetry = (recordId: number) => {
        const record = analysisHistory.find(r => r.id === recordId);
        if (record) {
            const selectedFiles = record.selectedFileIds.map(id => files.find(f => f.id === id));
            if (selectedFiles.some(f => !f)) {
                alert("選擇的檔案不存在，無法重試");
                return;
            }
            const combinedData: any[][] = selectedFiles.map(f => f!.data).reduce((acc, data) => acc.concat(data), []);
            setLoading(true);
            setError(null);
            try {
                const result = selectedAnalysis?.func(combinedData);
                if (result) {
                    const updatedRecord = {...record, result, status: Status.Success};
                    const updatedHistory = analysisHistory.map(r => (r.id === recordId ? updatedRecord : r));
                    setAnalysisHistory(updatedHistory);
                    saveAnalysisHistory(updatedHistory);
                } else {
                    throw new Error("分析失敗");
                }
            } catch (err: any) {
                setError(err.message || "分析失敗");
                const updatedRecord = {...record, result: err.message || "未知錯誤", status: Status.Failure};
                const updatedHistory = analysisHistory.map(r => (r.id === recordId ? updatedRecord : r));
                setAnalysisHistory(updatedHistory);
                saveAnalysisHistory(updatedHistory);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleDeleteRecord = (recordId: number) => {
        if (window.confirm("確定刪除該分析紀錄嗎？")) {
            const updatedHistory = analysisHistory.filter(record => record.id !== recordId);
            setAnalysisHistory(updatedHistory);
            saveAnalysisHistory(updatedHistory);
        }
    };

    return (
        <div>
            <h1>腦波分析</h1>
            {/* 分析功能選擇 */}
            <div>
                <label>選擇分析功能：</label>
                <select value={selectedAnalysis?.id || ""} onChange={handleAnalysisChange}>
                    <option value="">請選擇分析功能</option>
                    <AnalysisOptions/>
                </select>
            </div>

            {/* 根據所選功能，動態產生檔案選擇欄位 */}
            {selectedAnalysis && (
                <div>
                    {/* 如果有 group 則同時顯示 group 與 name */}
                    <h2>
                        已選擇：
                        {selectedAnalysis.group
                            ? `${selectedAnalysis.group} - ${selectedAnalysis.name}`
                            : selectedAnalysis.name}
                    </h2>
                    <p>{selectedAnalysis.description}</p>
                    <h3>請選擇所需的檔案</h3>
                    {selectedAnalysis.requiredFiles.map((reqFile, index) => (
                        <div key={index}>
                            <label>{reqFile.verbose_name}：</label>
                            <select
                                value={selectedFileIds[index] || ""}
                                onChange={(e) => handleFileSelection(index, Number(e.target.value))}
                            >
                                <option value="">{`請選擇 ${reqFile.verbose_name}`}</option>
                                {files.map(file => (
                                    <option key={file.id} value={file.id}>
                                        {file.alias || file.fileName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            <div style={{marginTop: "1rem"}}>
                <button onClick={handleAnalyze} disabled={!selectedAnalysis}>開始分析</button>
            </div>

            {loading && <p>分析中，請稍候...</p>}
            {error && <p style={{color: "red"}}>{error}</p>}

            {/* 分析歷史紀錄區 */}
            <div style={{marginTop: "2rem"}}>
                <h2>分析歷史紀錄</h2>
                {analysisHistory.length === 0 ? (
                    <p>尚無分析歷史</p>
                ) : (
                    <table border={1} cellPadding={5}>
                        <thead>
                        <tr>
                            <th>分析時間</th>
                            <th>分析功能</th>
                            <th>選擇檔案</th>
                            <th>結果</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {analysisHistory.map(record => (
                            <tr key={record.id}>
                                <td>{new Date(record.timestamp).toLocaleString()}</td>
                                <td>{record.analysisName}</td>
                                <td>{renderSelectedFiles(record)}</td>
                                <td>{record.status}</td>
                                <td>
                                    {/* if status is '成功', show link */}
                                    {record.status === Status.Success && (
                                        <Link to={`/analysis/report/${record.id}`}>瀏覽報告</Link>
                                    )}
                                    {/* if status is '失敗', show retry button */}
                                    {record.status === Status.Failure && (
                                        <button onClick={() => handleRetry(record.id)}>重試</button>
                                    )}
                                    {/* show delete button */}
                                    <button onClick={() => handleDeleteRecord(record.id)}>刪除</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AnalysisPage;