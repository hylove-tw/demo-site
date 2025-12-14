// src/pages/TutorialPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TutorialPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections = [
    { id: 'getting-started', title: '開始使用' },
    { id: 'user-management', title: '受測者管理' },
    { id: 'file-upload', title: '上傳腦波檔案' },
    { id: 'file-view', title: '檢視腦波資料' },
    { id: 'file-group', title: '腦波資料群組' },
    { id: 'analysis', title: '執行分析' },
    { id: 'report', title: '查看報告' },
    { id: 'history', title: '歷史紀錄' },
    { id: 'faq', title: '常見問題' },
  ];

  return (
    <div className="container mx-auto">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link to="/">首頁</Link>
          </li>
          <li>使用教學</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-6">使用教學</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 教學內容 */}
        <div className="flex-1 order-2 lg:order-1 space-y-8">
          {/* 開始使用 */}
          {activeSection === 'getting-started' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">開始使用</h2>

                <div className="space-y-4">
                  <p>
                    歡迎使用 HyLove 腦波分析系統！本系統可幫助您上傳腦波資料檔案，
                    並透過多種分析功能產生專業報告。
                  </p>

                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>首次使用時，系統會自動建立一個「預設受測者」供您使用。</span>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">快速開始步驟</h3>
                  <ul className="steps steps-vertical">
                    <li className="step step-primary">
                      <div className="text-left ml-4">
                        <p className="font-medium">確認受測者</p>
                        <p className="text-sm text-base-content/60">
                          系統右上角會顯示目前受測者，可前往「受測者管理」新增或切換
                        </p>
                      </div>
                    </li>
                    <li className="step step-primary">
                      <div className="text-left ml-4">
                        <p className="font-medium">上傳腦波檔案</p>
                        <p className="text-sm text-base-content/60">
                          前往「腦波檔案管理」上傳 CSV 格式的腦波資料
                        </p>
                      </div>
                    </li>
                    <li className="step step-primary">
                      <div className="text-left ml-4">
                        <p className="font-medium">選擇分析功能</p>
                        <p className="text-sm text-base-content/60">
                          從首頁選擇要使用的分析功能
                        </p>
                      </div>
                    </li>
                    <li className="step step-primary">
                      <div className="text-left ml-4">
                        <p className="font-medium">執行分析並查看報告</p>
                        <p className="text-sm text-base-content/60">
                          選擇前測/後測資料，點擊「開始分析」
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 使用者管理 */}
          {activeSection === 'user-management' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">受測者管理</h2>

                <div className="space-y-4">
                  <p>
                    受測者管理功能讓您可以建立多個受測者資料，方便管理不同客戶或個案的腦波分析紀錄。
                  </p>

                  <h3 className="text-lg font-semibold mt-6">新增受測者</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>點擊左側選單的「受測者管理」</li>
                    <li>點擊右上角「新增受測者」按鈕</li>
                    <li>填寫受測者資訊：
                      <ul className="list-disc list-inside ml-6 mt-2 text-base-content/70">
                        <li>姓名（必填）</li>
                        <li>電話（必填）</li>
                        <li>Email（必填）</li>
                        <li>公司資訊</li>
                      </ul>
                    </li>
                    <li>點擊「儲存」完成建立</li>
                  </ol>

                  <h3 className="text-lg font-semibold mt-6">切換受測者</h3>
                  <p>
                    在受測者列表中，點擊「切換」按鈕即可切換至該受測者。
                    目前選取的受測者會以綠色標籤標示。
                  </p>

                  <div className="alert alert-warning mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>刪除受測者時，該受測者的檔案和分析記錄不會被刪除。</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 上傳腦波檔案 */}
          {activeSection === 'file-upload' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">上傳腦波檔案</h2>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">支援的檔案格式</h3>
                  <div className="flex gap-2">
                    <span className="badge badge-primary badge-lg">CSV</span>
                    <span className="badge badge-primary badge-lg">XLSX</span>
                  </div>
                  <p className="text-base-content/70">
                    支援 CSV 與 Excel (XLSX) 格式的腦波資料檔案。
                  </p>

                  <h3 className="text-lg font-semibold mt-6">上傳步驟</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>點擊左側選單的「腦波檔案管理」</li>
                    <li>點擊「選擇檔案」按鈕</li>
                    <li>可同時選擇多個 CSV 或 XLSX 檔案</li>
                    <li>確認已選擇的檔案數量</li>
                    <li>點擊「上傳檔案」按鈕</li>
                  </ol>

                  <div className="mockup-browser border bg-base-300 mt-6">
                    <div className="mockup-browser-toolbar">
                      <div className="input">腦波檔案管理</div>
                    </div>
                    <div className="px-4 py-8 bg-base-200 text-center">
                      <p className="text-base-content/60">選擇 CSV 或 XLSX 檔案後點擊上傳</p>
                      <p className="text-sm text-base-content/40 mt-2">支援多檔案同時上傳</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">管理已上傳檔案</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>檢視</strong>：查看檔案內容和詳細資訊</li>
                    <li><strong>別稱</strong>：修改檔案顯示名稱，方便辨識</li>
                    <li><strong>群組</strong>：將檔案加入腦波資料群組</li>
                    <li><strong>刪除</strong>：移除不需要的檔案</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 檢視腦波資料 */}
          {activeSection === 'file-view' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">檢視腦波資料</h2>

                <div className="space-y-4">
                  <p>
                    上傳檔案後，您可以在「腦波檔案管理」頁面檢視每個檔案的詳細內容。
                    系統提供兩種檢視模式：熱力圖和表格。
                  </p>

                  <h3 className="text-lg font-semibold mt-6">開啟檔案詳情</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>前往「腦波檔案管理」頁面</li>
                    <li>點擊檔案列表中的「⋯」選單</li>
                    <li>選擇「檢視」</li>
                  </ol>

                  <h3 className="text-lg font-semibold mt-6">熱力圖模式</h3>
                  <p>
                    熱力圖以色彩呈現腦波數值的變化，讓您快速掌握整體趨勢：
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-base-content/70">
                    <li><span className="text-blue-500">藍色</span>：較低數值</li>
                    <li><span className="text-green-500">綠色</span>：中等數值</li>
                    <li><span className="text-red-500">紅色</span>：較高數值</li>
                  </ul>

                  <div className="bg-base-200 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium mb-2">腦波頻段分類</p>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-sm">訊號品質</span>
                        <span className="text-base-content/70">Good Signal Quality</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-sm badge-primary">心智狀態</span>
                        <span className="text-base-content/70">Attention、Meditation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-sm badge-secondary">腦波頻段</span>
                        <span className="text-base-content/70">Delta、Theta、Alpha、Beta、Gamma</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">表格模式</h3>
                  <p>
                    表格模式顯示原始數據，適合需要查看精確數值的情況。
                    為避免載入過慢，表格最多顯示前 100 列資料。
                  </p>

                  <div className="alert alert-info mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>將滑鼠移到熱力圖的色塊上，可以查看該時間點的精確數值。</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 腦波資料群組 */}
          {activeSection === 'file-group' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">腦波資料群組</h2>

                <div className="space-y-4">
                  <p>
                    腦波資料群組可以幫助您組織相關的檔案，例如同一次測試的前測和後測資料。
                    在執行分析時，可以直接選擇群組來快速填入檔案。
                  </p>

                  <h3 className="text-lg font-semibold mt-6">建立群組的方式</h3>

                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">方式一：上傳時建立</h4>
                        <p className="text-sm">
                          點擊「上傳腦波資料群組」，同時上傳多個檔案並命名群組。
                        </p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">方式二：從現有檔案建立</h4>
                        <p className="text-sm">
                          在「腦波資料群組」分頁點擊「建立新群組」，選擇要加入的檔案。
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">群組命名建議</h3>
                  <p>建議使用清楚的命名方式，例如：</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-base-content/70">
                    <li>2024/01/15 王小明 測試</li>
                    <li>A001 張先生 初次檢測</li>
                    <li>研究案例 #15</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 執行分析 */}
          {activeSection === 'analysis' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">執行分析</h2>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">可用的分析功能</h3>
                  <p>系統提供 15 種分析功能，分為四大類別：</p>

                  {/* 主要功能 */}
                  <h4 className="font-medium mt-4 mb-2">主要功能</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-primary">主要</span>
                      <div>
                        <p className="font-medium">元神音</p>
                        <p className="text-xs text-base-content/60">腦波影音編碼，轉換為心靈音樂</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-primary">主要</span>
                      <div>
                        <p className="font-medium">亨運來</p>
                        <p className="text-xs text-base-content/60">H.R 人力資源八大職能評估</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-primary">主要</span>
                      <div>
                        <p className="font-medium">貞天賦</p>
                        <p className="text-xs text-base-content/60">八項人格特質潛能分析</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-primary">主要</span>
                      <div>
                        <p className="font-medium">珍寶炁</p>
                        <p className="text-xs text-base-content/60">礦物結晶體炁場測試（台灣專利）</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-primary">主要</span>
                      <div>
                        <p className="font-medium">情香意</p>
                        <p className="text-xs text-base-content/60">香氛炁場測試與芳療建議</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-primary">主要</span>
                      <div>
                        <p className="font-medium">琴瑟合</p>
                        <p className="text-xs text-base-content/60">雙人腦波六聲部合奏音樂</p>
                      </div>
                    </div>
                  </div>

                  {/* 利養炁 */}
                  <h4 className="font-medium mt-4 mb-2">利養炁（正念修行系列）</h4>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-secondary">利養炁</span>
                      <div>
                        <p className="font-medium">正念修行</p>
                        <p className="text-xs text-base-content/60">身心指數評估</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-secondary">利養炁</span>
                      <div>
                        <p className="font-medium">練炁修行</p>
                        <p className="text-xs text-base-content/60">能量運行分析</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-secondary">利養炁</span>
                      <div>
                        <p className="font-medium">練炁品階</p>
                        <p className="text-xs text-base-content/60">修行境界評估</p>
                      </div>
                    </div>
                  </div>

                  {/* 易 Motion */}
                  <h4 className="font-medium mt-4 mb-2">易 Motion（情緒評比系列）</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-accent">易</span>
                      <div>
                        <p className="font-medium">情緒管理系統</p>
                        <p className="text-xs text-base-content/60">員工情緒追蹤與預測</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-accent">易</span>
                      <div>
                        <p className="font-medium">寵物評比測試</p>
                        <p className="text-xs text-base-content/60">視覺+觸覺情緒分析</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-accent">易</span>
                      <div>
                        <p className="font-medium">品茶/品酒/品咖啡</p>
                        <p className="text-xs text-base-content/60">嗅覺+味覺情緒分析</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-accent">易</span>
                      <div>
                        <p className="font-medium">香水評比測試</p>
                        <p className="text-xs text-base-content/60">嗅覺情緒分析</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-accent">易</span>
                      <div>
                        <p className="font-medium">音樂演奏/歌曲演唱</p>
                        <p className="text-xs text-base-content/60">聽覺情緒分析</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <span className="badge badge-accent">易</span>
                      <div>
                        <p className="font-medium">短視頻廣告評比</p>
                        <p className="text-xs text-base-content/60">視聽覺情緒分析</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">執行分析步驟</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>從首頁選擇要使用的分析功能</li>
                    <li>選擇檔案選取方式：
                      <ul className="list-disc list-inside ml-6 mt-2 text-base-content/70">
                        <li><strong>個別選擇</strong>：分別選擇前測和後測資料</li>
                        <li><strong>群組選擇</strong>：從已建立的群組中選擇</li>
                      </ul>
                    </li>
                    <li>選擇前測資料（分析前的腦波檔案）</li>
                    <li>選擇後測資料（分析後的腦波檔案）</li>
                    <li>填寫其他必要參數（如有）</li>
                    <li>點擊「開始分析」按鈕</li>
                    <li>等待分析完成，系統會自動跳轉至報告頁面</li>
                  </ol>

                  <div className="alert alert-info mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>分析過程需要連接後端 API，請確保網路連線正常。</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 查看報告 */}
          {activeSection === 'report' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">查看報告</h2>

                <div className="space-y-4">
                  <p>
                    分析完成後，系統會自動產生詳細的分析報告。
                    報告內容會根據不同的分析功能而有所不同。
                  </p>

                  <h3 className="text-lg font-semibold mt-6">報告內容</h3>
                  <p>一般報告會包含以下資訊：</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>分析摘要</li>
                    <li>數據圖表</li>
                    <li>詳細分析結果</li>
                    <li>建議說明</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">報告操作</h3>
                  <p>報告頁面提供以下操作按鈕：</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>
                      <strong>列印報告</strong>：將報告列印或儲存為 PDF 檔案
                    </li>
                    <li>
                      <strong>返回首頁</strong>：回到系統首頁
                    </li>
                    <li>
                      <strong>再次分析</strong>：使用相同的分析功能進行新的分析
                    </li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">列印報告</h3>
                  <p>
                    點擊「列印報告」按鈕後，系統會開啟瀏覽器的列印對話框。
                    您可以選擇：
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>直接列印到印表機</li>
                    <li>儲存為 PDF 檔案（選擇「另存為 PDF」作為目的地）</li>
                  </ul>
                  <div className="alert alert-info mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>列印時會自動隱藏導航列和按鈕，只保留報告內容。</span>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">自動儲存</h3>
                  <p>
                    每次分析完成後，報告會自動儲存到「歷史紀錄」中。
                    您可以隨時從歷史紀錄頁面重新查看過往的分析報告。
                  </p>

                  <div className="alert mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>報告資料會儲存在瀏覽器中，清除瀏覽器資料會導致報告遺失。</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 歷史紀錄 */}
          {activeSection === 'history' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">歷史紀錄</h2>

                <div className="space-y-4">
                  <p>
                    所有分析結果都會自動儲存在歷史紀錄中，方便您隨時查閱過往的分析報告。
                  </p>

                  <h3 className="text-lg font-semibold mt-6">進入歷史紀錄</h3>
                  <p>您可以透過以下方式查看歷史紀錄：</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>點擊左側選單的「歷史紀錄」</li>
                    <li>在分析功能頁面點擊右上角的「歷史紀錄」按鈕</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">篩選與搜尋</h3>
                  <p>歷史紀錄頁面提供多種篩選方式：</p>
                  <div className="grid gap-3 mt-3">
                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg">
                      <span className="badge badge-primary badge-sm mt-0.5">狀態</span>
                      <span className="text-sm">篩選成功或失敗的分析紀錄</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg">
                      <span className="badge badge-secondary badge-sm mt-0.5">搜尋</span>
                      <span className="text-sm">輸入關鍵字搜尋分析名稱</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg">
                      <span className="badge badge-accent badge-sm mt-0.5">分析類型</span>
                      <span className="text-sm">依分析功能類型篩選</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg">
                      <span className="badge badge-sm mt-0.5">受測者</span>
                      <span className="text-sm">依受測者篩選紀錄</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">查看報告</h3>
                  <p>
                    在歷史紀錄列表中，點擊任一筆紀錄即可開啟該次分析的完整報告。
                  </p>

                  <div className="alert alert-info mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>每個分析功能頁面底部也會顯示該功能的歷史分析紀錄。</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 常見問題 */}
          {activeSection === 'faq' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">常見問題</h2>

                <div className="space-y-4">
                  <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="faq-accordion" defaultChecked />
                    <div className="collapse-title font-medium">
                      為什麼我的檔案上傳失敗？
                    </div>
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
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      分析結果顯示錯誤怎麼辦？
                    </div>
                    <div className="collapse-content">
                      <p>
                        如果看到「Request failed with status code 422」之類的錯誤，
                        可能是因為：
                      </p>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>檔案格式不符合分析要求</li>
                        <li>後端 API 服務暫時無法使用</li>
                        <li>網路連線問題</li>
                      </ul>
                      <p className="mt-2">請確認檔案內容正確，並稍後再試。</p>
                    </div>
                  </div>

                  <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      資料儲存在哪裡？
                    </div>
                    <div className="collapse-content">
                      <p>
                        所有資料都儲存在瀏覽器的 localStorage 中。
                        這代表：
                      </p>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        <li>資料只存在於您目前使用的瀏覽器</li>
                        <li>清除瀏覽器資料會導致所有資料遺失</li>
                        <li>不同裝置或瀏覽器無法共享資料</li>
                      </ul>
                    </div>
                  </div>

                  <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      如何備份我的資料？
                    </div>
                    <div className="collapse-content">
                      <p>
                        目前系統暫不支援匯出/備份功能。
                        建議定期將重要的分析報告截圖保存。
                      </p>
                    </div>
                  </div>

                  <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      前測和後測資料有什麼差別？
                    </div>
                    <div className="collapse-content">
                      <p>
                        前測資料是進行某項活動「之前」收集的腦波資料，
                        後測資料是進行該活動「之後」收集的資料。
                        系統會比較兩者的差異來產生分析結果。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 導航按鈕 */}
          <div className="flex justify-between mt-8">
            <button
              className="btn btn-outline"
              onClick={() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  setActiveSection(sections[currentIndex - 1].id);
                }
              }}
              disabled={activeSection === sections[0].id}
            >
              上一章
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                if (currentIndex < sections.length - 1) {
                  setActiveSection(sections[currentIndex + 1].id);
                }
              }}
              disabled={activeSection === sections[sections.length - 1].id}
            >
              下一章
            </button>
          </div>
        </div>

        {/* 側邊目錄 */}
        <div className="lg:w-64 flex-shrink-0 order-1 lg:order-2">
          <div className="sticky top-4">
            <ul className="menu bg-base-200 rounded-lg w-full">
              <li className="menu-title">目錄</li>
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    className={activeSection === section.id ? 'active' : ''}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
