// src/pages/FileDetailPage.tsx
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFileManager, UploadedFile } from '../hooks/useFileManager';
import { useUserContext } from '../context/UserContext';

// 熱力圖顏色（從低到高）
const getHeatmapColor = (value: number, min: number, max: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'rgba(200, 200, 200, 0.3)';
  }

  const range = max - min;
  if (range === 0) return 'rgba(100, 150, 100, 0.5)';

  const normalized = Math.max(0, Math.min(1, (value - min) / range));

  // 從藍色（低）到綠色（中）到紅色（高）
  if (normalized < 0.5) {
    const t = normalized * 2;
    const r = Math.round(50 + t * 50);
    const g = Math.round(100 + t * 100);
    const b = Math.round(180 - t * 80);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (normalized - 0.5) * 2;
    const r = Math.round(100 + t * 155);
    const g = Math.round(200 - t * 120);
    const b = Math.round(100 - t * 60);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

// 波段分類
const BAND_CATEGORIES = {
  quality: ['Good Signal Quality(0-100)'],
  mental: ['Attention', 'Meditation'],
  waves: ['Delta', 'Theta', 'Low Alpha', 'High Alpha', 'Low Beta', 'High Beta', 'Low Gamma', 'High Gamma'],
  other: ['Mark']
};

const FileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { files } = useFileManager();
  const { users } = useUserContext();
  const fileId = Number(id);
  const file: UploadedFile | undefined = files.find((f) => f.id === fileId);
  const [viewMode, setViewMode] = useState<'heatmap' | 'table'>('heatmap');

  const owner = users.find((u) => u.id === file?.userId);

  // 解析資料
  const bandData = useMemo(() => {
    if (!file?.data || typeof file.data !== 'object' || Array.isArray(file.data)) {
      return null;
    }

    const dataObj = file.data as Record<string, any[]>;
    const bands: { name: string; values: number[]; min: number; max: number; avg: number; category: string }[] = [];

    Object.entries(dataObj).forEach(([name, values]) => {
      if (!Array.isArray(values)) return;

      const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
      if (numericValues.length === 0) return;

      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;

      let category = 'other';
      if (BAND_CATEGORIES.quality.includes(name)) category = 'quality';
      else if (BAND_CATEGORIES.mental.includes(name)) category = 'mental';
      else if (BAND_CATEGORIES.waves.includes(name)) category = 'waves';

      bands.push({ name, values, min, max, avg, category });
    });

    return bands;
  }, [file]);

  if (!file) {
    return (
      <div className="container mx-auto">
        <div className="alert alert-error">
          <span>找不到該檔案</span>
        </div>
        <Link to="/files" className="btn btn-ghost mt-4">
          返回檔案列表
        </Link>
      </div>
    );
  }

  const dataLength = bandData?.[0]?.values.length || 0;

  return (
    <div className="container mx-auto max-w-5xl">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><Link to="/">首頁</Link></li>
          <li><Link to="/files">腦波檔案管理</Link></li>
          <li>{file.alias || file.fileName}</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold mb-6">{file.alias || file.fileName}</h1>

      {/* 檔案資訊卡片 */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h2 className="card-title text-base mb-2">檔案資訊</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-base-content/60">原檔名</p>
              <p className="font-medium">{file.fileName}</p>
            </div>
            <div>
              <p className="text-base-content/60">別名</p>
              <p className="font-medium">{file.alias}</p>
            </div>
            <div>
              <p className="text-base-content/60">上傳時間</p>
              <p className="font-medium">{new Date(file.uploadedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-base-content/60">所屬使用者</p>
              <p className="font-medium">{owner?.name || file.userId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 檢視模式切換 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">
          腦波資料預覽
          <span className="text-sm text-base-content/60 font-normal ml-2">
            {dataLength} 個時間點
          </span>
        </h2>
        <div className="join">
          <button
            onClick={() => setViewMode('heatmap')}
            className={`btn btn-sm join-item ${viewMode === 'heatmap' ? 'btn-active' : ''}`}
          >
            熱力圖
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`btn btn-sm join-item ${viewMode === 'table' ? 'btn-active' : ''}`}
          >
            表格
          </button>
        </div>
      </div>

      {!bandData || bandData.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body items-center text-center">
            <p className="text-base-content/60">無法顯示檔案內容</p>
          </div>
        </div>
      ) : viewMode === 'heatmap' ? (
        <div className="space-y-4">
          {/* 色階說明 */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/60">數值強度</span>
                <div className="flex items-center gap-2">
                  <span className="text-base-content/60">低</span>
                  <div className="flex h-4 w-32 rounded overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: getHeatmapColor(i, 0, 19) }}
                      />
                    ))}
                  </div>
                  <span className="text-base-content/60">高</span>
                </div>
              </div>
            </div>
          </div>

          {/* 訊號品質 */}
          {bandData.filter(b => b.category === 'quality').length > 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h3 className="text-sm font-medium text-base-content/60 mb-3">訊號品質</h3>
                {bandData.filter(b => b.category === 'quality').map(band => (
                  <BandHeatmap key={band.name} band={band} />
                ))}
              </div>
            </div>
          )}

          {/* 心智狀態 */}
          {bandData.filter(b => b.category === 'mental').length > 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h3 className="text-sm font-medium text-base-content/60 mb-3">心智狀態</h3>
                <div className="space-y-4">
                  {bandData.filter(b => b.category === 'mental').map(band => (
                    <BandHeatmap key={band.name} band={band} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 腦波頻段 */}
          {bandData.filter(b => b.category === 'waves').length > 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h3 className="text-sm font-medium text-base-content/60 mb-3">腦波頻段</h3>
                <div className="space-y-4">
                  {bandData.filter(b => b.category === 'waves').map(band => (
                    <BandHeatmap key={band.name} band={band} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="table table-xs table-pin-rows w-full">
              <thead>
                <tr className="bg-base-200">
                  <th className="text-base-content/60">#</th>
                  {bandData.map(band => (
                    <th key={band.name} className="text-base-content/60 whitespace-nowrap">
                      {band.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(100, dataLength) }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-base-200/50">
                    <td className="text-base-content/60">{rowIndex + 1}</td>
                    {bandData.map(band => (
                      <td key={band.name}>
                        {band.values[rowIndex] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {dataLength > 100 && (
              <div className="text-center py-2 text-base-content/60 text-sm border-t border-base-200">
                僅顯示前 100 列，共 {dataLength} 列
              </div>
            )}
          </div>
        </div>
      )}

      {/* 返回按鈕 */}
      <div className="mt-6">
        <Link to="/files" className="btn btn-ghost">
          返回檔案列表
        </Link>
      </div>
    </div>
  );
};

// 單一波段熱力圖組件
const BandHeatmap: React.FC<{
  band: { name: string; values: number[]; min: number; max: number; avg: number };
}> = ({ band }) => {
  const displayValues = band.values.slice(0, 200); // 最多顯示 200 個點
  const hasMore = band.values.length > 200;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{band.name}</span>
        <div className="flex items-center gap-4 text-xs text-base-content/60">
          <span>最小: {band.min.toFixed(1)}</span>
          <span>平均: {band.avg.toFixed(1)}</span>
          <span>最大: {band.max.toFixed(1)}</span>
        </div>
      </div>
      <div className="relative">
        <div
          className="flex h-6 rounded overflow-hidden bg-base-200"
          style={{ gap: '1px' }}
        >
          {displayValues.map((value, i) => (
            <div
              key={i}
              className="flex-1 min-w-[2px] transition-opacity hover:opacity-80"
              style={{
                backgroundColor: getHeatmapColor(value, band.min, band.max),
              }}
              title={`${i + 1}: ${value?.toFixed(2) ?? 'N/A'}`}
            />
          ))}
        </div>
        {hasMore && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-base-100 to-transparent flex items-center justify-end pr-1">
            <span className="text-xs text-base-content/60">...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetailPage;
