# HyLove 腦波分析系統 v2.2

提供多種腦波資料分析功能的網頁應用程式。

**Demo 網站**: https://hylove-demo.good-nas.cc

## 功能特色

### 核心功能
- **多使用者管理**：建立與管理多個使用者資料
- **檔案管理**：上傳與整理腦波資料檔案（CSV 格式）
- **資料群組**：將相關檔案分組，簡化分析流程
- **歷史紀錄**：追蹤所有分析結果，支援篩選與搜尋

### 分析功能
- **元神音**：腦波影音編碼及播放系統
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
- Playwright E2E 測試

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

# 建置正式版本
npm run build
```

## 部署

### Docker 建置（多平台）

```bash
# 建立 builder（適用於 Apple Silicon）
docker buildx create --use --name mybuilder

# 登入 Docker Hub
docker login

# 建置並推送映像
docker buildx build --platform linux/amd64,linux/arm64 \
  -t p988744/hylove-demo:2.2 \
  -t p988744/hylove-demo:latest . --push
```

### 使用 Docker Compose 執行

```bash
# 建立 nginx 基本驗證檔案（選用）
htpasswd -c ./nginx/.htpasswd admin
export HTPASSWD_PATH=$(pwd)/nginx/.htpasswd

# 使用 docker-compose 啟動
docker compose -f docker-compose-prod.yml up -d
```

### GitHub Pages 部署

```bash
npm run deploy
```

## 設定

### 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `REACT_APP_ANALYSIS_API_BASE` | 後端 API 基礎網址 | `http://localhost:3000` |

### Cloudflare Tunnel 設定

前往：`網路` > `Tunnels` > `設定` > `公用主機名稱`

## 專案結構

```
src/
├── analysis/           # 外掛系統
│   ├── registry.ts     # 外掛註冊
│   └── plugins/        # 個別分析外掛
├── components/         # 可重用 UI 元件
├── config/             # 分析方法與渲染器
├── context/            # React Context Provider
├── hooks/              # 自訂 React Hooks
├── pages/              # 頁面元件
└── services/           # API 服務
e2e/
├── fixtures/           # 測試資料與工具
├── helpers/            # 共用測試輔助函式
└── *.spec.ts           # 測試規格
```

## 授權

私有專案 - 保留所有權利。
