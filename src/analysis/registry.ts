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

export interface AnalysisPlugin {
  id: string;
  group?: string;
  name: string;
  description: string;
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

// Testing utility to reset registry state
export function clearPluginsForTest() {
  plugins.length = 0;
}
