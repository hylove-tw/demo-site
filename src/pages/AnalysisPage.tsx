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

  groupedPlugins.sort((a, b) => {
    if (a.name === '主要功能') return -1;
    if (b.name === '主要功能') return 1;
    return a.name.localeCompare(b.name);
  });

  const successCount = history.filter((r) => r.status === Status.Success).length;

  return (
    <div className="space-y-8">
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
      {groupedPlugins.map((group) => (
        <div key={group.name}>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            {group.name}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {group.plugins.map((plugin) => (
              <Link
                key={plugin.id}
                to={`/analysis/${plugin.id}`}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="card-body flex-row gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="card-title text-base">
                      {plugin.name}
                    </h3>
                    <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                      {plugin.description}
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
      ))}
    </div>
  );
};

export default AnalysisPage;
