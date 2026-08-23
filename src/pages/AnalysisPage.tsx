// src/pages/AnalysisPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { getPlugins, AnalysisPlugin } from "../analysis/registry";
import { useAnalysisManager } from "../hooks/useAnalysisManager";

export enum Status {
  Success = "成功",
  Failure = "失敗",
}

interface PluginGroup {
  name: string;
  plugins: AnalysisPlugin[];
}

const AnalysisPage: React.FC = () => {
  const { history } = useAnalysisManager();
  const plugins = getPlugins();

  // 依群組分類插件
  const groupedPlugins = plugins.reduce<PluginGroup[]>((acc, plugin) => {
    const groupName = plugin.group || '主要功能';
    const existingGroup = acc.find((g) => g.name === groupName);
    if (existingGroup) {
      existingGroup.plugins.push(plugin);
    } else {
      acc.push({ name: groupName, plugins: [plugin] });
    }
    return acc;
  }, []);

  // 群組描述與排序
  const groupMeta: Record<string, { description: string; badgeClass: string; order: number }> = {
    '主要功能': { description: '核心分析系統', badgeClass: 'badge-primary', order: 0 },
    '利養炁': { description: '正念修行系列', badgeClass: 'badge-secondary', order: 1 },
    '易 Motion': { description: '情緒評比系列', badgeClass: 'badge-accent', order: 2 },
  };

  groupedPlugins.sort((a, b) => {
    const orderA = groupMeta[a.name]?.order ?? 99;
    const orderB = groupMeta[b.name]?.order ?? 99;
    return orderA - orderB;
  });

  const successCount = history.filter((r) => r.status === Status.Success).length;
  const bannerPlugins = plugins.filter((p) => p.bannerImage);

  return (
    <div className="space-y-8">
      {/* Demo 網站提示 */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <span className="font-medium">這是展示用 Demo 網站</span>
          <span className="hidden sm:inline"> — </span>
          <br className="sm:hidden" />
          <span>所有資料僅儲存於您的瀏覽器中，不會上傳至伺服器。清除瀏覽器資料將會遺失所有內容。</span>
        </div>
      </div>

      {/* 插畫式 hero banner——CTA「開始創作」在首頁才有意義（把使用者帶
          進那個 plugin），分析功能的進入頁本身已經是「進來要做的事」，
          不需要再有一個 CTA。插畫本身沒有文字，標題/描述/CTA 都是真正的
          DOM 文字疊上去，才能維持可及性、跟頁面一致的字體與主題。 */}
      {bannerPlugins.map((plugin) => {
        const banner = plugin.bannerImage!;
        return (
          <div
            key={plugin.id}
            className="relative overflow-hidden rounded-2xl"
            style={{ backgroundColor: '#f9ecd8' }}
          >
            <img
              src={banner.image}
              alt=""
              aria-hidden="true"
              // 插畫的視覺重心（腦波圓形/波形/推桿/五線譜）落在圖片右側
              // 六成左右，左側大多是留白紙紋——用 object-position 把可視
              // 窗口錨定在偏右的位置，手機版窄版面才不會只看到空白。容器
              // 背景色跟插畫本身的底色完全一致，裁切到哪裡都不會露出接縫。
              className="absolute inset-0 w-full h-full object-cover object-[80%_center] md:object-[62%_center]"
            />
            {/* 手機版文字滿版疊在插畫上，跟插畫本身的圖案直接重疊會看不
                清楚——用跟插畫同色的柔和遮罩，維持色調一致但保住可讀性。 */}
            <div className="absolute inset-0 bg-[#f9ecd8]/80 md:hidden" />
            {/* 桌機版文字欄本身不寬（md:max-w-[26rem]），但這個頁面的
                容器寬度會隨畫面寬度變化（見 PageWrapper 的 max-w-5xl），
                夠寬時插畫最複雜的圖案（腦波圓形）還是會被縮放進文字欄
                範圍內、疊到描述文字上。用漸層取代單一色塊：文字欄那側
                維持不透明，往插畫方向漸漸透明，不管容器實際多寬，文字
                後面永遠有一致的底色，同時盡量露出插畫。 */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{ background: 'linear-gradient(to right, #f9ecd8 0%, #f9ecd8 55%, rgba(249,236,216,0) 85%)' }}
            />
            <div className="relative z-10 px-6 py-8 md:py-10 md:max-w-[26rem]">
              {banner.eyebrow && (
                <div className="text-xs font-medium tracking-widest text-base-content/50 mb-2">
                  {banner.eyebrow}
                </div>
              )}
              <h2 className="text-3xl font-bold mb-2">
                {banner.title}
                {plugin.badge && (
                  <span className={`badge badge-sm ${plugin.badge.color} ml-2 align-middle`}>
                    {plugin.badge.text}
                  </span>
                )}
              </h2>
              <p className="text-base-content/70 mb-4">{banner.description}</p>
              {banner.tags && banner.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/50 mb-5">
                  {banner.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
              {banner.ctaLabel && (
                <Link to={`/analysis/${plugin.id}`} className="btn btn-primary btn-sm gap-1">
                  {banner.ctaLabel}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">分析功能</h1>
          <p className="text-text-muted mt-1">選擇分析功能開始腦波分析</p>
        </div>
        {history.length > 0 && (
          <Link
            to="/history"
            className="btn btn-ghost gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            歷史紀錄
            <span className="badge badge-primary badge-sm">
              {successCount}
            </span>
          </Link>
        )}
      </div>

      {/* 分析功能列表 */}
      {groupedPlugins.map((group) => {
        const meta = groupMeta[group.name] || { description: '', badgeClass: 'badge-ghost', order: 99 };
        return (
          <div key={group.name}>
            {/* 群組標題 - 比照教學頁面設計 */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`badge badge-sm ${meta.badgeClass}`}>{group.name}</span>
              <span className="text-sm text-text-muted">{meta.description}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {group.plugins.map((plugin) => (
                <Link
                  key={plugin.id}
                  to={`/analysis/${plugin.id}`}
                  className={`relative overflow-hidden block p-4 rounded-lg transition-colors ${
                    plugin.bannerImage ? 'hover:brightness-[0.97]' : 'bg-base-200 hover:bg-base-300'
                  }`}
                  style={plugin.bannerImage ? { backgroundColor: '#f9ecd8' } : undefined}
                >
                  {/* 有 hero banner 的主打功能，清單卡片背景用同一張插畫，
                      淡化到只是質感、不搶文字——呼應上面 hero 用的插畫，
                      但這裡只是清單裡的一項，不需要跟 hero 一樣搶眼。 */}
                  {plugin.bannerImage && (
                    <img
                      src={plugin.bannerImage.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover object-[70%_center] opacity-20"
                    />
                  )}
                  <div className="relative z-10">
                    <p className="font-medium">
                      {plugin.name}
                      {plugin.badge && (
                        <span className={`badge badge-sm ${plugin.badge.color} ml-2`}>
                          {plugin.badge.text}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-base-content/60 mt-1">
                      {plugin.shortDescription || plugin.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisPage;
