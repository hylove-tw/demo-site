// Smoke test for the yuanshenyin-v2 plugin's bannerImage config — the actual
// rendering/scroll-to-file-selection behavior was verified visually via
// Playwright screenshots (desktop + mobile) against a real build, since
// AnalysisDetailPage pulls in enough app-wide context (router, file manager,
// user context, plugin registry) that a full render test would mostly be
// re-testing that scaffolding rather than this feature.
import { getPlugins } from '../../registry';

// yuanshenyinv2.tsx pulls these in for execute()/renderReport(), which in
// turn import services/api.ts — axios there is ESM-only and doesn't
// transform under this project's jest config (a pre-existing, unrelated gap
// also hit by src/services/api.test.ts and src/App.test.tsx). Mock both so
// this test can check the plugin's static bannerImage config without
// tripping over that.
jest.mock('../../../config/analysisMethods', () => ({
    musicAnalysisCreative: jest.fn(),
    dualMusicAnalysisCreative: jest.fn(),
}));
jest.mock('../../../config/analysisRenderers', () => ({
    renderBrainWaveMusicReport: jest.fn(),
    renderDualMusicReportCreative: jest.fn(),
}));

import '../yuanshenyinv2';

describe('yuanshenyin-v2 plugin bannerImage', () => {
    const plugin = getPlugins().find((p) => p.id === 'yuanshenyin-v2');

    it('is registered with a complete bannerImage config', () => {
        expect(plugin).toBeDefined();
        expect(plugin?.bannerImage).toBeDefined();
        expect(plugin?.bannerImage?.image).toEqual(expect.stringContaining('.webp'));
        expect(plugin?.bannerImage?.title).toBe('元神音創意平台');
        expect(plugin?.bannerImage?.description.length).toBeGreaterThan(0);
        expect(plugin?.bannerImage?.ctaLabel).toBe('開始創作');
    });
});
