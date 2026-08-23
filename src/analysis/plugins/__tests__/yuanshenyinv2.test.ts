// Smoke test for the yuanshenyin-v2 plugin's bannerImage config — the actual
// rendering/scroll-to-file-selection behavior was verified visually via
// Playwright screenshots (desktop + mobile) against a real build, since
// AnalysisDetailPage pulls in enough app-wide context (router, file manager,
// user context, plugin registry) that a full render test would mostly be
// re-testing that scaffolding rather than this feature.
import React from 'react';
import { render } from '@testing-library/react';
import { getPlugins } from '../../registry';

// /api/v1/generate-dual has no voice_pack field yet — capture what the
// plugin's EditComponent actually passes through rather than rendering the
// real (hook-heavy) CompositionParamsForm.
const mockCompositionParamsForm = jest.fn();
jest.mock('../../../components/CompositionParamsForm', () => {
    const actual = jest.requireActual('../../../components/CompositionParamsForm');
    return {
        ...actual,
        CompositionParamsForm: (props: unknown) => { mockCompositionParamsForm(props); return null; },
    };
});

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
const mockRenderBrainWaveMusicReport = jest.fn();
const mockRenderDualMusicReportCreative = jest.fn();
jest.mock('../../../config/analysisRenderers', () => ({
    renderBrainWaveMusicReport: (...args: unknown[]) => mockRenderBrainWaveMusicReport(...args),
    renderDualMusicReportCreative: (...args: unknown[]) => mockRenderDualMusicReportCreative(...args),
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

    // Real bug this caught: renderReport was a hand-written wrapper (for the
    // single/dual branch) that only declared 2 parameters and never forwarded
    // a 3rd — silently dropping reportKey (used to key the MP3 export cache
    // across page refreshes) even though every type along the chain declared
    // it correctly. A direct call through the *plugin's* renderReport, not
    // the renderer functions themselves, is what catches this — calling
    // renderBrainWaveMusicReport directly (as other tests do) can't see it.
    it('forwards reportKey through to the single-player renderer', () => {
        plugin?.renderReport({ musicXML: '<x/>' }, {}, 'report-42');
        expect(mockRenderBrainWaveMusicReport).toHaveBeenCalledWith(
            { musicXML: '<x/>' }, {}, 'report-42'
        );
    });

    it('forwards reportKey through to the dual-player renderer', () => {
        plugin?.renderReport({ musicXML: '<x/>' }, { playerMode: 'dual' }, 'report-43');
        expect(mockRenderDualMusicReportCreative).toHaveBeenCalledWith(
            { musicXML: '<x/>' }, { playerMode: 'dual' }, 'report-43'
        );
    });
});

describe('yuanshenyin-v2 plugin editComponent voice pack visibility', () => {
    const plugin = getPlugins().find((p) => p.id === 'yuanshenyin-v2');
    const EditComponent = plugin!.editComponent!;

    it('shows the voice pack picker in single mode', () => {
        render(React.createElement(EditComponent, { customParams: {}, onChange: jest.fn() }));
        expect(mockCompositionParamsForm).toHaveBeenCalledWith(
            expect.objectContaining({ showVoicePack: true })
        );
    });

    it('hides the voice pack picker in dual mode', () => {
        render(React.createElement(EditComponent, { customParams: { playerMode: 'dual' }, onChange: jest.fn() }));
        expect(mockCompositionParamsForm).toHaveBeenCalledWith(
            expect.objectContaining({ showVoicePack: false })
        );
    });
});
