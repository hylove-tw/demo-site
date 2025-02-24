// src/hooks/useFileManager.ts
import { useState, useEffect } from 'react';
import { transformCSVDataToPayload } from '../utils/transformCSVDataToPayload';
import { transformExcelDataToPayload } from '../utils/transformExcelDataToPayload';

export interface UploadedFile {
  id: number;
  fileName: string;
  alias: string;
  uploadedAt: string;
  data: any; // 解析後的 payload 格式（例如一個物件）
}

export function useFileManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // 從 localStorage 載入檔案列表（若存在）
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
   * 根據副檔名 (.csv 或 .xlsx) 呼叫對應的解析工具函式，
   * 解析後產生 UploadedFile 物件並更新檔案列表。
   */
  const addFile = async (file: File): Promise<void> => {
    let payload: any;
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".csv")) {
      // 讀取 CSV 文字，並轉換成 payload 格式
      const text = await file.text();
      payload = transformCSVDataToPayload(text);
    } else if (fileName.endsWith(".xlsx")) {
      // 讀取 XLSX 的 ArrayBuffer 並轉換成 payload 格式
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