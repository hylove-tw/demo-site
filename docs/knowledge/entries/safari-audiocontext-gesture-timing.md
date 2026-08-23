---
title: Safari 要求 AudioContext 在使用者手勢裡同步建立，晚一個 await 都不算數
keywords: [Safari, WebKit, AudioContext, autoplay, user gesture, StemMixer, Web Audio API, decodeAudioData]
dateModified: 2026-08-23
---

# Safari 要求 AudioContext 在使用者手勢裡同步建立，晚一個 await 都不算數

## 症狀

混音器（`StemMixer.tsx`）點播放後，畫面上一切正常——按鈕變成暫停圖示、
進度條照著實際時長前進、4 軌音量顯示都是 `+0.0 dB`——但完全沒有聲音。
Console 沒有任何錯誤，`loadError`／`addError` 也沒有顯示。只在 Safari
（macOS）出現，同一頁的曲風卡片「▶ 試聽」按鈕（`useBeatPreview`，用
`<audio>` 元素）在同一次測試裡播放完全正常。

## 真正原因

排除順序（每一層都有實測，不是憑空猜測）：後端生成的 mp3 本身不是靜音
（`ffmpeg volumedetect`／`astats` 量測過，正常音量）；nginx 轉發前後
byte-for-byte 相同；把同一批真實檔案抓下來，在 headless Chromium 裡用
`OfflineAudioContext` 完整重現 `connectBuffer`／`startPlayback` 的
decode→gain→destination 圖形，渲染出來的音訊也是正常音量——**播放圖形
本身沒有問題**。

真正問題出在**建立 `AudioContext` 的時機**。`StemMixer.tsx` 原本的呼叫鏈：

```
handlePlay（點擊，同步）
  → startPlayback（async）
    → await loadFixed()
      → await fetchAndDecode()
        → await fetch(url)        ← 第一個 await，讓出事件迴圈
        → ensureCtx() → new AudioContext()   ← 這時才建立
```

`new AudioContext()` 要等到第一個 stem 的 `fetch()` **resolve 之後**才會
執行——已經脫離了原本點擊事件的同步呼叫堆疊。Safari／WebKit 對這件事
非常嚴格：只有在觸發手勢的**同一個同步呼叫堆疊裡**建立或 `resume()`
`AudioContext`，才會真的解鎖音訊輸出；晚一個 microtask 都不算數。但
`AudioContext.state` 的 getter 不會誠實反映這件事——它照樣回報
`'running'`，`currentTime` 也照樣正常前進，**JS 端看起來完全正常，唯獨
真的沒有聲音送到喇叭**。Chrome／Firefox 對這個時序寬鬆得多（有「sticky
user activation」的概念，不要求嚴格同步），所以同一段程式碼在那兩個瀏覽器
上從來沒出過問題，直到第一次真的用 Safari 測才暴露出來。

`useBeatPreview` 的試聽按鈕能正常播放，是因為它用的是
`HTMLAudioElement.play()`，走的是 Safari 對 `<audio>` 元素比較寬鬆的
autoplay 解鎖規則，跟 Web Audio API 的 `AudioContext` 解鎖是兩條完全不同
的判定路徑——這也是為什麼「試聽正常、混音器沒聲音」看起來像互相矛盾，
其實兩者本來就不是同一套機制在把關。

## 處理

在每一個可能是第一次觸碰音訊的使用者手勢處理函式（`handlePlay`、
`handleSeekCommit`、`addOptionalStem`）**最開頭、任何 `await` 之前**，
同步呼叫一次 `ensureCtx()` 並視需要 `resume()`：

```ts
const unlockAudioForGesture = () => {
    const ctx = ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
};

const handlePlay = () => {
    unlockAudioForGesture();       // 同步，在任何 await 之前
    startPlayback(startOffsetRef.current);
};
```

`ensureCtx()` 本身是 idempotent（已存在就直接回傳），所以 `fetchAndDecode`
裡原本那次呼叫不用拿掉——它會拿到同一個、已經在手勢裡解鎖過的 context。
重點只是**確保第一次呼叫發生在同步階段**，之後在哪裡再呼叫都沒差。

`resume()` 不需要 `await`：Safari 在意的是這個呼叫本身有沒有跟手勢同步
發生，不是等它 resolve；讓 promise 在背景 resolve、程式碼繼續往下走去做
非同步的 fetch／decode 完全沒問題。

## 通則

- **Web Audio API 的自動播放解鎖判定，比 `<audio>` 元素嚴格且不寬容非同步
  延遲**——尤其在 Safari／WebKit：只要 `new AudioContext()` 或第一次
  `resume()` 不是跟觸發手勢同一個同步呼叫堆疊，就可能解鎖失敗，而且
  **失敗是靜默的**：`state`／`currentTime` 這些 JS 端看得到的狀態完全不會
  反映出來。
- 檢查點：任何「點擊播放」類的處理函式，如果第一步就是 `await` 一個
  fetch／decode／其他非同步操作，而 `AudioContext` 的建立埋在那條非同步
  鏈的某處，就要懷疑這個問題——把 `ensureCtx()`／`resume()` 搬到手勢處理
  函式最前面、任何 `await` 之前。
- 這類 bug 只會在 Safari（含 iOS）暴露，Chrome／Firefox 的寬鬆時序會
  完全掩蓋它——**不能只在 Chrome 測過就當作播放邏輯沒問題**，任何用到
  `AudioContext`（而非單純 `<audio>` 元素）的播放功能，至少要在 Safari
  上手動測過一次點擊播放。
- jsdom 沒有實作 `AudioContext`，這類 bug 沒辦法直接測「有沒有聲音」；
  可測的替代方案是斷言「`AudioContext` 建構子確實在手勢的同步呼叫裡被
  呼叫，而不是要等某個非同步操作 resolve 之後」——用一個永遠不 resolve 的
  `fetch` mock 卡住後面的非同步鏈，就能確定性地區分「同步建立」跟
  「非同步建立」兩種情況（見 `StemMixer.test.tsx`）。
