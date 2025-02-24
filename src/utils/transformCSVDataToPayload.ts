/**
 * 將 CSV 格式的文字轉換成符合 API 要求的 payload 格式
 * @param csvText CSV 格式的內容字串
 * @returns payload 物件
 *
 * 目標格式為：
 * {
 *   "Good Signal Quality(0-100)": [...],
 *   "Mark": [...],
 *   "Attention": [...],
 *   "Meditation": [...],
 *   "Delta": [...],
 *   "Theta": [...],
 *   "Low Alpha": [...],
 *   "High Alpha": [...],
 *   "Low Beta": [...],
 *   "High Beta": [...],
 *   "Low Gamma": [...],
 *   "High Gamma": [...]
 * }
 *
 * 假設 CSV 標題列例如：
 * Time,Good Signal Quality(0-100),Attention,Meditation,Delta,Theta,Low Alpha,High Alpha,Low Beta,High Beta,Low Gamma,High Gamma
 *
 * 這裡我們會根據 header 檢查每個 target 欄位是否存在，若存在則記錄索引，否則映射為 null。
 */
export function transformCSVDataToPayload(csvText: string): any {
  // 定義目標欄位
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

  // 拆分 CSV 檔案的各行，忽略空行
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) {
    // 資料不足則回傳每個欄位皆為 [null]
    const obj: any = {};
    requiredKeys.forEach(key => (obj[key] = [null]));
    return obj;
  }

  // 解析第一行作為 header
  const header = lines[0].split(",").map(item => item.trim());

  // 建立 mapping：對於每個 target 欄位，如果 header 中存在則記錄索引，否則為 null
  const mapping: { [key: string]: number | null } = {};
  requiredKeys.forEach(key => {
    // header.findIndex 找不到會返回 -1
    const idx = header.findIndex(item => item === key);
    mapping[key] = idx !== -1 ? idx : null;
  });

  // 初始化 payload 物件，每個欄位對應一個空陣列
  const payload: any = {};
  requiredKeys.forEach(key => {
    payload[key] = [];
  });

  // 從第二行開始處理數據
  for (let r = 1; r < lines.length; r++) {
    const row = lines[r].split(",").map(item => item.trim());
    if (row.length < header.length) continue; // 若資料列不完整則略過

    requiredKeys.forEach(key => {
      const colIndex = mapping[key];
      if (colIndex === null || colIndex >= row.length) {
        // 若該欄位不存在於 header，填入 null
        payload[key].push(null);
      } else {
        const value = row[colIndex];
        const num = parseFloat(value);
        // 若可轉換成數字則使用數字，否則保留原字串
        payload[key].push(isNaN(num) ? value : num);
      }
    });
  }

  return payload;
}