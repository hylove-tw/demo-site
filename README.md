# HyLove 腦波分析系統 v2.5

提供多種腦波資料分析功能的網頁應用程式。

**Demo 網站**: https://hylove-demo.good-nas.cc

## 功能特色

### 核心功能
- **多使用者管理**：建立與管理多個使用者資料
- **檔案管理**：上傳與整理腦波資料檔案（CSV 格式）
- **資料群組**：將相關檔案分組，簡化分析流程
- **歷史紀錄**：追蹤所有分析結果，支援篩選與搜尋

### 分析功能
- **元神音創意平台**：腦波影音編碼、音樂生成與混音輸出
- **雙人腦波音樂**：雙人腦波音樂譜生成
- **亨運來**：H.R. 評估系統
- **貞天賦**：潛能評估系統
- **利養炁**：正念修行分析
- **珍寶炁**：礦物結晶體測試系統
- **情香意**：香氛測試系統
- **易**：情緒管理與 ORE 評比測試

### 報告功能
- 詳細分析報告，含圖表與視覺化
- **列印/匯出 PDF**：列印報告或儲存為 PDF 檔案
- 自動儲存至歷史紀錄

## 技術堆疊

- React 19 + TypeScript
- React Router v7
- DaisyUI / TailwindCSS（大地色系主題）
- Highcharts 資料視覺化
- OpenSheetMusicDisplay 樂譜顯示
- Web Audio API（多軌混音、crossfade looping）
- Playwright E2E 測試

## 架構設計

```
瀏覽器
  └── Cloudflare (HTTPS)
        └── VPS nginx (172.105.230.72)
              ├── /api/v1/, /api/v2/   → Rails API (Passenger)
              ├── /api/music-gen/v1/   → music-gen (Python/FastAPI, port 8001)
              ├── /assets/             → 靜態資源（長期快取）
              └── /*                  → React SPA (public/index.html)
```

### 服務說明

| 服務 | 技術 | 路徑 |
|------|------|------|
| 前端 | React 19 (靜態檔案) | `/` |
| 分析 API | Ruby on Rails + Passenger | `/api/v1/`, `/api/v2/` |
| 音樂生成 | Python FastAPI + FluidSynth | `/api/music-gen/v1/` |

### 環境變數

所有 API 均在同一 origin，使用相對路徑（無需設定環境變數）：

| 變數 | 正式值 | 說明 |
|------|--------|------|
| `REACT_APP_ANALYSIS_API_BASE` | `/` | 分析 API 根路徑 |
| `REACT_APP_MUSIC_GEN_URL` | `/api/music-gen` | 音樂生成 API |
| `REACT_APP_MUSIC_APP_ID` | `638abd901bbf6ba1bb99d620` | 應用程式 ID |

本機開發時在 `.env` 覆寫（`.env` 已加入 `.gitignore`）：

```env
REACT_APP_ANALYSIS_API_BASE=https://hylove-demo.good-nas.cc
REACT_APP_MUSIC_GEN_URL=https://hylove-demo.good-nas.cc/api/music-gen
REACT_APP_MUSIC_APP_ID=638abd901bbf6ba1bb99d620
```

## 開發指令

```bash
# 安裝相依套件
npm install

# 啟動開發伺服器
npm start

# 執行單元測試
npm test

# 執行 E2E 測試
npm run test:e2e
```

## 部署

### VPS 部署（正式環境）

```bash
# 建置（PUBLIC_URL=/ 確保路徑為根路徑）
npm run build:vps

# 上傳至 VPS
rsync -avz --delete build/ root@172.105.230.72:/home/deploy/staging_hylove/current/public/
```

### GitHub Pages 部署（備用）

```bash
# 建置並推送至 gh-pages branch
npm run deploy
```

> GitHub Pages 網址：https://hylove-tw.github.io/demo-site

## 專案結構

```
src/
├── analysis/           # 外掛系統
│   ├── registry.ts     # 外掛註冊
│   └── plugins/        # 個別分析外掛
├── components/         # 可重用 UI 元件
│   ├── MusicReportEditor.tsx   # 音樂生成與混音介面
│   └── StemMixer.tsx           # 多軌混音器（Web Audio API）
├── config/             # 分析方法與渲染器
├── context/            # React Context Provider
├── hooks/              # 自訂 React Hooks
├── pages/              # 頁面元件
├── services/
│   └── musicGenService.ts  # music-gen API 客戶端
└── utils/              # 工具函式
e2e/
├── fixtures/           # 測試資料與工具
├── helpers/            # 共用測試輔助函式
└── *.spec.ts           # 測試規格
```

## 授權

私有專案 - 保留所有權利。
