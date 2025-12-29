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
                  className="block p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                >
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
