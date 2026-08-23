import React from 'react';

export interface AnalysisRequiredFile {
  verbose_name: string;
  name: string;
}

export interface CustomField {
  label: string;
  fieldName: string;
  type?: 'string' | 'number' | 'boolean';
  defaultValue?: any;
}

export interface AnalysisPluginBanner {
  /** 裝飾用插畫（無文字版），標題/描述/CTA 一律用真正的 DOM 文字疊上去。 */
  image: string;
  eyebrow?: string; // 小標，例如 "BRAINWAVE TO MUSIC"
  title: string;
  description: string;
  tags?: string[]; // 例如 ["單人／雙人", "情緒／心靈", "大調／小調"]
  ctaLabel?: string; // 例如 "開始創作"
}

export interface AnalysisPlugin {
  id: string;
  group?: string;
  name: string;
  badge?: { text: string; color: string }; // 標籤（如 Beta、New 等）
  shortDescription?: string; // 首頁卡片用的簡短說明
  description: string; // 詳細頁面用的完整說明
  /** 進入頁頂部的插畫式 hero banner；沒有設定時維持原本的純文字標題列。 */
  bannerImage?: AnalysisPluginBanner;
  requiredFiles: AnalysisRequiredFile[];
  execute: (data: any[][], customParams?: Record<string, any>) => Promise<any>;
  renderReport: (result: any, customParams?: any) => React.ReactNode;
  customFields?: CustomField[];
  editComponent?: React.FC<{
    customParams: Record<string, any>;
    onChange: (newParams: Record<string, any>) => void;
  }>;
}

const plugins: AnalysisPlugin[] = [];

export function registerPlugin(plugin: AnalysisPlugin) {
  plugins.push(plugin);
}

export function getPlugins(): AnalysisPlugin[] {
  return plugins;
}
// Helper used only in tests to reset the registry state
export function clearPluginsForTest() {
  plugins.length = 0;
}