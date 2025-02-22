// src/services/excelParser.ts
import * as XLSX from 'xlsx';

/**
 * parseExcelFile
 * @param file - 使用者上傳的 Excel 檔案
 * @returns 解析後的二維陣列 (array of arrays)，可依需求改為物件格式
 */
export async function parseExcelFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        // 將讀入的二進位資料轉為 workbook
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // 假設只讀取第一個 Sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 轉成 JSON 陣列（header: 1 表示第一列當作欄位名稱）
        // 也可以用 sheet_to_json<YourType>(...) 進行更嚴謹的型別推斷
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsArrayBuffer(file);
  });
}