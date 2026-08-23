# 知識庫

給 **agent 與新進工程師** 查閱的知識庫，記錄 hylove-demo（前端）踩過的坑
跟設計決策——性質是「可重複發生、不因時間過期」的知識，不是「這次做了
什麼」的一次性事件記錄（那些記在對應的 commit message，或
`~/hylove/coordination/reports/` 裡）。

跟 `music-gen` repo 的 `docs/knowledge/`（另一個 git repo，路徑不在這裡
底下）是同一種精神，但格式輕量很多：**一篇一個 Markdown 檔 + 簡單的 YAML
frontmatter**（`title` / `keywords` / `dateModified`），沒有 JSON-LD、
沒有自動重建索引的腳本——下面這份 README 本身就是索引，新增條目時手動
加一行。

## 索引

| 條目 | 摘要 |
|---|---|
| [`preset-id-key-mismatch`](entries/preset-id-key-mismatch.md) | preset 的 id 字串要跟查表用的 key 完全一致，否則查表落空會靜默 fallback，沒有任何錯誤訊息。目前有三次真實發作：對照表拼法不一致（整個節奏選不到）、呼叫端誤用 `style.id` 而非 `style.beat`（試聽按鈕消失）——同一通則，不同位置。 |
| [`preset-bpm-range-mismatch`](entries/preset-bpm-range-mismatch.md) | 前端滑桿的 `bpmRange` 要跟後端 preset YAML 的 `bpm_range` 對齊，否則超出範圍的值會被後端靜默夾掉。reggae/disco/tango/blues/country 已對齊，soul 是妥協而非真正修好（誠實記錄了限制），waltz/quick_waltz/rock/twist/chacha/giliba 仍未處理。 |
| [`bundle-verification-unicode-escaping`](entries/bundle-verification-unicode-escaping.md) | 驗證 CRA build 產物是否對應特定原始碼時，字面 grep 中文字串必然找不到（CRA 把非 ASCII 轉義成 `\uXXXX`），用 diff 的新增行抽驗字串也不可靠；決定性做法是清快取重建後比對 bundle 的 hash/md5。 |
| [`shared-logic-across-ui-paths`](entries/shared-logic-across-ui-paths.md) | 同一段「選了某選項該套用什麼參數」的邏輯，如果分別寫在兩個平行的 UI 路徑（例如卡片版跟下拉選單版）裡，遲早會 drift——要抽成共用 helper，讓兩邊呼叫同一份實作。 |
| [`independent-beat-override-drift`](entries/independent-beat-override-drift.md) | 同一個欄位（`beat`）如果有第二個獨立的寫入入口（跳過主要決策路徑），遲早會跟綁定的其他欄位（`genre`、`accompaniment`）脫鉤；森巴顯示「流行」＋伴奏設定跨節奏殘留就是同一個根因的兩種下游表現。收斂成單一入口後，入口內每條分支是否都清乾淨舊狀態仍要逐一檢查。 |
| [`safari-audiocontext-gesture-timing`](entries/safari-audiocontext-gesture-timing.md) | `AudioContext` 要在使用者手勢的同一個同步呼叫堆疊裡建立/`resume()`，Safari 才會真的解鎖音訊輸出；晚一個 `await` 都不算數，且失敗是靜默的（`state`/`currentTime` 照樣正常）。Chrome/Firefox 寬鬆得多，只在 Safari 才會暴露。 |

## 什麼時候該查這裡

| 情境 | 看哪個條目 |
|---|---|
| 新增或修改節奏風格／曲風的對照表（`GENRE_BEAT_MAP`、`BEAT_TO_PRESET` 之類） | `preset-id-key-mismatch` |
| 新增或調整曲風的 BPM 範圍、或音樂人反映速度感覺不對 | `preset-bpm-range-mismatch` |
| 懷疑部署的 build 產物是不是舊的，想驗證 bundle 內容 | `bundle-verification-unicode-escaping` |
| 表單／元件有 `compact` 或其他多種呈現變體，要新增一個選項 | `shared-logic-across-ui-paths` |
| 同一個欄位有不只一個地方可以寫入，或改一個欄位時忘了重置另一個相依欄位 | `independent-beat-override-drift` |
| 新增或修改用到 `AudioContext`／Web Audio API 的播放功能，或有人回報「Safari 沒聲音但 Chrome 正常」 | `safari-audiocontext-gesture-timing` |

## 新增條目時

1. 在 `entries/` 底下新增一個 `.md`，開頭帶 frontmatter：
   ```yaml
   ---
   title: 條目標題
   keywords: [關鍵字, ...]
   dateModified: YYYY-MM-DD
   ---
   ```
2. 屬於「踩坑」類的條目，建議沿用 music-gen 那邊驗證有效的
   「症狀 → 真正原因 → 處理 → 通則」四段式——這類問題最花時間的部分
   通常是「症狀看起來像 A，實際是 B」，四段式把這個落差寫清楚。
3. 回來這份 README 的索引表加一行。

## 這裡不放什麼

- 「這次做了什麼、什麼時候、誰決定的」——一次性、會過期的事件記錄，
  放 commit message 或 `~/hylove/coordination/reports/`。
- 進度、版本號、待辦——維持用 `milestone.md` / `CHANGELOG.md`。
- 前端串接 music-gen API 的紀錄——已經有專門的
  [`../MUSIC_GEN_INTEGRATION_NOTES.md`](../MUSIC_GEN_INTEGRATION_NOTES.md)，
  不重複開一份。
