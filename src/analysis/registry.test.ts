import { registerPlugin, getPlugins, clearPluginsForTest } from './registry';

jest.mock('../services/api', () => ({ post: jest.fn() }));
jest.mock('../config/analysisRenderers', () => ({ renderBrainWaveMusicReport: jest.fn() }));

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
