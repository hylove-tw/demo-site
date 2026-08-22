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
              ├── /api/music-gen/      → music-gen (Python/FastAPI, port 8001)
              ├── /assets/             → 靜態資源（長期快取）
              └── /*                  → React SPA (public/index.html)
```

### 服務說明

| 服務 | 技術 | 路徑 |
|------|------|------|
| 前端 | React 19 (靜態檔案) | `/` |
| 分析 API | Ruby on Rails + Passenger | `/api/v1/`, `/api/v2/` |
| 音樂生成 | Python FastAPI + FluidSynth | `/api/music-gen/api/v1/` |

### 環境變數

環境變數在 build 時從 `.env` 讀取（`.env` 已加入 `.gitignore`，不進版控）：

```env
REACT_APP_ANALYSIS_API_BASE=https://hylove-demo.good-nas.cc
REACT_APP_MUSIC_GEN_URL=https://hylove-demo.good-nas.cc/api/music-gen
REACT_APP_MUSIC_APP_ID=638abd901bbf6ba1bb99d620
```

> **注意**：`npm run build:vps` 使用 `PUBLIC_URL=/` 覆蓋資源路徑基底，但 API URL 仍從 `.env` 讀取。本機開發（`npm start）需要 `.env` 中的完整網址才能呼叫遠端 API。

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

### 部署拓撲總覽

demo site 目前部署在三個平台，**各自獨立 build**（`PUBLIC_URL` 與 `REACT_APP_MUSIC_GEN_URL` 都是 build 時寫死的環境變數，換平台必須重新 build，不能只搬檔案）：

| 平台 | 網址 | 檔案位置 | 更新方式 |
|---|---|---|---|
| weifan-ubuntu | `https://hylove.good-nas.cc/` | `/home/weifan/hylove-build` | 本機 `npm run build` 後放到該路徑，由 `music-gen-nginx-1` 容器唯讀掛載（`root /`，非 `/demo/`） |
| 台灣 VPS | `http://172.105.230.72/demo/` | `/var/www/hylove-demo` | 見下方「VPS 部署」 |
| 中國 阿里雲 | `http://8.138.157.218:8080/demo/` | `staging_hylove/current/public/demo/` | 需經 weifan-ubuntu 跳板轉送（本機無金鑰） |

```bash
# 台灣 VPS
PUBLIC_URL=/demo REACT_APP_MUSIC_GEN_URL=http://172.105.230.72/api/music-gen npm run build
# 中國 阿里雲
PUBLIC_URL=/demo REACT_APP_MUSIC_GEN_URL=http://8.138.157.218:8080/api/music-gen npm run build
```

⚠️ **台灣 VPS 與阿里雲的網站根目錄是「半伴旅遊」（完全不同的產品），絕對不能覆蓋。** demo 掛在獨立的 `/demo/` 路徑下，靠專屬的 nginx location 提供 SPA fallback；還原方式是刪掉該目錄並移除 nginx 的 `location /demo/`，不影響任何既有檔案。weifan-ubuntu 則是唯一以根路徑（`/`）直接服務 demo 的環境。

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
