import { registerPlugin, getPlugins, clearPluginsForTest } from './registry';

describe('plugin registry', () => {
  beforeEach(() => {
    clearPluginsForTest();
  });

  it('registers plugin manually', () => {
    const plugin = {
      id: 'test',
      name: 'Test',
      description: 'd',
      requiredFiles: [],
      execute: async () => null,
      renderReport: () => null,
    };
    registerPlugin(plugin);
    expect(getPlugins()).toContain(plugin);
  });

  it('auto registers plugin when module imported', async () => {
    await import('./plugins/music_test');
    const found = getPlugins().find(p => p.id === 'music_test');
    expect(found).toBeDefined();
  });
});
