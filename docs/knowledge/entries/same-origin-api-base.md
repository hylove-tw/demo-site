---
title: API base 沒設時要走同源相對路徑，不能在 bundle 裡寫死後端 hostname
keywords: [REACT_APP_ANALYSIS_API_BASE, REACT_APP_MUSIC_GEN_URL, same-origin, cookie, staging, Cloudflare Worker, CRA, build-time env]
dateModified: 2026-10-20
---

# API base 沒設時要走同源相對路徑，不能在 bundle 裡寫死後端 hostname

## 症狀

Staging（或任何非正式站 hostname）上的登入沒有作用：請求直接打到
`https://hylove.good-nas.cc`，那個 hostname 的 cookie 不會被瀏覽器帶去。
錯誤訊息裡會看到 `REACT_APP_MUSIC_GEN_URL`。把 minified bundle 裡的
正式站網址手工改掉才能在 staging 上工作。

## 真正原因

CRA 在 `npm run build` 時就把 `REACT_APP_*` 寫進 JS。本機 `.env` 若照舊
文件填了正式站的絕對網址，任何一份用那組變數做出來的 bundle 都只會打
那一台，不管靜態檔最後被放到哪個 hostname。Worker 是依「當下的
hostname」轉發 `/api/*`（Rails）與 `/api/music-gen/*`（music-gen）；
前端自己指定另一個 origin 時，這層轉發與該站的 cookie 都用不上。

另一個容易誤判的修法是把 base 設成 `/`。分析 API 的路徑本來就是
`/api/v1/...`，接上之後變成 `//api/v1/...`，瀏覽器會把它當成
protocol-relative URL，而不是同源路徑。

## 處理

`src/config/apiBase.ts` 是唯一讀這兩個變數的地方：

| 變數 | 未設定、空白、或只有 `/` | 有設絕對網址時 |
|---|---|---|
| `REACT_APP_ANALYSIS_API_BASE` | 空字串，路徑維持 `/api/v1/...` | 當作 origin 接在路徑前面 |
| `REACT_APP_MUSIC_GEN_URL` | `/api/music-gen` | 原樣使用（去掉尾端斜線） |

`.env.production` 把兩個變數釘成空白，所以 `npm run build` 不會被
gitignore 的舊 `.env` 帶去正式站。本機 `npm start` 不讀這個檔；要打
遠端後端時把絕對網址放進 `.env`。一次性的 production build 用 shell
或 `.env.production.local` 覆寫。

`MUSIC_GEN_URL` 只能加在「伺服器回的相對路徑 → 完整 URL」那一層，而且
只加一次。music-gen 的 `stem_urls` 是 `/api/v1/stems/<id>/p1` 這種路徑，
`_mapCompletedTask` 接上 base 之後 StemMixer 必須原樣 `fetch`。腦波與
自然音的 asset URL 在組字串時加一次 base，再送進同一個 `fetch`。
多加一次會變成 `/api/music-gen/api/music-gen/...`（404）。預覽音訊
（`useBeatPreview`、`useVoicePackPreview`）拿到的仍是未加 base 的
`/api/v1/assets/...`，所以只在播放時加一次，不要再包一層。

## 通則

同一份 SPA 會被放上多個 hostname、而且登入態是 host-scoped cookie 時，
bundle 裡的 API base 預設必須是同源相對路徑。絕對網址只能是明確的
本機／一次性覆寫，不能當正式 build 的預設值。新增呼叫端時從
`apiBase.ts` 拿 `ANALYSIS_API_BASE` 或 `MUSIC_GEN_URL`，不要再各自讀
`process.env`。
