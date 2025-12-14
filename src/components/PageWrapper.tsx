// src/components/PageWrapper.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { getPlugins, AnalysisPlugin } from '../analysis/registry';

interface PageWrapperProps {
  children: React.ReactNode;
}

interface PluginGroup {
  name: string;
  plugins: AnalysisPlugin[];
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const { currentUser, users, setCurrentUser } = useUserContext();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleSwitchUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedUser = users.find((user) => user.id === selectedId) || null;
    setCurrentUser(selectedUser);
  };

  const isActive = (path: string) => location.pathname === path;
  const isAnalysisActive = (pluginId: string) => location.pathname === `/analysis/${pluginId}`;

  const navItems = [
    { path: '/', label: '首頁', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { path: '/history', label: '歷史紀錄', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { path: '/files', label: '檔案', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )},
    { path: '/users', label: '使用者', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { path: '/tutorial', label: '教學', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )},
  ];

  return (
    <div className="flex h-screen bg-bg">
      {/* 側邊欄 - 桌面版 */}
      <aside className="hidden lg:flex flex-col w-60 bg-bg-sidebar border-r border-border">
        {/* Logo */}
        <div className="p-5 border-b border-border-light">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-medium text-sm">H</span>
            </div>
            <span className="text-lg font-medium text-text tracking-wide">Hylove</span>
          </Link>
        </div>

        {/* 使用者選擇 */}
        <div className="px-4 py-3 border-b border-border-light">
          <div className="form-control">
            <label className="label label-minimal py-0 mb-1">
              <span className="label-text text-[10px]">使用者</span>
            </label>
            <select
              className="select select-underline w-full text-sm"
              value={currentUser?.id || ''}
              onChange={handleSwitchUser}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 主導覽 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-bg-active text-text font-medium'
                      : 'text-text-muted hover:text-text hover:bg-bg-hover'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* 分析功能 */}
          <div className="mt-8">
            <div className="px-3 mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">分析功能</span>
            </div>
            {groupedPlugins.map((group) => (
              <div key={group.name} className="mb-5">
                <div className="px-3 mb-2">
                  <span className="text-xs text-text-light">{group.name}</span>
                </div>
                <ul className="space-y-0.5">
                  {group.plugins.map((plugin) => (
                    <li key={plugin.id}>
                      <Link
                        to={`/analysis/${plugin.id}`}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isAnalysisActive(plugin.id)
                            ? 'bg-bg-active text-text font-medium'
                            : 'text-text-muted hover:text-text hover:bg-bg-hover'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAnalysisActive(plugin.id) ? 'bg-primary' : 'bg-text-light'}`}></span>
                        <span className="truncate">{plugin.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* 底部 */}
        <div className="p-4 border-t border-border-light">
          <div className="text-xs text-text-light text-center">
            &copy; {new Date().getFullYear()} Hylove
          </div>
        </div>
      </aside>

      {/* 行動版側邊欄 */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-text/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-bg-sidebar shadow-xl">
            {/* Logo */}
            <div className="p-5 border-b border-border-light flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-medium text-sm">H</span>
                </div>
                <span className="text-lg font-medium text-text tracking-wide">Hylove</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 使用者選擇 */}
            <div className="px-4 py-3 border-b border-border-light">
              <div className="form-control">
                <label className="label label-minimal py-0 mb-1">
                  <span className="label-text text-[10px]">使用者</span>
                </label>
                <select
                  className="select select-underline w-full text-sm"
                  value={currentUser?.id || ''}
                  onChange={handleSwitchUser}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 導覽 */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isActive(item.path)
                          ? 'bg-bg-active text-text font-medium'
                          : 'text-text-muted hover:text-text hover:bg-bg-hover'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <div className="px-3 mb-3">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">分析功能</span>
                </div>
                {groupedPlugins.map((group) => (
                  <div key={group.name} className="mb-5">
                    <div className="px-3 mb-2">
                      <span className="text-xs text-text-light">{group.name}</span>
                    </div>
                    <ul className="space-y-0.5">
                      {group.plugins.map((plugin) => (
                        <li key={plugin.id}>
                          <Link
                            to={`/analysis/${plugin.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                              isAnalysisActive(plugin.id)
                                ? 'bg-bg-active text-text font-medium'
                                : 'text-text-muted hover:text-text hover:bg-bg-hover'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isAnalysisActive(plugin.id) ? 'bg-primary' : 'bg-text-light'}`}></span>
                            <span className="truncate">{plugin.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* 主內容區 */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* 頂部列 - 行動版 */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-bg-card border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-medium text-xs">H</span>
            </div>
            <span className="font-medium text-text">Hylove</span>
          </Link>
          <div className="w-9" />
        </header>

        {/* 主內容 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
