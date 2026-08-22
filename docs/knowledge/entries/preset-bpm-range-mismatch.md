---
title: 前端 bpmRange 要跟後端 preset 的合法範圍對齊，否則靜默夾值
keywords: [bpm, bpmRange, preset, GENRE_BEAT_MAP, 靜默夾值, clamp, reggae, disco, presets/popular]
dateModified: 2026-08-22
---

# 前端 bpmRange 要跟後端 preset 的合法範圍對齊，否則靜默夾值

跟 [preset-id-key-mismatch](preset-id-key-mismatch.md) 是同一種「兩處
各自維護、沒對齊」的模式，但這次落差的不是識別碼拼法，是**數值範圍**。

## 症狀

雷鬼（Reggae）的 BPM 滑桿在畫面上可以拉到 60~120，選了範圍外的值送出
去，成品的節奏聽起來卻不是選的那個速度——沒有任何錯誤、沒有 API
warning，畫面顯示的數字跟耳朵聽到的對不上。

音樂家（漢克呂）今天的回饋提到「雷鬼沒有問題」，但同時指出森巴、
Bossa Nova 的速度區間很敏感（森巴一定要 150 以上，太慢會變成另一種
樂風）——這帶出一個問題：**這些「合法速度區間」目前只活在後端的
preset YAML 裡，前端的 `bpmRange` 是憑經驗／感覺訂的，兩邊從來沒有
機制保證對齊。**

## 真正原因

`src/config/musicCreativeConstants.ts` 的 `GENRES[].bpmRange` 只決定
「畫面上滑桿能拉到哪裡」，跟 music-gen repo `presets/popular/*.yaml`
裡每個節奏 preset 實際生效的 `bpm_range` 是**兩份完全獨立維護的數
字**，沒有任何測試或型別把它們釘在一起。music-gen 內部對超出
`bpm_range` 的請求會靜默夾到合法範圍（跟
[preset-id-key-mismatch](preset-id-key-mismatch.md) 描述的「查表落空
時靜默 fallback」是同一種失敗哲學：**不報錯，只是悄悄不對**）。

實測 `presets/popular/reggae.yaml`：`bpm_range: [75, 100]`，但前端
`reggae` 的 `bpmRange` 原本是 `[60, 120]`——選 60~74 或 101~120
的任何值都會被後端夾掉，使用者完全不會被告知。

## 處理

把 `reggae` 的 `bpmRange` 改成 `[75, 100]`，跟 `reggae.yaml` 對齊；
順手把 `disco` 從 `[90, 120]` 放寬到 `[90, 140]`（`disco.yaml` 的
`bpm_range: [90, 140]`，前端原本只是偏窄、不會被夾，純粹讓使用者能選
滿後端支援的範圍）。

**這兩個是目前唯一「一個曲風只對應一個專屬 preset」的乾淨案例**
（`reggae` → `reggae.yaml`、`disco` → `disco.yaml`），對齊的意義很
明確。

## 通則，以及一個尚未處理、範圍更大的發現

掃過 `GENRE_BEAT_MAP` 之後發現：**其餘 11 個曲風裡，有 9 個共用少數
幾個通用 preset**（`basic_pop`、`rnb`、`compound_ballad`、
`bossa_nova`），而這些通用 preset 的 `bpm_range` 往往跟共用它的曲風
差很多——例如 `soul`（前端 `[30, 60]`）透過 `GENRE_BEAT_MAP` 借用
`bossa_nova` 這個節奏（`bpm_range: [100, 150]`），兩個區間**完全不
重疊**；`tango`（`[60, 100]`）也借同一個 preset，只有邊界的 100
重疊。這意味著選 soul／tango 時，不管滑桿選哪個值，實際節奏播放的
速度幾乎必然被夾到 100 起跳，跟 reggae 的「部分範圍會被夾」相比，
這兩個是「幾乎整個範圍都會被夾」，情況更嚴重。

**這批沒有一併修**，原因是這些曲風背後是共用的通用 preset，不是
專屬 preset——要不要把 `soul`／`tango`／`blues`／`twist`／`rock`／
`country`／`quick_waltz`／`chacha`／`giliba` 的 `bpmRange` 硬對齊到
它們各自借用的通用 preset 範圍，還是應該重新考慮這些曲風該借用哪個
節奏、甚至該不該共用同一個 preset，是需要跟後端一起決定的設計問題，
不是單純「改個數字對齊」就能解的——留給下一輪處理，記在這裡避免
遺忘。

**通則**：任何「前端呈現一個可選範圍／清單，後端有一份權威的合法範圍」
的欄位（BPM、樂器音域、任何 min/max），只要沒有自動化機制保證兩邊
同步，遲早會漂移，而且多半是**靜默**漂移（後端夾值、fallback、四捨
五入都不報錯）。專屬 1:1 對應的欄位（像 reggae/disco）可以直接對齊
數字；共用/多對一的欄位需要先確認「該不該共用」這個更上層的設計問題，
再談要對齊到哪個數字。
