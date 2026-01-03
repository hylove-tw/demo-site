// src/pages/TutorialPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TutorialPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('what-is');

  const sections = [
    { id: 'what-is', title: 'What is HyLove?', group: 'intro' },
    { id: 'user-guide', title: 'User Guide', group: 'guide' },
    { id: 'faq', title: 'FAQ', group: 'faq' },
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

      <h1 className="text-2xl font-bold mb-6">使用教學</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 教學內容 */}
        <div className="flex-1 order-2 lg:order-1 space-y-8">
          {/* What is HyLove? */}
          {activeSection === 'what-is' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">What is HyLove?</h2>

                <div className="space-y-6">
                  <p className="text-lg">
                    HyLove 是一套專業的<strong>腦波分析系統</strong>，透過先進的演算法將腦波資料轉換為有意義的分析報告，
                    協助您了解大腦活動模式並獲得深入的洞察。
                  </p>

                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>所有資料都儲存在您的瀏覽器中，確保隱私安全。</span>
                  </div>

                  <h3 className="text-xl font-semibold mt-8">核心功能</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">
                          <span className="badge badge-primary">主要</span>
                          元神音
                        </h4>
                        <p className="text-sm text-base-content/70">
                          將腦波資料轉換為獨特的心靈音樂，以三聲部樂譜呈現您的腦波韻律。
                        </p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">
                          <span className="badge badge-primary">主要</span>
                          琴瑟合
                        </h4>
                        <p className="text-sm text-base-content/70">
                          雙人腦波六聲部合奏音樂，呈現兩人腦波的和諧互動。
                        </p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">
                          <span className="badge badge-primary">主要</span>
                          亨運來
                        </h4>
                        <p className="text-sm text-base-content/70">
                          H.R 人力資源八大職能評估，分析個人的工作特質與潛能。
                        </p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">
                          <span className="badge badge-primary">主要</span>
                          貞天賦
                        </h4>
                        <p className="text-sm text-base-content/70">
                          八項人格特質潛能分析，深入了解個人天賦與發展方向。
                        </p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">
                          <span className="badge badge-primary">主要</span>
                          珍寶炁
                        </h4>
                        <p className="text-sm text-base-content/70">
                          礦物結晶體炁場測試（台灣專利），分析人與礦石的能量共振。
                        </p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h4 className="card-title text-base">
                          <span className="badge badge-primary">主要</span>
                          情香意
                        </h4>
                        <p className="text-sm text-base-content/70">
                          香氛炁場測試與芳療建議，找出最適合您的精油配方。
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mt-8">更多分析功能</h3>

                  <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="feature-accordion" defaultChecked />
                    <div className="collapse-title font-medium">
                      <span className="badge badge-secondary badge-sm mr-2">利養炁</span>
                      正念修行系列
                    </div>
                    <div className="collapse-content">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>正念修行</strong> - 身心指數評估</li>
                        <li><strong>練炁修行</strong> - 能量運行分析</li>
                        <li><strong>練炁品階</strong> - 修行境界評估</li>
                      </ul>
                    </div>
                  </div>

                  <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="feature-accordion" />
                    <div className="collapse-title font-medium">
                      <span className="badge badge-accent badge-sm mr-2">易 Motion</span>
                      情緒評比系列
                    </div>
                    <div className="collapse-content">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>情緒管理系統</strong> - 員工情緒追蹤與預測</li>
                        <li><strong>寵物評比測試</strong> - 視覺+觸覺情緒分析</li>
                        <li><strong>品茶/品酒/品咖啡</strong> - 嗅覺+味覺情緒分析</li>
                        <li><strong>香水評比測試</strong> - 嗅覺情緒分析</li>
                        <li><strong>音樂演奏/歌曲演唱</strong> - 聽覺情緒分析</li>
                        <li><strong>短視頻廣告評比</strong> - 視聽覺情緒分析</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mt-8">系統特色</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="stat bg-base-200 rounded-lg">
                      <div className="stat-title">檔案支援</div>
                      <div className="stat-value text-lg">CSV / XLSX</div>
                      <div className="stat-desc">標準腦波資料格式</div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg">
                      <div className="stat-title">資料儲存</div>
                      <div className="stat-value text-lg">本地瀏覽器</div>
                      <div className="stat-desc">隱私安全有保障</div>
                    </div>
                    <div className="stat bg-base-200 rounded-lg">
                      <div className="stat-title">分析報告</div>
                      <div className="stat-value text-lg">可列印 PDF</div>
                      <div className="stat-desc">專業報告輸出</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* User Guide */}
          {activeSection === 'user-guide' && (
            <section className="space-y-6">
              {/* 快速開始 */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Quick Start</h2>
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
                          前往「腦波檔案管理」上傳 CSV 或 XLSX 格式的腦波資料
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

              {/* 受測者管理 */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">受測者管理</h2>
                  <div className="space-y-4">
                    <p>
                      受測者管理功能讓您建立多個受測者資料，方便管理不同客戶或個案的腦波分析紀錄。
                    </p>
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
                          在受測者列表中點擊「切換」按鈕即可切換至該受測者。
                          目前選取的受測者會以綠色標籤標示。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 檔案管理 */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">腦波檔案管理</h2>
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
                </div>
              </div>

              {/* 執行分析 */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">執行分析</h2>
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
                </div>
              </div>

              {/* 查看報告 */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">查看報告</h2>
                  <div className="space-y-4">
                    <p>分析完成後會自動產生報告，包含：分析摘要、數據圖表、詳細結果、建議說明。</p>

                    <h4 className="font-medium">報告操作</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                      <li><strong>列印報告</strong> - 列印或儲存為 PDF</li>
                      <li><strong>返回首頁</strong> - 回到系統首頁</li>
                      <li><strong>再次分析</strong> - 使用相同功能進行新分析</li>
                    </ul>

                    <h4 className="font-medium mt-4">樂譜報告設定（元神音/琴瑟合）</h4>
                    <p className="text-sm text-base-content/70 mb-2">
                      音樂類分析報告可調整以下設定：
                    </p>
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                        <span className="badge badge-sm">樂器</span>
                        <span>選擇不同聲部的音色</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                        <span className="badge badge-sm">速度</span>
                        <span>調整 BPM 播放速度</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                        <span className="badge badge-sm">音量</span>
                        <span>各聲部與鼓聲音量</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                        <span className="badge badge-sm">節奏</span>
                        <span>選擇節奏風格</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-base-200 rounded md:col-span-2">
                        <span className="badge badge-sm badge-primary">自動連結</span>
                        <span>八分音符及更短的音符自動以橫線連結</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 歷史紀錄 */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">歷史紀錄</h2>
                  <div className="space-y-4">
                    <p>所有分析結果會自動儲存，可隨時從「歷史紀錄」查閱。</p>
                    <h4 className="font-medium">篩選功能</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-outline">依狀態</span>
                      <span className="badge badge-outline">依分析類型</span>
                      <span className="badge badge-outline">依受測者</span>
                      <span className="badge badge-outline">關鍵字搜尋</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* FAQ */}
          {activeSection === 'faq' && (
            <section className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">FAQ</h2>

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
                        建議定期將重要的分析報告列印為 PDF 保存。
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

                  <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      樂譜播放沒有聲音怎麼辦？
                    </div>
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
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      可以在手機上使用嗎？
                    </div>
                    <div className="collapse-content">
                      <p>
                        可以。系統支援響應式設計，在手機和平板上都能正常使用。
                        但建議使用桌面電腦以獲得最佳體驗，特別是查看報告和樂譜時。
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
