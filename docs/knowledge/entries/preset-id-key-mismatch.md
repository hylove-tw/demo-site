---
title: preset id 要跟查表 key 完全一致，否則靜默 fallback
keywords: [preset, beatPresets, BEAT_TO_PRESET, bossa nova, samba, 節奏風格, 對照表, 靜默失敗, resolveRhythmPreset]
dateModified: 2026-08-22
---

# preset id 要跟查表 key 完全一致，否則靜默 fallback

## 症狀

波沙諾瓦（Bossa Nova）這個節奏風格從卡片網格點下去，實際生成的音樂卻是
`basic_pop`（一般流行樂節奏），聽起來完全不像波沙諾瓦。沒有任何錯誤訊息、
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
