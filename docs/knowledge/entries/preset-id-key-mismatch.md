---
title: preset id 要跟查表 key 完全一致，否則靜默 fallback
keywords: [preset, beatPresets, BEAT_TO_PRESET, bossa nova, samba, 節奏風格, 對照表, 靜默失敗, resolveRhythmPreset, canPreview, RHYTHM_ONLY_STYLES, style.id, style.beat]
dateModified: 2026-08-23
---

# preset id 要跟查表 key 完全一致，否則靜默 fallback

## 症狀

巴薩諾瓦（Bossa Nova）這個節奏風格從卡片網格點下去，實際生成的音樂卻是
`basic_pop`（一般流行樂節奏），聽起來完全不像巴薩諾瓦。沒有任何錯誤訊息、
沒有 API warning——一切「看起來」都正常執行完畢。

## 真正原因

`src/services/musicGenService.ts` 的 `BEAT_TO_PRESET` 對照表，key 拼成
`'bossa-nova'`（連字號），但 `src/utils/beatPresets.ts` 裡實際的節奏 preset
id 是 `'bossanova'`（無連字號）。`resolveRhythmPreset()` 用
`BEAT_TO_PRESET[beatId] ?? 'basic_pop'` 查表，`beatId` 是 `'bossanova'`，
永遠查不到 `'bossa-nova'` 這個 key，於是**永遠**吃到 `?? 'basic_pop'`
的 fallback。

這種 bug 特別陰險：查表用的是 `??`（nullish fallback），語法上完全合法、
不會拋錯，執行起來一路順暢，只有耳朵聽得出來哪裡不對。

修正見 commit `d6b4ed1`（`feat: bossa nova and disco in the picker, at the
tempos the musician asked for`）。

## 處理

把 `BEAT_TO_PRESET` 的 key 改成 `bossanova`（跟 `beatPresets.ts` 的 id
完全一致），並在 `src/config/__tests__/rhythmStyles.test.ts` 加測試斷言
「每個曲風／節奏風格都能解析到真正的 preset，且沒有任何一個意外落到
`basic_pop`」——把「靜默 fallback」這個失敗模式變成測試會抓到的錯誤，而
不是只能靠人耳朵聽出來。

## 通則

任何跨兩個獨立字典/列舉的「id 對照表」（例如 A 系統的 id → B 系統的
key），只要其中一邊改了拼法、加了字、或用了不同的連字習慣（`-` vs
`_` vs 無分隔），另一邊沒跟著改就會查表落空。**如果查表的 fallback 是
一個「看起來也算合理」的預設值**（像這裡的 `basic_pop`——它本身是個
正常、能正常播放的節奏），這種漂移會特別難被發現，因為成品不會壞掉，
只會「不對」。

下次新增節奏風格／曲風／任何需要跨表對照的識別碼時：

- 新增識別碼時，**同時**搜尋所有引用該識別碼字串的地方（`grep` 那個 id
  字面值），不要只改一處就假設其他地方會自動跟上。
- 幫每個對照表加一條測試，斷言「表裡列出的每一種可能輸入，都能查到一個
  非 fallback 的真實值」，而不是只測試幾個正常案例。

## 第三次發作（2026-08-23）：試聽按鈕只有巴薩諾瓦沒出現

使用者截圖：迪斯可、雷鬼、森巴的卡片都有 ▶ 試聽按鈕，只有巴薩諾瓦沒有，
但巴薩諾瓦的 NEW badge 跟「節奏由 漢克呂 調校」都正常顯示——**後端資料
沒問題**（直接 curl `/api/v1/assets/preview/bossa_nova` 是 200，正常
播放），問題在前端。

**同一種病，這次長在別的地方**：`CompositionParamsForm.tsx` 渲染
`RHYTHM_ONLY_STYLES` 卡片時，試聽按鈕的顯示/播放邏輯呼叫的是
`preview.canPreview(style.id)`，但 `useBeatPreview.ts` 的
`previewUrl()` 是拿**beat id**去查（`GENRE_BEAT_MAP[id] ?? id` 再查
`BEAT_TO_PRESET`），不是拿 style 自己的 `id` 查。

`RHYTHM_ONLY_STYLES` 裡兩筆資料的 `id` 和 `beat` 欄位：

| style | `id` | `beat` |
|---|---|---|
| 森巴 | `samba` | `samba`（兩者相同） |
| 巴薩諾瓦 | `bossa_nova` | `bossanova`（兩者不同！） |

森巴的 `id` 跟 `beat` 剛好是同一個字串，所以就算程式碼傳錯欄位
（`style.id`），查表結果剛好還是對的，**巧合掩蓋了 bug**。巴薩諾瓦的
`id`（`bossa_nova`，底線）跟 `beat`（`bossanova`，無底線）不一樣，
`GENRE_BEAT_MAP['bossa_nova']` 查無此鍵、`BEAT_TO_PRESET['bossa_nova']`
也查無此鍵，兩層都 fallback，最後落到 `basic_pop`——而 `basic_pop`
沒有 `preview_url`，所以 `canPreview()` 回傳 `false`，試聽按鈕整個
不渲染。跟前面兩次一模一樣的失敗哲學：**不報錯，只是悄悄不見**。

**修法**：把試聽按鈕那段的 `style.id` 全部改成 `style.beat`
（`canPreview`、`toggle`、`playing`/`loading` 比較都要一起改，這幾個
呼叫必須用同一個 key，只改一部分會讓「正在播放」的判斷跟按鈕本身對不
上）。`useBeatPreview.ts` 的註解其實早就寫明「Accepts a genre id or,
for styles that have no upstream genre（森巴）, a beat id directly」
——呼叫端傳錯欄位，不是這支 hook 的邏輯錯。

先寫了一個會在修復前失敗的測試
（`src/components/__tests__/CompositionParamsForm.test.tsx`）：
mock `useMusicGenPresets` 回傳的 `Map` 裡刻意不放 `basic_pop`，斷言
「森巴」跟「巴薩諾瓦」都要能找到試聽按鈕。修復前只有森巴那條過、波沙
諾瓦那條如預期失敗（`Unable to find role="button" ... 試聽 巴薩諾瓦
節奏`），修復後兩條都過。

**這是本篇「preset id 要跟查表 key 一致」通則的第三次真實案例**，前兩次
分別是「查表的 key 拼法不一致」（第一次發作）跟這次的「呼叫端傳錯欄位
（傳 id 而非 beat）」——同一個通則，不同的發生位置。任何時候一個實體
同時有 `id`（給 React key／表單 value 用）跟另一個語意不同的識別碼
（`beat`，給後端查表用）時，程式碼裡每一處用到「查表」的地方都要覆查
一次是不是誤用了 `id`。
