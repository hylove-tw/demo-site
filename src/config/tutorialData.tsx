// src/config/tutorialData.tsx
import React from 'react';

// 類型定義
export interface TutorialSection {
  id: string;
  title: string;
  group: 'intro' | 'guide' | 'features' | 'faq';
  content: React.ReactNode;
}

export interface SectionGroup {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

// 群組定義
export const SECTION_GROUPS: SectionGroup[] = [
  { id: 'intro', title: '關於 HyLove' },
  { id: 'guide', title: '使用指南' },
  { id: 'features', title: '功能說明' },
  { id: 'faq', title: '常見問題' },
];

// 通用元件
const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="alert alert-info">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{children}</span>
  </div>
);

const WarningBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="alert alert-warning">
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <span>{children}</span>
  </div>
);

// 所有章節內容
export const TUTORIAL_SECTIONS: TutorialSection[] = [
  // ===== What is HyLove? =====
  {
    id: 'overview',
    title: '關於 HyLove',
    group: 'intro',
    content: (
      <div className="space-y-8">
        {/* 簡介 */}
        <p className="text-lg leading-relaxed">
          HyLove 是一套開源的<strong>腦波分析系統</strong>，所有資料儲存於瀏覽器本地端，確保完全的資料隱私。
        </p>

        {/* 核心概念 */}
        <div>
          <h3 className="text-xl font-semibold mb-3">核心概念</h3>
          <p className="text-base-content/80">
            透過先進的演算法，將腦波資料轉換為有意義的分析報告，協助您了解大腦活動模式。
            系統支援多種分析模式，包含音樂轉換、職能評估、能量分析等功能。
          </p>
        </div>

        {/* 主要特色 */}
        <div>
          <h3 className="text-xl font-semibold mb-4">主要特色</h3>
          <div className="space-y-4">
            {/* 隱私與安全 */}
            <div>
              <h4 className="font-medium text-primary mb-2">隱私與安全</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70 ml-2">
                <li>資料完全儲存於瀏覽器本地端</li>
                <li>無需伺服器帳號或登入</li>
                <li>您的資料不會上傳至雲端</li>
              </ul>
            </div>
            {/* 多元分析 */}
            <div>
              <h4 className="font-medium text-primary mb-2">多元分析模式</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70 ml-2">
                <li>腦波音樂轉換（元神音、琴瑟合）</li>
                <li>職能與人格評估（亨運來、貞天賦）</li>
                <li>能量與情緒分析（利養炁、易 Motion 系列）</li>
              </ul>
            </div>
            {/* 易於使用 */}
            <div>
              <h4 className="font-medium text-primary mb-2">易於使用</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70 ml-2">
                <li>支援 CSV / XLSX 標準格式</li>
                <li>報告可列印或儲存為 PDF</li>
                <li>響應式設計，支援各種裝置</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 快速開始 */}
        <div>
          <h3 className="text-xl font-semibold mb-4">快速開始</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { title: '受測者管理', desc: '建立與管理受測者資料', section: 'user-management' },
              { title: '檔案管理', desc: '上傳與管理腦波檔案', section: 'file-management' },
              { title: '執行分析', desc: '選擇功能並開始分析', section: 'run-analysis' },
              { title: '功能說明', desc: '了解各分析功能詳情', section: 'yuanshenyin' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-base-content/60">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 為什麼選擇 HyLove */}
        <div>
          <h3 className="text-xl font-semibold mb-3">為什麼選擇 HyLove？</h3>
          <div className="flex flex-wrap gap-2">
            {['隱私優先', '本地儲存', '多元分析', '專業報告', '易於操作'].map((item, i) => (
              <span key={i} className="badge badge-lg badge-outline">{item}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  // ===== User Guide =====
  {
    id: 'quick-start',
    title: '快速開始',
    group: 'guide',
    content: (
      <div className="space-y-6">
        <p>首次使用 HyLove 系統，請依照以下步驟操作：</p>
        <ul className="steps steps-vertical">
          {[
            { title: '確認受測者', desc: '系統右上角會顯示目前受測者，可前往「受測者管理」新增或切換' },
            { title: '上傳腦波檔案', desc: '前往「腦波檔案管理」上傳 CSV 或 XLSX 格式的腦波資料' },
            { title: '選擇分析功能', desc: '從首頁選擇要使用的分析功能' },
            { title: '執行分析並查看報告', desc: '選擇前測/後測資料，點擊「開始分析」' },
          ].map((step, i) => (
            <li key={i} className="step step-primary">
              <div className="text-left ml-4">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-base-content/60">{step.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <InfoBox>首次使用時，系統會自動建立一個「預設受測者」供您使用。</InfoBox>
      </div>
    ),
  },
  {
    id: 'user-management',
    title: '受測者管理',
    group: 'guide',
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
        <WarningBox>刪除受測者時，該受測者的檔案和分析記錄不會被刪除。</WarningBox>
      </div>
    ),
  },
  {
    id: 'file-management',
    title: '腦波檔案管理',
    group: 'guide',
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
    id: 'run-analysis',
    title: '執行分析',
    group: 'guide',
    content: (
      <div className="space-y-4">
        <ol className="list-decimal list-inside space-y-2">
          <li>從首頁選擇分析功能</li>
          <li>選擇前測資料（分析前的腦波）</li>
          <li>選擇後測資料（分析後的腦波）</li>
          <li>填寫其他必要參數（如有）</li>
          <li>點擊「開始分析」</li>
        </ol>
        <InfoBox>可使用「群組選擇」快速填入已建立群組的檔案。</InfoBox>
      </div>
    ),
  },
  {
    id: 'view-report',
    title: '查看報告',
    group: 'guide',
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
        <div className="grid gap-2 md:grid-cols-2 text-sm mt-2">
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
    id: 'history',
    title: '歷史紀錄',
    group: 'guide',
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

  // ===== 功能說明 =====
  {
    id: 'yuanshenyin',
    title: '元神音',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-primary">主要功能</div>
        <p className="text-lg font-medium">腦波影音編碼 - 心靈音樂轉換</p>
        <p>將您的腦波資料轉換為獨特的心靈音樂，以三聲部樂譜呈現您的腦波韻律。</p>

        <h4 className="font-medium mt-4">功能特色</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>三聲部音樂：高音、中音、低音分別對應不同腦波頻段</li>
          <li>可選擇不同樂器音色</li>
          <li>支援節奏風格選擇</li>
          <li>可下載 MusicXML 格式樂譜</li>
        </ul>

        <h4 className="font-medium mt-4">輸入需求</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>前測腦波檔案</li>
          <li>後測腦波檔案</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'qinsehe',
    title: '琴瑟合',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-primary">主要功能</div>
        <p className="text-lg font-medium">雙人腦波六聲部合奏音樂</p>
        <p>將兩人的腦波資料合成為六聲部的合奏音樂，呈現兩人腦波的和諧互動。</p>

        <h4 className="font-medium mt-4">功能特色</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>六聲部合奏：每人三個聲部</li>
          <li>可分別設定兩人的樂器音色</li>
          <li>可分別調整音量平衡</li>
          <li>適合情侶、親子、朋友的腦波配對分析</li>
        </ul>

        <h4 className="font-medium mt-4">輸入需求</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>第一人：前測 + 後測腦波檔案</li>
          <li>第二人：前測 + 後測腦波檔案</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'hengyunlai',
    title: '亨運來',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-primary">主要功能</div>
        <p className="text-lg font-medium">H.R 人力資源八大職能評估</p>
        <p>透過腦波分析評估個人的八大職能特質，適用於人力資源管理與職涯規劃。</p>

        <h4 className="font-medium mt-4">評估面向</h4>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          {['領導力', '溝通力', '創造力', '執行力', '分析力', '協調力', '學習力', '抗壓力'].map((item, i) => (
            <div key={i} className="p-2 bg-base-200 rounded">{item}</div>
          ))}
        </div>

        <h4 className="font-medium mt-4">輸入需求</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>前測腦波檔案</li>
          <li>後測腦波檔案</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'zhentianfu',
    title: '貞天賦',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-primary">主要功能</div>
        <p className="text-lg font-medium">八項人格特質潛能分析</p>
        <p>深入分析個人的八項人格特質，幫助了解天賦與發展方向。</p>

        <h4 className="font-medium mt-4">分析面向</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>個人特質雷達圖</li>
          <li>優勢與發展建議</li>
          <li>適合的職業方向</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'zhenbaoqi',
    title: '珍寶炁',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-primary">主要功能</div>
        <p className="text-lg font-medium">礦物結晶體炁場測試（台灣專利）</p>
        <p>分析人與礦石之間的能量共振，找出最適合您的礦物結晶。</p>

        <h4 className="font-medium mt-4">測試流程</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>測量基準腦波（前測）</li>
          <li>接觸礦石後測量腦波（後測）</li>
          <li>分析能量變化</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'qingxiangyi',
    title: '情香意',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-primary">主要功能</div>
        <p className="text-lg font-medium">香氛炁場測試與芳療建議</p>
        <p>透過腦波分析找出最適合您的精油配方，提供個人化芳療建議。</p>

        <h4 className="font-medium mt-4">分析內容</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>香氛偏好分析</li>
          <li>情緒反應評估</li>
          <li>精油配方建議</li>
        </ul>
      </div>
    ),
  },

  // ===== 利養炁系列 =====
  {
    id: 'zhengniuxiuxing',
    title: '正念修行',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-secondary">利養炁系列</div>
        <p className="text-lg font-medium">身心指數評估</p>
        <p>透過腦波分析評估正念修行的成效，量化身心狀態的變化。</p>

        <h4 className="font-medium mt-4">評估指標</h4>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          {['專注度', '放鬆度', '情緒穩定', '心流狀態'].map((item, i) => (
            <div key={i} className="p-2 bg-base-200 rounded">{item}</div>
          ))}
        </div>

        <h4 className="font-medium mt-4">適用情境</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>冥想練習前後對比</li>
          <li>瑜伽課程成效評估</li>
          <li>正念訓練追蹤</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'lianqixiuxing',
    title: '練炁修行',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-secondary">利養炁系列</div>
        <p className="text-lg font-medium">能量運行分析</p>
        <p>分析練炁過程中的能量運行狀態，幫助修行者了解自身的能量變化。</p>

        <h4 className="font-medium mt-4">分析面向</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>能量流動指數</li>
          <li>氣脈暢通度</li>
          <li>丹田蓄能狀態</li>
          <li>能量平衡分析</li>
        </ul>

        <h4 className="font-medium mt-4">報告內容</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>能量運行圖表</li>
          <li>修行建議</li>
          <li>進步追蹤</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'lianqipinjie',
    title: '練炁品階',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-secondary">利養炁系列</div>
        <p className="text-lg font-medium">修行境界評估</p>
        <p>根據腦波特徵評估修行者目前的練炁境界等級。</p>

        <h4 className="font-medium mt-4">品階等級</h4>
        <div className="grid gap-2 md:grid-cols-3 text-sm">
          {['初階', '中階', '高階', '精進', '圓滿', '超越'].map((item, i) => (
            <div key={i} className="p-2 bg-base-200 rounded text-center">{item}</div>
          ))}
        </div>

        <h4 className="font-medium mt-4">評估依據</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>腦波穩定度</li>
          <li>能量集中度</li>
          <li>心神合一指數</li>
        </ul>
      </div>
    ),
  },

  // ===== 易 Motion 系列 =====
  {
    id: 'emotion-management',
    title: '情緒管理系統',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-accent">易 Motion</div>
        <p className="text-lg font-medium">員工情緒追蹤與預測</p>
        <p>企業級情緒管理工具，協助 HR 追蹤員工情緒狀態，預防職業倦怠。</p>

        <h4 className="font-medium mt-4">功能特色</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>定期情緒檢測</li>
          <li>壓力指數追蹤</li>
          <li>團隊情緒報告</li>
          <li>預警機制</li>
        </ul>

        <h4 className="font-medium mt-4">適用對象</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>企業人力資源部門</li>
          <li>員工心理健康管理</li>
          <li>團隊效能評估</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'pet-test',
    title: '寵物評比測試',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-accent">易 Motion</div>
        <p className="text-lg font-medium">視覺+觸覺情緒分析</p>
        <p>分析您與寵物互動時的情緒反應，找出最適合您的寵物類型。</p>

        <h4 className="font-medium mt-4">測試流程</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>測量基準腦波</li>
          <li>觀看寵物圖片/影片</li>
          <li>與寵物實際互動（觸覺）</li>
          <li>分析情緒變化</li>
        </ol>

        <h4 className="font-medium mt-4">分析維度</h4>
        <div className="flex flex-wrap gap-2">
          {['愉悅感', '放鬆感', '親密感', '活力感'].map((item, i) => (
            <span key={i} className="badge badge-outline">{item}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'taste-test',
    title: '品茶/品酒/品咖啡',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-accent">易 Motion</div>
        <p className="text-lg font-medium">嗅覺+味覺情緒分析</p>
        <p>透過腦波分析您對不同飲品的情緒反應，找出最適合您的口味。</p>

        <h4 className="font-medium mt-4">適用品項</h4>
        <div className="grid gap-2 md:grid-cols-3 text-sm">
          <div className="p-3 bg-base-200 rounded text-center">
            <div className="font-medium">茶</div>
            <div className="text-xs text-base-content/60">綠茶、紅茶、烏龍...</div>
          </div>
          <div className="p-3 bg-base-200 rounded text-center">
            <div className="font-medium">酒</div>
            <div className="text-xs text-base-content/60">紅酒、白酒、威士忌...</div>
          </div>
          <div className="p-3 bg-base-200 rounded text-center">
            <div className="font-medium">咖啡</div>
            <div className="text-xs text-base-content/60">淺焙、中焙、深焙...</div>
          </div>
        </div>

        <h4 className="font-medium mt-4">測試項目</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>香氣反應（嗅覺）</li>
          <li>口感反應（味覺）</li>
          <li>整體情緒變化</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'perfume-test',
    title: '香水評比測試',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-accent">易 Motion</div>
        <p className="text-lg font-medium">嗅覺情緒分析</p>
        <p>分析您對不同香水的情緒反應，協助找出最適合您的香氛。</p>

        <h4 className="font-medium mt-4">測試流程</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>測量基準腦波</li>
          <li>依序聞取不同香水</li>
          <li>每款香水測量後休息</li>
          <li>分析情緒變化</li>
        </ol>

        <h4 className="font-medium mt-4">分析報告</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>各香水的情緒反應分數</li>
          <li>最適合您的香調類型</li>
          <li>香水推薦清單</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'music-test',
    title: '音樂演奏/歌曲演唱',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-accent">易 Motion</div>
        <p className="text-lg font-medium">聽覺情緒分析</p>
        <p>分析您聆聽音樂時的情緒反應，適用於音樂治療和曲目選擇。</p>

        <h4 className="font-medium mt-4">應用場景</h4>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          <div className="p-2 bg-base-200 rounded">
            <div className="font-medium">音樂治療</div>
            <div className="text-xs text-base-content/60">找出最具療癒效果的音樂</div>
          </div>
          <div className="p-2 bg-base-200 rounded">
            <div className="font-medium">演奏評估</div>
            <div className="text-xs text-base-content/60">評估演奏者的情感表達</div>
          </div>
          <div className="p-2 bg-base-200 rounded">
            <div className="font-medium">歌曲測試</div>
            <div className="text-xs text-base-content/60">測試歌曲的情緒感染力</div>
          </div>
          <div className="p-2 bg-base-200 rounded">
            <div className="font-medium">曲目推薦</div>
            <div className="text-xs text-base-content/60">依情緒需求推薦音樂</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'video-test',
    title: '短視頻廣告評比',
    group: 'features',
    content: (
      <div className="space-y-4">
        <div className="badge badge-accent">易 Motion</div>
        <p className="text-lg font-medium">視聽覺情緒分析</p>
        <p>分析觀看短視頻或廣告時的情緒反應，適用於廣告效果測試和內容評估。</p>

        <h4 className="font-medium mt-4">適用場景</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>廣告效果測試（A/B Testing）</li>
          <li>品牌形象評估</li>
          <li>內容創作優化</li>
          <li>觀眾反應研究</li>
        </ul>

        <h4 className="font-medium mt-4">分析指標</h4>
        <div className="flex flex-wrap gap-2">
          {['注意力', '情感共鳴', '記憶點', '購買意願'].map((item, i) => (
            <span key={i} className="badge badge-outline">{item}</span>
          ))}
        </div>

        <h4 className="font-medium mt-4">報告內容</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
          <li>時間軸情緒曲線</li>
          <li>關鍵畫面情緒分析</li>
          <li>整體效果評分</li>
        </ul>
      </div>
    ),
  },

  // ===== FAQ =====
  {
    id: 'faq-upload',
    title: '檔案上傳問題',
    group: 'faq',
    content: (
      <div className="space-y-4">
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-upload" defaultChecked />
          <div className="collapse-title font-medium">為什麼我的檔案上傳失敗？</div>
          <div className="collapse-content">
            <p>請確認：</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>檔案格式為 CSV 或 XLSX</li>
              <li>檔案沒有損壞</li>
              <li>已選擇受測者</li>
            </ul>
          </div>
        </div>
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-upload" />
          <div className="collapse-title font-medium">支援哪些檔案格式？</div>
          <div className="collapse-content">
            <p>系統支援 CSV 和 XLSX (Excel) 格式的腦波資料檔案。</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-analysis',
    title: '分析相關問題',
    group: 'faq',
    content: (
      <div className="space-y-4">
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-analysis" defaultChecked />
          <div className="collapse-title font-medium">分析結果顯示錯誤怎麼辦？</div>
          <div className="collapse-content">
            <p>如果看到錯誤訊息，可能是因為：</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>檔案格式不符合分析要求</li>
              <li>後端 API 服務暫時無法使用</li>
              <li>網路連線問題</li>
            </ul>
            <p className="mt-2">請確認檔案內容正確，並稍後再試。</p>
          </div>
        </div>
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-analysis" />
          <div className="collapse-title font-medium">前測和後測資料有什麼差別？</div>
          <div className="collapse-content">
            <p>
              前測資料是進行某項活動「之前」收集的腦波資料，
              後測資料是進行該活動「之後」收集的資料。
              系統會比較兩者的差異來產生分析結果。
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-data',
    title: '資料儲存問題',
    group: 'faq',
    content: (
      <div className="space-y-4">
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-data" defaultChecked />
          <div className="collapse-title font-medium">資料儲存在哪裡？</div>
          <div className="collapse-content">
            <p>所有資料都儲存在瀏覽器的 localStorage 中。這代表：</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>資料只存在於您目前使用的瀏覽器</li>
              <li>清除瀏覽器資料會導致所有資料遺失</li>
              <li>不同裝置或瀏覽器無法共享資料</li>
            </ul>
          </div>
        </div>
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-data" />
          <div className="collapse-title font-medium">如何備份我的資料？</div>
          <div className="collapse-content">
            <p>目前系統暫不支援匯出/備份功能。建議定期將重要的分析報告列印為 PDF 保存。</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'faq-playback',
    title: '播放相關問題',
    group: 'faq',
    content: (
      <div className="space-y-4">
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-playback" defaultChecked />
          <div className="collapse-title font-medium">樂譜播放沒有聲音怎麼辦？</div>
          <div className="collapse-content">
            <p>請確認：</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>裝置音量已開啟</li>
              <li>瀏覽器沒有被靜音</li>
              <li>首次播放需點擊畫面以啟用音訊（瀏覽器安全限制）</li>
            </ul>
          </div>
        </div>
        <div className="collapse collapse-plus bg-base-200">
          <input type="radio" name="faq-playback" />
          <div className="collapse-title font-medium">可以在手機上使用嗎？</div>
          <div className="collapse-content">
            <p>
              可以。系統支援響應式設計，在手機和平板上都能正常使用。
              但建議使用桌面電腦以獲得最佳體驗，特別是查看報告和樂譜時。
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

// 根據群組取得章節
export const getSectionsByGroup = (groupId: string): TutorialSection[] => {
  return TUTORIAL_SECTIONS.filter(s => s.group === groupId);
};

// 取得章節
export const getSection = (sectionId: string): TutorialSection | undefined => {
  return TUTORIAL_SECTIONS.find(s => s.id === sectionId);
};
