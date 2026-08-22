---
title: 平行 UI 路徑的同一段邏輯要抽 helper 共用，不要兩處各自維護
keywords: [DRY, helper, applyGenre, applyRhythmStyle, CompositionParamsForm, compact, 卡片版, 下拉版, 平行路徑漂移]
dateModified: 2026-08-22
---

# 平行 UI 路徑的同一段邏輯要抽 helper 共用，不要兩處各自維護

## 症狀

兩個各自獨立的 bug，實際上是同一個根因的兩次發作：

1. 波沙諾瓦（Bossa Nova）從曲風卡片網格點下去，聲音是錯的
   （見 [preset-id-key-mismatch](preset-id-key-mismatch.md)）。
2. 表單切到 `variant="compact"`（報告編輯器用的下拉選單模式）時，
   森巴、波沙諾瓦這兩個節奏風格**完全不在選單裡**，選不到——即使
   BEAT_TO_PRESET 的 key 已經修好了也一樣，因為這個模式的 `<select>`
   壓根沒有列出它們的 `<option>`。

## 真正原因

`CompositionParamsForm.tsx` 對「選了某個節奏風格（森巴／波沙諾瓦）該
套用哪些參數」這件事，原本有**兩份各自獨立的實作**：

- 卡片網格（`variant="full"`）的 `onClick`：內嵌一段
  `{ ...applyGenre(value, style.baseGenre), beat: style.beat, bpm:
  getBpmMidpoint(style.bpmRange) }`。
- compact 下拉選單（`variant="compact"`）：`<select>` 裡的 `<option>`
  從頭到尾只列了 `GENRES`，從未列過 `RHYTHM_ONLY_STYLES`——不是邏輯寫
  錯，是**這條路徑根本沒有對應的分支**。

兩處「選了某風格要做什麼」的知識分別長在不同地方，只要維護時只改了
其中一處（或像 compact 這邊，一開始就沒把第二種選項納入），另一處就會
悄悄落後，而且不會有任何錯誤或測試失敗提醒你——因為從語法上看，兩處
都是「合法但不完整」的程式碼。

## 處理

抽出共用函式 `applyRhythmStyle(params, style)`（見 commit `5a81c9f`），
把「套用一個節奏限定風格該做的事」收斂成一份實作：

```ts
export function applyRhythmStyle(params: CompositionParams, style: RhythmOnlyStyle): CompositionParams {
    return {
        ...applyGenre(params, style.baseGenre),
        beat: style.beat,
        bpm: getBpmMidpoint(style.bpmRange),
    };
}
```

卡片網格的 `onClick` 跟 compact 下拉選單的 `onChange` 都呼叫這一份
helper。同時把 compact 下拉選單原本缺漏的 `RHYTHM_ONLY_STYLES`
`<option>` 補上——這一步無法靠「抽 helper」自動解決，因為問題不是邏輯
寫錯，而是那條路徑**從未把這個分支考慮進去**；抽 helper 解決的是
「以後兩處會不會又不同步」，不是「這次的缺漏」本身。

## 通則

**同一個網域邏輯（domain logic）如果被兩個或以上平行的 UI 呈現方式
各自實作一份，遲早會drift**——不管是因為其中一份忘了跟進修改，還是
（像 compact 選單這樣）其中一份從一開始就沒涵蓋到某個分支。

檢查點：

- 看到「這段 onClick／onChange 邏輯，是不是在另一個 variant／另一種
  呈現方式裡也出現過類似的東西」，就該考慮抽成共用函式，而不是等
  drift 真的發生了才處理。
- 抽 helper 只解決「維護時忘記同步改」這一類 drift；「一開始設計時
  就漏掉某個分支」這一類缺漏，仍然需要逐一檢查每個平行路徑是否涵蓋了
  所有應該涵蓋的選項——抽 helper 之後，至少下次要補分支時，只需要在
  一個地方確認邏輯對不對，不用擔心邏輯本身兩處不一致。
