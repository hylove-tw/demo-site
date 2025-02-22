// src/pages/FileManagePage.tsx
import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import {useFileManager, UploadedFile} from '../hooks/useFileManager';

const FileManagePage: React.FC = () => {
    const {files, uploadFile, updateFileAlias, deleteFile} = useFileManager();
    // 預覽資料，可用來顯示上傳檔案的部分內容（例如前 5 筆）
    const [previewData, setPreviewData] = useState<any[][] | null>(null);
    // 管理修改別名的狀態
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newAlias, setNewAlias] = useState<string>('');

    // 當上傳檔案後，更新檔案清單與（選擇性）顯示預覽資料
    const handleFileUpload = async (file: File) => {
        try {
            await uploadFile(file);
            // 可依需求設定預覽資料，例如取回最新上傳的檔案的前 5 筆資料
            // 若不需要即可保持 null
            // 這裡僅示範將預覽資料清空
            setPreviewData(null);
        } catch (error: any) {
            alert(error.message || '檔案上傳失敗');
        }
    };

    // 開始修改指定檔案的別名
    const startEditing = (file: UploadedFile) => {
        setEditingId(file.id);
        setNewAlias(file.alias || file.fileName);
    };

    // 確認更新檔案別名
    const handleUpdateAlias = (id: number) => {
        updateFileAlias(id, newAlias);
        setEditingId(null);
    };

    // 預覽檔案資料：將檔案的 data 設定到 previewData 狀態中，並可在畫面中顯示
    const handlePreviewData = (file: UploadedFile) => {
        setPreviewData(file.data);
    };

    return (
        <div>
            <h1>上傳與管理檔案</h1>

            {/* 上傳區塊 */}
            <div>
                <h2>上傳 Excel 檔案</h2>
                <FileUploader onUpload={handleFileUpload}/>
                {previewData && (
                    <div style={{marginTop: '1rem'}}>
                        <h3>資料預覽 (僅顯示前 5 筆)</h3>
                        <pre>{JSON.stringify(previewData.slice(0, 5), null, 2)}</pre>
                    </div>
                )}
            </div>

            {/* 檔案清單管理區塊 */}
            <div style={{marginTop: '2rem'}}>
                <h2>已上傳檔案清單</h2>
                {files.length === 0 ? (
                    <p>尚無上傳檔案</p>
                ) : (
                    <ul>
                        {files.map((file) => (
                            <li key={file.id} style={{marginBottom: '1rem'}}>
                                <Link to={`/files/${file.id}`}>
                                    <strong>{file.alias}</strong>
                                </Link>（{file.fileName}）
                                <br/>
                                上傳時間：{new Date(file.uploadedAt).toLocaleString()}
                                <br/>
                                <button onClick={() => startEditing(file)}>修改別名</button>
                                {' '}
                                <button onClick={() => deleteFile(file.id)}>刪除</button>
                                {' '}
                                <button onClick={() => handlePreviewData(file)}>預覽資料</button>
                                {editingId === file.id && (
                                    <div>
                                        <input
                                            type="text"
                                            value={newAlias}
                                            onChange={(e) => setNewAlias(e.target.value)}
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