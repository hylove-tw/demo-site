import { registerPlugin, getPlugins, clearPluginsForTest } from './registry';

describe('plugin registry', () => {
  beforeEach(() => {
    clearPluginsForTest();
  });

  it('registers plugin manually', () => {
    const plugin = {
      id: 'test',
      name: 'Test Plugin',
      description: 'desc',
      requiredFiles: [],
      execute: jest.fn(),
      renderReport: jest.fn(),
    };
    registerPlugin(plugin as any);
    expect(getPlugins()).toContain(plugin as any);
  });

  it('auto registers plugin when module imported', () => {
    jest.resetModules();
    clearPluginsForTest();
    const pluginModule = require('./plugins/beverage_test');
    const plugin = pluginModule.default;
    expect(getPlugins()).toContain(plugin);
  });
});
