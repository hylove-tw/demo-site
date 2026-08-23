---
title: 兩個獨立入口能改同一個欄位，遲早會不同步（森巴顯示「流行」）
keywords: [beat, genre, accompaniment, activeStyle, CompositionParamsForm, MusicReportEditor, DualMusicReportEditor, 自訂曲風, state drift]
dateModified: 2026-08-23
---

# 兩個獨立入口能改同一個欄位，遲早會不同步（森巴顯示「流行」）

## 症狀

使用者在正式站選了森巴，生成完成後「生成設定」面板顯示「節奏：流行」
（不是森巴），BPM 顯示 175 但實際播放明顯比較慢；另外有使用者曾在其他
節奏選過「不使用伴奏」，之後切到森巴，音樂家編排的伴奏拍點整段被跳過。

## 真正原因

跟 [shared-logic-across-ui-paths](shared-logic-across-ui-paths.md) 記錄的
「同一段邏輯兩處各自實作」不同——這次是**同一個欄位（`editParams.beat`）
有兩個互不知情的獨立寫入入口**：

1. `CompositionParamsForm.tsx` 透過 `applyGenre`／`applyRhythmStyle` 改
   `beat`（曲風決定的那一條路徑）。
2. `MusicReportEditor.tsx`／`DualMusicReportEditor.tsx` 各自還放了一個
   **完全獨立的「節奏風格」`<select>`**，直接
   `handleParamChange('beat', e.target.value)`，完全不經過
   `CompositionParamsForm`，也完全不碰 `editParams.genre`。

只要使用者用了入口 2（或入口 1 切曲風時忘了清掉入口 2 留下的值），
`editParams.beat` 跟 `editParams.genre` 就會各自代表不同的選擇。下游至少
兩處只看 `beat`、不管 `genre` 是否還對得上：

- `RHYTHM_ONLY_STYLES.find(st => st.beat === value.beat)`（`activeStyle`
  的算法）——只要 `beat` 剛好等於某個風格限定節奏，畫面就會顯示成那個
  風格，即使 `genre` 欄位是別的值。
- `presetForBeat(musicGenPresets, editParams.beat)?.hasAccompaniment`——
  伴奏方式的顯示／生效與否，也只看 `beat`。而 `editParams.accompaniment`
  本身也沒有隨 `beat` 改變被重置，所以「上一個節奏選的『不使用伴奏』」
  會原封不動帶到下一個完全不同的節奏。

兩個問題合起來，症狀就是「顯示錯的曲風名稱」加「伴奏設定悄悄失效」，
看起來像同一個 bug，其實是同一種根因（欄位可以被繞過主流程直接改）在
兩個不同下游消費點上的兩種表現。

## 處理

`e50216e`（重新設計）與 `bab9153`（收斂後才抓到的第二層 drift）把
「能寫 `beat` 的入口」收斂成只有一個：

- 移除 `MusicReportEditor.tsx`／`DualMusicReportEditor.tsx` 裡各自的
  「節奏風格」`<select>`，改成只能透過 `CompositionParamsForm` 的曲風
  選擇，或明確選「自訂」曲風後的主旋律／伴奏節奏欄位去改變 `beat`。
- 加一個新的 sentinel 曲風值 `'custom'`：選了「自訂」才會顯示主旋律／
  伴奏節奏的手動選單；選任何真實曲風都會透過 `applyGenre`／
  `applyRhythmStyle`，**同時清掉 `beat`**（見下一條，這是事後在 review
  時才抓到的第二層 drift）。
- 兩個編輯器在 `CompositionParamsForm` 的 `onChange` 外包一層：只要
  `beat` 改變了，就把 `accompaniment` 重置回預設值，不再讓舊節奏的伴奏
  設定跨節奏殘留。

### 收斂後仍要小心的第二層 drift

把「能寫入口」收斂成一個之後，**同一個入口內部仍然可能有兩條分支各自
決定要不要清掉 `beat`**：`selectGenre()` 一開始只在「自訂」分支清了
`beat`，選一般曲風的分支直接呼叫 `applyGenre`（不動 `beat`）——於是先選
森巴（`beat: 'samba'`）、再選一般曲風（例如雷鬼）時，`beat` 依然是舊的
`'samba'`，`activeStyle` 用 beat 誤配對，回到最初的症狀。收斂到一個入口
只解決「誰能改欄位」，不會自動保證「每一條分支都記得清掉不再適用的舊
狀態」——這仍然要逐一檢查每一條分支。

## 通則

- 一個欄位如果有除了「主要決策路徑」（這裡是曲風選擇）以外的**第二個
  獨立寫入點**，就要假設它遲早會跟主要路徑的假設脫鉤——尤其當下游消費
  這個欄位時，只看欄位本身的值、不檢查跟它邏輯上綁定的其他欄位
  （這裡是 `genre`）是否仍然一致。
- 收斂成單一入口之後，**入口內部的每一條分支都要重新檢查**：切換到分支
  A 有沒有清掉只屬於分支 B 的殘留欄位。合併入口只保證「同一時間只有一個
  地方在決定」，不保證「決定的邏輯本身完整」。
- 一個欄位改變時，**跟它相依、但範圍受限於它的其他欄位**（例如
  `accompaniment` 只在特定節奏下有意義）要一併重置成預設值，不要指望
  使用者自己記得手動改回來。
