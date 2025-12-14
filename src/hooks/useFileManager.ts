// src/hooks/useFileManager.ts
import { useState, useEffect, useCallback } from 'react';
import { transformCSVDataToPayload } from '../utils/transformCSVDataToPayload';
import { transformExcelDataToPayload } from '../utils/transformExcelDataToPayload';

export interface UploadedFile {
  id: number;
  fileName: string;
  alias: string;
  uploadedAt: string;
  data: any[][]; // 解析後的資料（例如二維陣列）
  userId: string; // 該檔案所屬的使用者 ID
  groupId?: string; // 檔案群組 ID
}

export interface FileGroup {
  id: string;
  name: string;
  createdAt: string;
  userId: string;
  fileIds: number[];
}

const FILES_KEY = 'uploadedFiles';
const GROUPS_KEY = 'fileGroups';

// ===== localStorage 操作函數 =====
const getFilesFromStorage = (): UploadedFile[] => {
  try {
    const stored = localStorage.getItem(FILES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFilesToStorage = (files: UploadedFile[]): void => {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
};

const getGroupsFromStorage = (): FileGroup[] => {
  try {
    const stored = localStorage.getItem(GROUPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveGroupsToStorage = (groups: FileGroup[]): void => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

// ===== 檔案解析函數 =====
const parseFile = async (file: File): Promise<any[][]> => {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    return transformCSVDataToPayload(text);
  } else if (fileName.endsWith('.xlsx')) {
    const arrayBuffer = await file.arrayBuffer();
    return transformExcelDataToPayload(arrayBuffer);
  } else {
    throw new Error('不支援的檔案格式，僅支援 CSV');
  }
};

// ===== 產生唯一 ID =====
let idCounter = 0;
const generateUniqueId = (): number => {
  idCounter += 1;
  return Date.now() * 1000 + idCounter;
};

export function useFileManager() {
  const [files, setFiles] = useState<UploadedFile[]>(() => getFilesFromStorage());
  const [groups, setGroups] = useState<FileGroup[]>(() => getGroupsFromStorage());

  // 重新載入資料（用於同步）
  const reload = useCallback(() => {
    setFiles(getFilesFromStorage());
    setGroups(getGroupsFromStorage());
  }, []);

  // 監聽 storage 事件（跨 tab 同步）
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === FILES_KEY || e.key === GROUPS_KEY) {
        reload();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [reload]);

  /**
   * addFiles: 上傳多個檔案
   */
  const addFiles = useCallback(async (fileList: File[], userId: string): Promise<UploadedFile[]> => {
    const newFiles: UploadedFile[] = [];

    // 解析所有檔案
    for (const file of fileList) {
      const payload = await parseFile(file);
      const newFile: UploadedFile = {
        id: generateUniqueId(),
        fileName: file.name,
        alias: file.name,
        uploadedAt: new Date().toISOString(),
        data: payload,
        userId,
      };
      newFiles.push(newFile);
    }

    // 直接操作 localStorage，確保資料一致性
    const currentFiles = getFilesFromStorage();
    const updatedFiles = [...currentFiles, ...newFiles];
    saveFilesToStorage(updatedFiles);

    // 更新 React state
    setFiles(updatedFiles);

    return newFiles;
  }, []);

  /**
   * addFilesAsGroup: 上傳多個檔案並建立群組
   */
  const addFilesAsGroup = useCallback(async (
    fileList: File[],
    groupName: string,
    userId: string
  ): Promise<FileGroup> => {
    const groupId = generateUniqueId().toString();
    const newFiles: UploadedFile[] = [];

    // 解析所有檔案
    for (const file of fileList) {
      const payload = await parseFile(file);
      const newFile: UploadedFile = {
        id: generateUniqueId(),
        fileName: file.name,
        alias: file.name,
        uploadedAt: new Date().toISOString(),
        data: payload,
        userId,
        groupId,
      };
      newFiles.push(newFile);
    }

    const newGroup: FileGroup = {
      id: groupId,
      name: groupName,
      createdAt: new Date().toISOString(),
      userId,
      fileIds: newFiles.map((f) => f.id),
    };

    // 直接操作 localStorage
    const currentFiles = getFilesFromStorage();
    const currentGroups = getGroupsFromStorage();
    const updatedFiles = [...currentFiles, ...newFiles];
    const updatedGroups = [...currentGroups, newGroup];

    saveFilesToStorage(updatedFiles);
    saveGroupsToStorage(updatedGroups);

    // 更新 React state
    setFiles(updatedFiles);
    setGroups(updatedGroups);

    return newGroup;
  }, []);

  /**
   * updateFileAlias: 更新檔案別名
   */
  const updateFileAlias = useCallback((id: number, newAlias: string) => {
    const currentFiles = getFilesFromStorage();
    const updatedFiles = currentFiles.map(file =>
      file.id === id ? { ...file, alias: newAlias } : file
    );
    saveFilesToStorage(updatedFiles);
    setFiles(updatedFiles);
  }, []);

  /**
   * deleteFile: 刪除檔案
   */
  const deleteFile = useCallback((id: number) => {
    const currentFiles = getFilesFromStorage();
    const currentGroups = getGroupsFromStorage();

    const updatedFiles = currentFiles.filter(file => file.id !== id);
    const updatedGroups = currentGroups
      .map((group) => ({
        ...group,
        fileIds: group.fileIds.filter((fid) => fid !== id),
      }))
      .filter((group) => group.fileIds.length > 0);

    saveFilesToStorage(updatedFiles);
    saveGroupsToStorage(updatedGroups);
    setFiles(updatedFiles);
    setGroups(updatedGroups);
  }, []);

  /**
   * createGroup: 從現有檔案建立群組
   */
  const createGroup = useCallback((name: string, fileIds: number[], userId: string): FileGroup => {
    const newGroup: FileGroup = {
      id: generateUniqueId().toString(),
      name,
      createdAt: new Date().toISOString(),
      userId,
      fileIds,
    };

    const currentFiles = getFilesFromStorage();
    const currentGroups = getGroupsFromStorage();

    const updatedFiles = currentFiles.map((file) =>
      fileIds.includes(file.id) ? { ...file, groupId: newGroup.id } : file
    );
    const updatedGroups = [...currentGroups, newGroup];

    saveFilesToStorage(updatedFiles);
    saveGroupsToStorage(updatedGroups);
    setFiles(updatedFiles);
    setGroups(updatedGroups);

    return newGroup;
  }, []);

  /**
   * updateGroup: 更新群組
   */
  const updateGroup = useCallback((groupId: string, updates: Partial<Pick<FileGroup, 'name' | 'fileIds'>>) => {
    const currentFiles = getFilesFromStorage();
    const currentGroups = getGroupsFromStorage();

    const updatedGroups = currentGroups.map((group) =>
      group.id === groupId ? { ...group, ...updates } : group
    );

    let updatedFiles = currentFiles;
    if (updates.fileIds) {
      updatedFiles = currentFiles.map((file) => {
        if (updates.fileIds!.includes(file.id)) {
          return { ...file, groupId };
        } else if (file.groupId === groupId) {
          return { ...file, groupId: undefined };
        }
        return file;
      });
      saveFilesToStorage(updatedFiles);
      setFiles(updatedFiles);
    }

    saveGroupsToStorage(updatedGroups);
    setGroups(updatedGroups);
  }, []);

  /**
   * deleteGroup: 刪除群組
   */
  const deleteGroup = useCallback((groupId: string) => {
    const currentFiles = getFilesFromStorage();
    const currentGroups = getGroupsFromStorage();

    const updatedFiles = currentFiles.map((file) =>
      file.groupId === groupId ? { ...file, groupId: undefined } : file
    );
    const updatedGroups = currentGroups.filter((group) => group.id !== groupId);

    saveFilesToStorage(updatedFiles);
    saveGroupsToStorage(updatedGroups);
    setFiles(updatedFiles);
    setGroups(updatedGroups);
  }, []);

  const getFilesByGroup = useCallback((groupId: string): UploadedFile[] => {
    return files.filter((file) => file.groupId === groupId);
  }, [files]);

  const getGroupById = useCallback((groupId: string): FileGroup | undefined => {
    return groups.find((group) => group.id === groupId);
  }, [groups]);

  return {
    files,
    groups,
    addFiles,
    addFilesAsGroup,
    updateFileAlias,
    deleteFile,
    createGroup,
    updateGroup,
    deleteGroup,
    getFilesByGroup,
    getGroupById,
    reload,
  };
}
