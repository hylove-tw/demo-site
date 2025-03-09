// src/hooks/useFileManager.ts
import { useState, useEffect } from 'react';
import { transformCSVDataToPayload } from '../utils/transformCSVDataToPayload';
import { transformExcelDataToPayload } from '../utils/transformExcelDataToPayload';

export interface UploadedFile {
  id: number;
  fileName: string;
  alias: string;
  uploadedAt: string;
  data: any[][]; // 解析後的資料（例如二維陣列）
  userId: string; // 已更新：該檔案所屬的使用者 ID
}
export function useFileManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // 從 localStorage 載入檔案列表（如果存在）
  useEffect(() => {
    const stored = localStorage.getItem("uploadedFiles");
    if (stored) {
      setFiles(JSON.parse(stored));
    }
  }, []);

  const saveFiles = (files: UploadedFile[]) => {
    localStorage.setItem("uploadedFiles", JSON.stringify(files));
  };

  /**
   * addFile: 上傳檔案並解析
   * @param file 原始檔案（CSV 或 XLSX）
   * @param userId 使用者 ID，表示此檔案屬於哪個使用者
   */
  const addFile = async (file: File, userId: string): Promise<void> => {
    let payload: any[][] = [];
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".csv")) {
      const text = await file.text();
      payload = transformCSVDataToPayload(text);
    } else if (fileName.endsWith(".xlsx")) {
      const arrayBuffer = await file.arrayBuffer();
      payload = transformExcelDataToPayload(arrayBuffer);
    } else {
      throw new Error("不支援的檔案格式，僅支援 CSV 與 XLSX");
    }
    const newFile: UploadedFile = {
      id: Date.now(),
      fileName: file.name,
      alias: file.name,
      uploadedAt: new Date().toISOString(),
      data: payload,
      userId, // 使用傳入的 userId
    };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    saveFiles(updatedFiles);
  };

  const updateFileAlias = (id: number, newAlias: string) => {
    const updatedFiles = files.map(file =>
      file.id === id ? { ...file, alias: newAlias } : file
    );
    setFiles(updatedFiles);
    saveFiles(updatedFiles);
  };

  const deleteFile = (id: number) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
    saveFiles(updatedFiles);
  };

  return { files, addFile, updateFileAlias, deleteFile };
}