// src/pages/AnalysisPage.tsx
import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useFileManager, UploadedFile} from '../hooks/useFileManager';
import {analysisConfigs, AnalysisFunctionConfig} from '../config/analysisConfigs';

export interface AnalysisHistory {
    id: number;
    analysisId: string;
    analysisName: string;
    selectedFileIds: number[];
    result: any;
    timestamp: string;
    status: '成功' | '失敗';
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
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisFunctionConfig | null>(null);
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
                status: '成功'
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
                status: '失敗'
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

    const handleDeleteRecord = (recordId: number) => {
        if (window.confirm("確定刪除該分析紀錄嗎？")) {
            const updatedHistory = analysisHistory.filter(record => record.id !== recordId);
            setAnalysisHistory(updatedHistory);
            saveAnalysisHistory(updatedHistory);
        }
    };

    return (
        <div>
            <h1>檔案分析</h1>

            {/* 分析功能選擇 */}
            <div>
                <label>選擇分析功能：</label>
                <select value={selectedAnalysis?.id || ""} onChange={handleAnalysisChange}>
                    <option value="">請選擇分析功能</option>
                    {analysisConfigs.map(fn => (
                        <option key={fn.id} value={fn.id}>
                            {fn.name} (需 {fn.requiredFiles.length} 個檔案)
                        </option>
                    ))}
                </select>
            </div>

            {/* 根據所選功能，動態產生檔案選擇欄位 */}
            {selectedAnalysis && (
                <div>
                    <h2>請選擇所需的檔案</h2>
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
                <button onClick={handleAnalyze}>分析</button>
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
                                    <Link to={`/analysis/report/${record.id}`}>瀏覽報告</Link>{" "}
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