// src/utils/transformExcelDataToPayload.ts
import * as XLSX from 'xlsx';

/**
 * 將 XLSX 檔案轉換成符合目標 payload 格式
 * @param arrayBuffer XLSX 檔案的 ArrayBuffer 內容
 * @returns payload 物件
 */
export function transformExcelDataToPayload(arrayBuffer: ArrayBuffer): any {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const requiredKeys = [
    "Good Signal Quality(0-100)",
    "Mark",
    "Attention",
    "Meditation",
    "Delta",
    "Theta",
    "Low Alpha",
    "High Alpha",
    "Low Beta",
    "High Beta",
    "Low Gamma",
    "High Gamma"
  ];

  if (!data || data.length < 2) {
    const obj: any = {};
    requiredKeys.forEach(key => (obj[key] = [null]));
    return obj;
  }

  // 第一列為 header
  const header = data[0].map(String).map(item => item.trim());

  // 建立 mapping
  const mapping: { [key: string]: number | null } = {};
  requiredKeys.forEach(key => {
    const idx = header.findIndex(item => item === key);
    mapping[key] = idx !== -1 ? idx : null;
  });

  const payload: any = {};
  requiredKeys.forEach(key => {
    payload[key] = [];
  });

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length < header.length) continue;
    requiredKeys.forEach(key => {
      const colIndex = mapping[key];
      if (colIndex === null || colIndex >= row.length) {
        payload[key].push(null);
      } else {
        const value = row[colIndex];
        const num = parseFloat(value);
        payload[key].push(isNaN(num) ? value : num);
      }
    });
  }
  return payload;
}