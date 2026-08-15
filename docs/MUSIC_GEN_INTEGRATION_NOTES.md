# music-gen 串接開發紀錄

**日期**：2026-08-15 ~ 16
**範圍**：加入音樂人提供的森巴／雷鬼節奏，並修正串接上累積的落差

> **API 規格請看 music-gen repo 的 [`docs/INTEGRATION.md`](https://github.com/hylove-tw/music-gen/blob/main/docs/INTEGRATION.md)。**
> 那份是給正式站（不由本團隊維護）的完整契約文件。
> 本文件記錄的是**我們在 demo site 上實際踩過的坑與決策理由**，供後續維護與其他前端參考。

---

## 一、最重要的一件事：API 會主動告訴你哪裡錯了

music-gen 每個生成回應都帶 `warnings` 陣列，列出「收到但不會生效」的欄位，同時也放在 `X-Api-Warnings` 標頭。

**這次找到的 5 個無效欄位，全部都是靠它抓出來的**，不是靠讀程式碼：

| 欄位 | 狀態 |
|---|---|
| `time_signature` | 忽略（拍號由 `melody` 決定） |
| `after_brain_data` | 忽略（單人模式只用 `before_brain_data`） |
| `melody_pattern` | 別名（正式名稱是 `melody`） |
| `music_api_base_url` | 伺服器決定 |
| `music_api_version` | 伺服器決定 |

清乾淨後實測 warnings 歸零。

**建議**：開發環境務必把 `warnings` 顯示出來。串接參數的漂移幾乎都會被它抓到，而且它是**唯一**會主動告知的機制——這些欄位送錯不會讓請求失敗，只會讓成品悄悄不對。

---

## 二、踩過的坑

### 1. 拍號是假的控制項

編輯器有一個「拍號」下拉選單，使用者可以選 2/4、3/4、3/8…，但**伺服器完全忽略它**。真正的拍號由 `melody` 決定：

| melody | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| 拍號 | 4/4 | 4/8 | 3/8 | 3/8 | 4/4 | 3/4 | 6/8 | 12/16 | 8/16 |

更糟的是，前端還會拿這個值去**覆寫顯示中的樂譜拍號**——所以改了之後畫面會變、音檔不變，兩邊對不起來。

**處理**：改成由 `melody` 推導、唯讀顯示；移除本地覆寫；`timeSignatureForMelody()` 集中推導；加測試把對照表釘死在伺服器的 `_MELODY_TIME_SIG` 上。

> 這張表是**跨 repo 的隱性契約**。伺服器改了而前端沒跟，不會有任何東西報錯，只會讓樂譜的拍號跟聽到的不一樣。測試就是為了這個。

### 2. 雙人模式從來沒送過 `melody`

`exportDualMp3` 的 payload 裡沒有 `melody`，所以伺服器一律套用預設值 1。**使用者選的主旋律模式被整個丟掉，所有雙人曲子都是 melody=1**（連帶拍號也固定 4/4）。

**處理**：補上 `melody`，並讓雙人編輯器把 `melodyPattern` 傳進 export。

### 3. 混音器「重複疊加」音效

回報的症狀是「自然音效跟腦波沒照前一頁的設定呈現，還要再點一次」。實際情況更糟：

- 設定**有**生效，成品裡已經有那兩軌（`stem_urls` 會回傳 `brainwave`、`background`）
- 但混音器把它們標成通用的「腦波頻率」「自然音效」，**看不出是哪個頻率／哪種音效**
- 而「+腦波」的下拉**仍然列出已經在混音裡的那一個**

所以「再點一次」不是讓它生效，而是**把同一個音效疊成兩份**。

**處理**：已套用的軌位顯示實際名稱（如「7.83 Hz 舒適」「海浪」），並從可新增清單中排除。

> **給其他前端的提醒**：`/download` 的完整混音**已經包含**腦波與自然音效。若你提供「加入背景音」的功能，務必把 `stem_urls` 裡已有的排除掉。

### 4. 「雷鬼」以前不是雷鬼

前端的 `BEAT_TO_PRESET` 把 `reggae` 對應到 `ballad`（抒情）——因為當時後端根本沒有雷鬼 preset。現在有了，已改為對應 `reggae`，並新增 `samba`。

### 5. `requirements.txt` 與 `pyproject.toml` 漂移（後端）

`mido` 只寫在 `pyproject.toml`，但 Docker image 從 `requirements.txt` 安裝。它原本只是測試用的 import，直到有 runtime 程式碼引用它——**本機全綠、容器開不起來、站台 502**。

後端已加雙向檢查的測試。**同類問題的通則：任何「同一件事寫在兩個地方」都會漂移**，這也是本次多處改動的共同主題。

---

## 三、設計決策與理由

### 分析前／分析後的參數改為共用同一個元件

原本兩份表單各寫各的，結果只剩 `bpm` 和 `title` 是共通的。編輯器少了調性、曲風、主旋律，卻多了一個無效的拍號。

由於**重新產生樂譜的成本很低**，沒有理由讓兩邊提供不同的選項。現在兩者都用 `CompositionParamsForm`，它同時擁有欄位**與**曲風／主旋律的相容性規則。分析前的 plugin 從 513 行降到 66 行。

### NEW 標記與編曲者 credit 從 API 讀取，不寫死在前端

`GET /presets` 會回傳 `display_name`、`credit`、`is_new`、`has_accompaniment`。前端據此渲染。

理由同上：寫死就要維護兩份。以後換編曲者或加樂風，只需要改 music-gen 的 preset YAML。music-gen 連不到時會安靜降級成沒有標記的清單，不會讓編輯器壞掉。

### 範例資料走與真實上傳完全相同的路徑

`loadSampleFiles()` 把 CSV 取回後建成真正的 `File` 物件，再呼叫 `addFilesAsGroup()`——與使用者自行上傳呼叫的是同一個函式。

**刻意不做「範例模式」的旁路**，因為第二條程式路徑一定會慢慢跟主路徑長得不一樣。

### 伴奏預設用 `replace` 而不是 `layer`

實測各聲部的發聲時間佔比：

| 聲部 | 發聲時間佔比 |
|---|---|
| 雷鬼 中音部 | **13.1%** |
| 森巴 中音部 | 72.9% |
| 雷鬼 低音部 | 87.5% |
| 森巴 低音部 | **100%** |

雷鬼的切分和弦有 **87% 的時間是靜音的**——律動正是那些空隙創造的。`layer` 會用上游的持續聲部把空隙填滿，樂風感直接消失；而且會同時跑兩條各自生成的低音線。

`layer` 仍然保留為選項（使用者可在「伴奏方式」自行選擇），但預設是 `replace`。

---

## 四、部署備忘

| 環境 | 入口 | 更新方式 |
|---|---|---|
| demo site | `https://hylove.good-nas.cc/` | 本機 `npm run build` → rsync 到 weifan-ubuntu `/home/weifan/hylove-build` |
| music-gen A | `hylove.good-nas.cc/api/music-gen` | `git pull` + `docker compose up -d --build` |
| music-gen B | `172.105.230.72/api/music-gen` | `git pull` + `uv sync` + `systemctl restart music-gen` |
| music-gen C | `8.138.157.218:8080/api/music-gen` | `git pull` + 疊層 build（見下） |

**注意事項**

- **`REACT_APP_MUSIC_GEN_URL` 是 build 時寫死的**，換環境必須重新 build。
- demo site 只部署在 weifan-ubuntu；中國那台的 `staging_hylove/current/public` 是 Rails 的目錄，不是這個 CRA 專案。
- 中國那台**連不到 Docker Hub**（已設 registry mirror，但 Debian apt 仍慢到無法完成 `apt-get`），所以用 `Dockerfile.nohub` 疊在既有 image 上，只安裝 Python 套件。
- 中國那台的 `docker-compose` 版本比 daemon 新，指令前要 `export DOCKER_API_VERSION=1.39`。
- 中國那台的公開入口是 **:8080 不是 :80**（:80 是另一套 host nginx，沒有 `/api/music-gen` 路由，會回 404 而不是 502）。
- `.dockerignore` **刻意排除 `assets/`**——正式環境是用 volume 掛載的，不要試圖 `COPY` 進 image。
- 三台部署主機都使用**唯讀 deploy key**（ssh alias `github-musicgen`），remote URL 不含任何 token。

---

## 五、後續建議

1. **在 UI 顯示 `warnings`**（至少開發環境）。投報率最高——它會讓參數漂移自己浮出來。
2. 修 Jest 設定：目前有 3 個 test suite 因 ESM transform 與 react-router mock 失敗（**先前既有的問題，非本次造成**）。
3. 中國那台若要恢復正常建置，需在 Dockerfile 的 apt 層加中國 Debian 鏡像。
4. 森巴的 pattern 第 4 小節是屬和弦，**小節數為 4 的倍數時會結束在未解決的和弦上**。已請音樂人補一個結尾小節。
