// src/hooks/useFileManager.ts
import { useState, useEffect } from 'react';
import { parseExcelFile } from '../services/excelParser';

export interface UploadedFile {
  id: number;
  fileName: string;
  alias?: string; // 使用者修改的別名
  uploadedAt: string;
  data: any[][];  // Excel 解析後的資料
}

const LOCAL_STORAGE_KEY = 'uploadedExcelData';

function loadFiles(): UploadedFile[] {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveFiles(files: UploadedFile[]) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(files));
}

export function useFileManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    setFiles(loadFiles());
  }, []);

  // 上傳並解析檔案，然後新增至檔案清單
  const uploadFile = async (file: File): Promise<void> => {
    try {
      const data = await parseExcelFile(file);
      const newFile: UploadedFile = {
        id: Date.now(),
        fileName: file.name,
        alias: file.name,
        uploadedAt: new Date().toISOString(),
        data,
      };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      saveFiles(updatedFiles);
    } catch (error: any) {
      throw new Error(error.message || '上傳檔案失敗');
    }
  };

  // 修改檔案別名
  const updateFileAlias = (id: number, newAlias: string) => {
    const updatedFiles = files.map((file) =>
      file.id === id ? { ...file, alias: newAlias } : file
    );
    setFiles(updatedFiles);
    saveFiles(updatedFiles);
  };

  // 刪除檔案
  const deleteFile = (id: number) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
    saveFiles(updatedFiles);
  };

  return {
    files,
    uploadFile,
    updateFileAlias,
    deleteFile,
  };
}