import { registerPlugin, getPlugins, clearPluginsForTest } from './registry';

const dummyPlugin = {
  id: 'test',
  name: 'Test Plugin',
  description: 'for testing',
  requiredFiles: [],
  execute: async () => 'ok',
  renderReport: () => null,
};

describe('plugin registry', () => {
  beforeEach(() => {
    clearPluginsForTest();
  });

  test('registerPlugin stores plugins', () => {
    registerPlugin(dummyPlugin);
    expect(getPlugins()).toContain(dummyPlugin);
  });

  test('imported plugin registers automatically', async () => {
    await import('./plugins/beverage_test');
    const plugin = getPlugins().find((p) => p.id === 'beverage_test');
    expect(plugin).toBeDefined();
  });
});
