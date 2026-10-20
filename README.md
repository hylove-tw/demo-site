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
瀏覽器（任一 hostname，例如 hylove.good-nas.cc、hylove-staging.good-nas.cc）
  └── Cloudflare Worker
        ├── /api/music-gen/*  → music-gen
        ├── /api/*            → Rails API
        └── /*                → 這份 SPA 的靜態 build
```

### 服務說明

| 服務 | 技術 | 路徑 |
|------|------|------|
| 前端 | React 19 (靜態檔案) | `/` |
| 分析 API | Ruby on Rails + Passenger | `/api/v1/`, `/api/v2/` |
| 音樂生成 | Python FastAPI + FluidSynth | `/api/music-gen/api/v1/` |

### 環境變數

`REACT_APP_*` 在 **build 時**寫進 JS bundle，執行時改不了。API 位址沒設定或空白時，前端打**同源相對路徑**，由當下 hostname 上的 Worker 轉發：

| 變數 | 未設定／空白時 | 請求長這樣 |
|---|---|---|
| `REACT_APP_ANALYSIS_API_BASE` | 空字串（路徑本身已含 `/api/...`） | `/api/v1/music`、`/api/v2/music` |
| `REACT_APP_MUSIC_GEN_URL` | `/api/music-gen` | `/api/music-gen/api/v1/generate` |

正式站與 staging **用同一份沒帶 API 位址的 build**。把正式站網址寫進 bundle 的話，staging（或其他 hostname）的登入 cookie 不會跟著送到那個網址。已提交的 `.env.production` 把這兩個變數釘成空白，所以即使本機 `.env` 裡留著舊的絕對網址，`npm run build` 仍走同源。只寫 `/` 也視同空白（否則接上 `/api/...` 會變成 protocol-relative 的 `//api/...`）。尾端斜線會被去掉。

本機 `npm start` 不會讀 `.env.production`。要讓 dev server 打遠端後端時，寫進 gitignore 的 `.env`（分析 API 的值是 origin，不要含 `/api`；music-gen 的值要含 `/api/music-gen`）：

```env
REACT_APP_ANALYSIS_API_BASE=https://backend.example
REACT_APP_MUSIC_GEN_URL=https://backend.example/api/music-gen
```

一次性的 production build 若真的要打別的後端，用 shell 或 gitignore 的 `.env.production.local`（兩者都蓋過 `.env.production`）：

```bash
REACT_APP_ANALYSIS_API_BASE=https://backend.example \
REACT_APP_MUSIC_GEN_URL=https://backend.example/api/music-gen \
npm run build
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

### 部署拓撲總覽

API 位址跟著頁面的 hostname 走，**不必為了換主機重新 build**。`PUBLIC_URL` 仍是 build 時寫死的資源路徑前綴（根路徑 `/` 與子路徑 `/demo/` 不能共用同一份 build）：

| 平台 | 網址 | 檔案位置 | 更新方式 |
|---|---|---|---|
| weifan-ubuntu | `https://hylove.good-nas.cc/` | `/home/weifan/hylove-build` | 本機 `npm run build` 後放到該路徑，由 `music-gen-nginx-1` 容器唯讀掛載（`root /`，非 `/demo/`） |
| 台灣 VPS | `http://172.105.230.72/demo/` | `/var/www/hylove-demo` | 見下方「VPS 部署」 |
| 中國 阿里雲 | `http://8.138.157.218:8080/demo/` | `staging_hylove/current/public/demo/` | 需經 weifan-ubuntu 跳板轉送（本機無金鑰） |

```bash
# 台灣 VPS、中國阿里雲（網站掛在 /demo/；API 走同源 /api）
PUBLIC_URL=/demo npm run build
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
