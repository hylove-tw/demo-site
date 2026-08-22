---
title: 驗證 CRA build 產物要注意 \uXXXX 轉義，字面 grep 會被騙
keywords: [CRA, react-scripts build, minify, unicode escape, "\\uXXXX", grep, bundle 驗證, 部署驗證, node_modules/.cache]
dateModified: 2026-08-22
---

# 驗證 CRA build 產物要注意 \uXXXX 轉義，字面 grep 會被騙

## 症狀

懷疑 `/home/weifan/hylove-build`（正式站在跑的 build 產物）是從落後
好幾個 commit 的舊 checkout build 出來的，想直接用 `grep` 中文字串去
bundle 裡確認新內容有沒有進去——結果「只存在於新版原始碼」的中文字串，
在 bundle 裡完全找不到，看起來像是證實了「build 是舊的」。

## 真正原因

CRA（`react-scripts build`）的 production bundle 會把所有非 ASCII 字元
轉義成 `\uXXXX` 形式（例如「漢克呂」變成
`漢克呂`），**不會**以字面 UTF-8 位元組存在於 `.js` 檔裡。
對 bundle 做字面中文字串的 `grep` **必然**找不到任何中文，不管 build
新不新——這個「找不到」不能當作「內容是舊的」的證據。

另一個容易誤判的方法是「用 `git diff` 取兩個 commit 之間新增（`+`）的
字串，再去 bundle 裡逐一 grep 抽驗」。這也不可靠：**程式碼搬移**（把
既有字串從 A 檔搬到 B 檔、或改變宣告方式）一樣會在 diff 裡產生 `+`
行，即使該字串本來就存在於舊 build 裡。抽驗到的「不在 bundle 裡」的
幾條，也可能只是**註解**（`/** */`、`//`、`{/* */}`）——這些內容本來
就會被 minifier 剝除，缺席不代表程式碼缺席。

## 處理

1. 要用字串比對驗證 bundle 內容，先把要找的字串轉成 `\uXXXX` 形式再
   grep（或用支援 unicode escape 的比對工具），不要直接 grep 中文
   字面值。
2. **決定性的驗證法**是內容雜湊比對，不是字串搜尋：
   ```bash
   rm -rf node_modules/.cache build
   npm run build:vps   # 或該專案對應的 build 指令
   md5sum build/static/js/main.*.js
   ```
   跟已部署的 bundle 的 hash/md5 比對。react-scripts 5 預設沒有啟用
   webpack 的持久化檔案快取（只有 babel-loader 的逐檔內容快取，且是
   per-file content-hash keyed，不會造成整包內容失真），所以清掉
   `node_modules/.cache` 跟舊的 `build/` 資料夾後重建，得到的 hash
   如果跟已部署的一致，就能排除「用了舊快取模組」的可能性，是比對
   bundle 是否對應特定原始碼狀態的唯一可靠方法。
3. 如果要用抽驗字串輔助判斷，先確認抽驗到的字串是否為註解（用
   `grep -n` 對照原始碼行號），排除「缺席只是因為那行是註解」的假陽性。

## 通則

**「在 minify 後的產物裡搜尋不到」不等於「內容不是最新的」**——minify
本身就會做字元轉義（unicode escape）跟死碼/註解剝除，這兩件事都會讓
字面搜尋產生假陰性。任何要驗證「這個 build 產物對應哪個原始碼狀態」的
場合，優先用內容雜湊（hash/md5）比對，而不是字串搜尋；字串搜尋只能
當輔助佐證，而且要先確認搜尋方式跟目標編碼一致（unicode escape）、
排除註解類的假陽性。
