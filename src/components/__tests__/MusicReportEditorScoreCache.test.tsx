// Regression tests for reusing a task's rendered score across page
// refreshes. The MP3 export cache (musicExportCache.ts) fixed the 30-60s
// resynthesis wait, but the separate render-score round trip (Verovio SVG
// rendering) still ran unconditionally on every mount — a real user report
// showed "✓ MP3 已合成" appearing instantly while "渲染樂譜中…" kept
// spinning right next to it. A task's rendered score is immutable, so this
// is cached by task id (musicScoreCache.ts) rather than by report id: no
// separate invalidation logic is needed, since a fresh generation always
// gets a fresh task id that simply misses this cache the first time.
import { render, screen, waitFor } from '@testing-library/react';
import MusicReportEditor from '../MusicReportEditor';
import { writeCachedScorePages, readCachedScorePages } from '../../utils/musicScoreCache';

const mockExportMp3 = jest.fn();
const mockRenderScore = jest.fn();
const mockFetchRenderedScore = jest.fn();
const mockFetchCachedExportState = jest.fn();

jest.mock('../../hooks/useMusicGenPresets', () => ({
    useMusicGenPresets: () => new Map(),
    presetForBeat: () => undefined,
    beatOptionLabel: (_: unknown, preset: { name?: string; id: string }) => preset.name ?? preset.id,
    beatCredit: () => undefined,
}));

jest.mock('../../services/musicGenService', () => ({
    exportMp3: (...args: unknown[]) => mockExportMp3(...args),
    fetchCachedExportState: (...args: unknown[]) => mockFetchCachedExportState(...args),
    renderScore: (...args: unknown[]) => mockRenderScore(...args),
    resolveRhythmPreset: jest.fn(() => undefined),
    fetchRenderedScore: (...args: unknown[]) => mockFetchRenderedScore(...args),
}));

// A plain function, not jest.fn(...): CRA's resetMocks:true wipes jest.fn
// implementations between tests, which would turn fetchVoicePacks() into a
// bare stub returning undefined — useVoicePacks.ts calls `.then()` on it
// directly, which doesn't tolerate that. Mocking the hook itself sidesteps
// it entirely (same pattern as useMusicGenPresets above).
jest.mock('../../hooks/useVoicePacks', () => ({
    useVoicePacks: () => [],
}));

const MINIMAL_MUSICXML = '<?xml version="1.0"?><score-partwise></score-partwise>';
const BRAIN_DATA = { before: {}, after: {} };

describe('MusicReportEditor score-render cache', () => {
    beforeEach(() => {
        localStorage.clear();
        mockExportMp3.mockReset();
        mockRenderScore.mockReset();
        mockFetchRenderedScore.mockReset();
        mockFetchCachedExportState.mockReset();
        mockFetchCachedExportState.mockResolvedValue(null);
        mockFetchRenderedScore.mockResolvedValue(null);
    });

    it('skips renderScore entirely when this task already has a cached rendering', async () => {
        writeCachedScorePages('task-with-score', ['<svg>cached page</svg>']);
        mockExportMp3.mockImplementation(async (_payload, onStatusChange) => {
            onStatusChange({ status: 'completed', taskId: 'task-with-score', downloadUrl: '/x' });
        });

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={BRAIN_DATA}
                cacheKey="90"
            />
        );

        // Once ready, the loading block (which "✓ 樂譜已渲染" lives in) is
        // replaced entirely by the toolbar/mixer view — "重新生成" only
        // renders there, so it's a stable signal that rendering finished.
        await waitFor(() => expect(screen.getByText('重新生成')).toBeInTheDocument(), { timeout: 3000 });
        expect(mockRenderScore).not.toHaveBeenCalled();
        expect(mockFetchRenderedScore).not.toHaveBeenCalled();
    });

    it('renders fresh and caches the result when nothing is cached for this task', async () => {
        mockExportMp3.mockImplementation(async (_payload, onStatusChange) => {
            onStatusChange({ status: 'completed', taskId: 'brand-new-task', downloadUrl: '/x' });
        });
        mockRenderScore.mockResolvedValue(['<svg>fresh page</svg>']);

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={BRAIN_DATA}
                cacheKey="91"
            />
        );

        await waitFor(() => expect(mockRenderScore).toHaveBeenCalledTimes(1), { timeout: 3000 });
        await waitFor(() => expect(readCachedScorePages('brand-new-task')).toEqual(['<svg>fresh page</svg>']));
    });
});
