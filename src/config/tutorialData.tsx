// src/config/tutorialData.tsx
import React from 'react';

// 類型定義
export interface FeatureCard {
  badge: string;
  badgeColor?: string;
  title: string;
  description: string;
}

export interface CollapseItem {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface GuideCard {
  title: string;
  content: React.ReactNode;
}

export interface QuickStartStep {
  title: string;
  description: string;
}

// What is HyLove 資料
export const CORE_FEATURES: FeatureCard[] = [
  { badge: '主要', title: '元神音', description: '將腦波資料轉換為獨特的心靈音樂，以三聲部樂譜呈現您的腦波韻律。' },
  { badge: '主要', title: '琴瑟合', description: '雙人腦波六聲部合奏音樂，呈現兩人腦波的和諧互動。' },
  { badge: '主要', title: '亨運來', description: 'H.R 人力資源八大職能評估，分析個人的工作特質與潛能。' },
  { badge: '主要', title: '貞天賦', description: '八項人格特質潛能分析，深入了解個人天賦與發展方向。' },
  { badge: '主要', title: '珍寶炁', description: '礦物結晶體炁場測試（台灣專利），分析人與礦石的能量共振。' },
  { badge: '主要', title: '情香意', description: '香氛炁場測試與芳療建議，找出最適合您的精油配方。' },
];

export const MORE_FEATURES: CollapseItem[] = [
  {
    title: <><span className="badge badge-secondary badge-sm mr-2">利養炁</span>正念修行系列</>,
    content: (
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li><strong>正念修行</strong> - 身心指數評估</li>
        <li><strong>練炁修行</strong> - 能量運行分析</li>
        <li><strong>練炁品階</strong> - 修行境界評估</li>
      </ul>
    ),
  },
  {
    title: <><span className="badge badge-accent badge-sm mr-2">易 Motion</span>情緒評比系列</>,
    content: (
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li><strong>情緒管理系統</strong> - 員工情緒追蹤與預測</li>
        <li><strong>寵物評比測試</strong> - 視覺+觸覺情緒分析</li>
        <li><strong>品茶/品酒/品咖啡</strong> - 嗅覺+味覺情緒分析</li>
        <li><strong>香水評比測試</strong> - 嗅覺情緒分析</li>
        <li><strong>音樂演奏/歌曲演唱</strong> - 聽覺情緒分析</li>
        <li><strong>短視頻廣告評比</strong> - 視聽覺情緒分析</li>
      </ul>
    ),
  },
];

export const SYSTEM_STATS = [
  { title: '檔案支援', value: 'CSV / XLSX', desc: '標準腦波資料格式' },
  { title: '資料儲存', value: '本地瀏覽器', desc: '隱私安全有保障' },
  { title: '分析報告', value: '可列印 PDF', desc: '專業報告輸出' },
];

// User Guide 資料
export const QUICK_START_STEPS: QuickStartStep[] = [
  { title: '確認受測者', description: '系統右上角會顯示目前受測者，可前往「受測者管理」新增或切換' },
  { title: '上傳腦波檔案', description: '前往「腦波檔案管理」上傳 CSV 或 XLSX 格式的腦波資料' },
  { title: '選擇分析功能', description: '從首頁選擇要使用的分析功能' },
  { title: '執行分析並查看報告', description: '選擇前測/後測資料，點擊「開始分析」' },
];

export const GUIDE_SECTIONS: GuideCard[] = [
  {
    title: '受測者管理',
    content: (
      <div className="space-y-4">
        <p>受測者管理功能讓您建立多個受測者資料，方便管理不同客戶或個案的腦波分析紀錄。</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">新增受測者</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-base-content/70">
              <li>點擊「受測者管理」</li>
              <li>點擊「新增受測者」</li>
              <li>填寫姓名、電話、Email</li>
              <li>點擊「儲存」</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">切換受測者</h4>
            <p className="text-sm text-base-content/70">
              在受測者列表中點擊「切換」按鈕即可切換至該受測者。目前選取的受測者會以綠色標籤標示。
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: '腦波檔案管理',
    content: (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <span className="badge badge-primary badge-sm">CSV</span>
          <span className="badge badge-primary badge-sm">XLSX</span>
          <span className="text-sm text-base-content/60">支援格式</span>
        </div>
        <h4 className="font-medium">上傳檔案</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>點擊「腦波檔案管理」</li>
          <li>點擊「選擇檔案」（可多選）</li>
          <li>點擊「上傳檔案」</li>
        </ol>
        <h4 className="font-medium mt-4">檢視資料</h4>
        <p className="text-sm text-base-content/70">
          點擊檔案的「⋯」選單並選擇「檢視」，可以用<strong>熱力圖</strong>或<strong>表格</strong>模式查看腦波資料。
        </p>
        <h4 className="font-medium mt-4">建立群組</h4>
        <p className="text-sm text-base-content/70">
          將相關檔案（如同一次測試的前測/後測）組成群組，執行分析時可快速選擇。
        </p>
      </div>
    ),
  },
  {
    title: '執行分析',
    content: (
      <div className="space-y-4">
        <ol className="list-decimal list-inside space-y-2">
          <li>從首頁選擇分析功能</li>
          <li>選擇前測資料（分析前的腦波）</li>
          <li>選擇後測資料（分析後的腦波）</li>
          <li>填寫其他必要參數（如有）</li>
          <li>點擊「開始分析」</li>
        </ol>
        <div className="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>可使用「群組選擇」快速填入已建立群組的檔案。</span>
        </div>
      </div>
    ),
  },
  {
    title: '查看報告',
    content: (
      <div className="space-y-4">
        <p>分析完成後會自動產生報告，包含：分析摘要、數據圖表、詳細結果、建議說明。</p>
        <h4 className="font-medium">報告操作</h4>
        <ul className="list-disc list-inside space-y-1 text-sm ml-2">
          <li><strong>列印報告</strong> - 列印或儲存為 PDF</li>
          <li><strong>返回首頁</strong> - 回到系統首頁</li>
          <li><strong>再次分析</strong> - 使用相同功能進行新分析</li>
        </ul>
        <h4 className="font-medium mt-4">樂譜報告設定（元神音/琴瑟合）</h4>
        <p className="text-sm text-base-content/70 mb-2">音樂類分析報告可調整以下設定：</p>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          {[
            { badge: '樂器', text: '選擇不同聲部的音色' },
            { badge: '速度', text: '調整 BPM 播放速度' },
            { badge: '音量', text: '各聲部與鼓聲音量' },
            { badge: '節奏', text: '選擇節奏風格' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-base-200 rounded">
              <span className="badge badge-sm">{item.badge}</span>
              <span>{item.text}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 p-2 bg-base-200 rounded md:col-span-2">
            <span className="badge badge-sm badge-primary">自動連結</span>
            <span>八分音符及更短的音符自動以橫線連結</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: '歷史紀錄',
    content: (
      <div className="space-y-4">
        <p>所有分析結果會自動儲存，可隨時從「歷史紀錄」查閱。</p>
        <h4 className="font-medium">篩選功能</h4>
        <div className="flex flex-wrap gap-2">
          {['依狀態', '依分析類型', '依受測者', '關鍵字搜尋'].map((text, i) => (
            <span key={i} className="badge badge-outline">{text}</span>
          ))}
        </div>
      </div>
    ),
  },
];

// FAQ 資料
export const FAQ_ITEMS: CollapseItem[] = [
  {
    title: '為什麼我的檔案上傳失敗？',
    content: (
      <>
        <p>請確認：</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>檔案格式為 CSV 或 XLSX</li>
          <li>檔案沒有損壞</li>
          <li>已選擇受測者</li>
        </ul>
      </>
    ),
  },
  {
    title: '分析結果顯示錯誤怎麼辦？',
    content: (
      <>
        <p>如果看到「Request failed with status code 422」之類的錯誤，可能是因為：</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>檔案格式不符合分析要求</li>
          <li>後端 API 服務暫時無法使用</li>
          <li>網路連線問題</li>
        </ul>
        <p className="mt-2">請確認檔案內容正確，並稍後再試。</p>
      </>
    ),
  },
  {
    title: '資料儲存在哪裡？',
    content: (
      <>
        <p>所有資料都儲存在瀏覽器的 localStorage 中。這代表：</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>資料只存在於您目前使用的瀏覽器</li>
          <li>清除瀏覽器資料會導致所有資料遺失</li>
          <li>不同裝置或瀏覽器無法共享資料</li>
        </ul>
      </>
    ),
  },
  {
    title: '如何備份我的資料？',
    content: <p>目前系統暫不支援匯出/備份功能。建議定期將重要的分析報告列印為 PDF 保存。</p>,
  },
  {
    title: '前測和後測資料有什麼差別？',
    content: (
      <p>
        前測資料是進行某項活動「之前」收集的腦波資料，後測資料是進行該活動「之後」收集的資料。
        系統會比較兩者的差異來產生分析結果。
      </p>
    ),
  },
  {
    title: '樂譜播放沒有聲音怎麼辦？',
    content: (
      <>
        <p>請確認：</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>裝置音量已開啟</li>
          <li>瀏覽器沒有被靜音</li>
          <li>首次播放需點擊畫面以啟用音訊（瀏覽器安全限制）</li>
        </ul>
      </>
    ),
  },
  {
    title: '可以在手機上使用嗎？',
    content: (
      <p>
        可以。系統支援響應式設計，在手機和平板上都能正常使用。
        但建議使用桌面電腦以獲得最佳體驗，特別是查看報告和樂譜時。
      </p>
    ),
  },
];
