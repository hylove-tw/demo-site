// src/config/analysisRenderers.ts
import React from 'react';

// 差異度報告的渲染函式：以純文字方式呈現
export const renderDifferenceReport = (result: any): React.ReactNode => (
  <div>
    <h3>差異度報告</h3>
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  </div>
);

// 趨勢分析報告的渲染函式：示範用趨勢圖 placeholder
export const renderTrendReport = (result: any): React.ReactNode => (
  <div>
    <h3>趨勢圖報告</h3>
    <div
      style={{
        width: '100%',
        height: '300px',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ccc',
      }}
    >
      {/* 在此可以整合實際的圖表元件，如 Recharts、Chart.js 等 */}
      <span>趨勢圖呈現區 (Chart placeholder)</span>
    </div>
  </div>
);

// 綜合分析報告的渲染函式：以純文字呈現
export const renderCombinedReport = (result: any): React.ReactNode => (
  <div>
    <h3>綜合分析報告</h3>
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  </div>
);