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
  { id: 'intro', title: 'What is HyLove?' },
  { id: 'guide', title: 'User Guide' },
  { id: 'features', title: '功能說明' },
  { id: 'faq', title: 'FAQ' },
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
    title: '系統概覽',
    group: 'intro',
    content: (
      <div className="space-y-6">
        <p className="text-lg">
          HyLove 是一套專業的<strong>腦波分析系統</strong>，透過先進的演算法將腦波資料轉換為有意義的分析報告，
          協助您了解大腦活動模式並獲得深入的洞察。
        </p>
        <InfoBox>所有資料都儲存在您的瀏覽器中，確保隱私安全。</InfoBox>

        <h3 className="text-xl font-semibold mt-8">系統特色</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { title: '檔案支援', value: 'CSV / XLSX', desc: '標準腦波資料格式' },
            { title: '資料儲存', value: '本地瀏覽器', desc: '隱私安全有保障' },
            { title: '分析報告', value: '可列印 PDF', desc: '專業報告輸出' },
          ].map((stat, i) => (
            <div key={i} className="stat bg-base-200 rounded-lg">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value text-lg">{stat.value}</div>
              <div className="stat-desc">{stat.desc}</div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold mt-8">分析功能分類</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card bg-primary/10 border border-primary/20">
            <div className="card-body">
              <h4 className="card-title text-base text-primary">主要功能</h4>
              <ul className="text-sm space-y-1">
                <li>元神音、琴瑟合</li>
                <li>亨運來、貞天賦</li>
                <li>珍寶炁、情香意</li>
              </ul>
            </div>
          </div>
          <div className="card bg-secondary/10 border border-secondary/20">
            <div className="card-body">
              <h4 className="card-title text-base text-secondary">利養炁系列</h4>
              <ul className="text-sm space-y-1">
                <li>正念修行</li>
                <li>練炁修行</li>
                <li>練炁品階</li>
              </ul>
            </div>
          </div>
          <div className="card bg-accent/10 border border-accent/20">
            <div className="card-body">
              <h4 className="card-title text-base text-accent">易 Motion 系列</h4>
              <ul className="text-sm space-y-1">
                <li>情緒管理、寵物評比</li>
                <li>品茶/酒/咖啡</li>
                <li>香水、音樂、短視頻</li>
              </ul>
            </div>
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
