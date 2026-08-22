---
title: 前端 bpmRange 要跟後端 preset 的合法範圍對齊，否則靜默夾值
keywords: [bpm, bpmRange, preset, GENRE_BEAT_MAP, BEAT_TO_PRESET, 靜默夾值, clamp, reggae, disco, soul, tango, blues, country, presets/popular]
dateModified: 2026-08-23
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

## 完整鏈路與現況盤點

這個問題的完整結構橫跨 hylove-demo 跟 music-gen 兩個 repo，記在
`~/hylove/coordination/knowledge/entries/genre-to-preset-pipeline.md`
（那份有完整的落差表跟「dead fraction」數字，這裡不重複貼）。

## 2026-08-23 更新：soul／tango／blues／country 已處理，仍留 5 個未處理

musicgen 評估後，這 4 個曲風各自換了不同的處理方式（都是在既有 preset
之間重新分配，沒有新增素材）：

| 曲風 | 改動 | 結果 |
|---|---|---|
| `tango` | `BEAT_TO_PRESET['tango']`：`bossa_nova` → `rnb` | bpmRange 不用動（`[60,100]`），跟 `rnb` 的 `[75,100]` 有實質交集，比原本借 `bossa_nova`（`[100,150]`，幾乎零交集）好很多 |
| `blues` | `BEAT_TO_PRESET['jazz']`：`rnb` → `lofi` | bpmRange `[60,80]` → `[70,90]`，對齊 `lofi` 的 `[70,90]`，完整交集 |
| `country` | 不動（維持 `basic_pop`） | bpmRange `[60,100]` → `[90,130]`，對齊 `basic_pop` 的 `[90,130]`，完整交集 |
| `soul` | 新增專屬 beat id `soul`（`GENRE_BEAT_MAP.soul` 從借用 `bossanova` 改成專屬的 `soul`），`BEAT_TO_PRESET['soul']` → `ballad` | bpmRange `[30,60]` → `[60,80]`，對齊 `ballad` 的 `[60,80]`，數字上完整交集 |

**soul 這條老實講不算真正修好**，只是選了目前能做到最好的妥協：
`30–60` 才是 soul 原本該有的慢速抒情速度，`ballad` preset 的
`[60,80]` 不是為 soul 調校的，只是恰好是目前 preset 庫裡跟 soul 最
接近、能給出完整交集的選項。這次改動消除了「滑桿選的值跟實際播放
不一致」這個**顯性 bug**，但沒有解決「soul 這個曲風本來就沒有真正
適合它、由音樂人調校過的節奏」這個**更底層的缺口**——如果之後音樂
家提供 soul 專屬素材，這裡要重新評估，不要誤以為這件事已經完全
解決。

同時在 `src/utils/beatPresets.ts` 新增了本地預覽用的 `soul`
BeatPreset 條目——這是因為 `GENRE_BEAT_MAP` 的每個值都必須能在本地
`BEAT_PRESETS` 找到對應項目（`rhythmStyles.test.ts` 有斷言這件事），
新增一個從未出現過的 beat id（`soul`）時容易漏掉這一步，跟後端的
`BEAT_TO_PRESET`／preset YAML 是完全不同的兩張表，各自都要顧到。

## 仍未處理

`waltz`／`quick_waltz`（共用 `compound_ballad`）、`rock`／`twist`
（共用 `basic_pop`）、`chacha`（`basic_pop`）、`giliba`（`basic_pop`）
這 5 個曲風的落差還在，狀態見
`~/hylove/coordination/WORKLOG.md`。

## 通則

任何「前端呈現一個可選範圍／清單，後端有一份權威的合法範圍」的欄位
（BPM、樂器音域、任何 min/max），只要沒有自動化機制保證兩邊同步，
遲早會漂移，而且多半是**靜默**漂移（後端夾值、fallback、四捨五入都
不報錯）。專屬 1:1 對應的欄位（像 reggae/disco）可以直接對齊數字；
共用/多對一的欄位需要先確認「該不該共用」這個更上層的設計問題，再談
要對齊到哪個數字——而且就算對齊了數字，也要誠實區分「消除了顯性
bug」跟「這個曲風本來就該有專屬素材、只是還沒有」是兩件不同的事
（見上面 soul 的案例），不要把前者寫成後者已經解決。

新增一個此前不存在的 beat id（像這次的 `soul`）時，記得同時檢查
`GENRE_BEAT_MAP` → 本地 `BEAT_PRESETS`（`beatPresets.ts`）跟
`GENRE_BEAT_MAP` → `BEAT_TO_PRESET`（`musicGenService.ts`）**兩條**
查表路徑都要有對應項目，兩者是完全獨立維護的表，只顧到其中一條會
在測試或執行期才被發現。
