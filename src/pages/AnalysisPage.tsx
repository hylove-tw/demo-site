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
  const groupMeta: Record<string, { description: string; badgeClass: string; iconBg: string; iconColor: string; order: number }> = {
    '主要功能': { description: '核心分析系統', badgeClass: 'badge-primary', iconBg: 'bg-primary/10', iconColor: 'text-primary', order: 0 },
    '利養炁': { description: '正念修行系列', badgeClass: 'badge-secondary', iconBg: 'bg-secondary/10', iconColor: 'text-secondary', order: 1 },
    '易 Motion': { description: '情緒評比系列', badgeClass: 'badge-accent', iconBg: 'bg-accent/10', iconColor: 'text-accent', order: 2 },
  };

  groupedPlugins.sort((a, b) => {
    const orderA = groupMeta[a.name]?.order ?? 99;
    const orderB = groupMeta[b.name]?.order ?? 99;
    return orderA - orderB;
  });

  const successCount = history.filter((r) => r.status === Status.Success).length;

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
        const meta = groupMeta[group.name] || { description: '', badgeClass: 'badge-ghost', iconBg: 'bg-base-300', iconColor: 'text-base-content', order: 99 };
        return (
          <div key={group.name}>
            {/* 群組標題 - 比照教學頁面設計 */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`badge ${meta.badgeClass}`}>{group.name}</span>
              <span className="text-sm text-text-muted">{meta.description}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {group.plugins.map((plugin) => (
                <Link
                  key={plugin.id}
                  to={`/analysis/${plugin.id}`}
                  className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="card-body flex-row gap-4">
                    <div className={`w-10 h-10 rounded-full ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${meta.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="card-title text-base">
                          {plugin.name}
                        </h3>
                        <span className={`badge badge-sm ${meta.badgeClass} badge-outline`}>
                          {group.name}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                        {plugin.shortDescription || plugin.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-base-content/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-base-content/30"></span>
                        <span>{plugin.requiredFiles.length} 個檔案</span>
                      </div>
                    </div>
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
