// Regression tests for reusing a previously-completed export across page
// refreshes: every refresh of a report page remounts MusicReportEditor,
// which used to always call exportMp3 fresh — resynthesizing the same MP3
// from scratch (30-60s) every single time, even though nothing changed.
// `cacheKey` (the history record's own id) now lets a remount check for an
// already-completed task via a single cheap GET (fetchCachedExportState)
// and skip exportMp3 entirely when one is found.
import { render, screen, waitFor } from '@testing-library/react';
import MusicReportEditor from '../MusicReportEditor';
import { readCachedTaskId } from '../../utils/musicExportCache';

const mockExportMp3 = jest.fn();
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
    // Never resolves: keeps scorePages null so the ready/StemMixer branch
    // never mounts — these tests only care about the export path.
    renderScore: jest.fn(() => new Promise(() => {})),
    resolveRhythmPreset: jest.fn(() => undefined),
    fetchRenderedScore: jest.fn(() => Promise.resolve(null)),
}));

const MINIMAL_MUSICXML = '<?xml version="1.0"?><score-partwise></score-partwise>';
const BRAIN_DATA = { before: {}, after: {} };

describe('MusicReportEditor export cache', () => {
    beforeEach(() => {
        localStorage.clear();
        mockExportMp3.mockReset();
        mockFetchCachedExportState.mockReset();
    });

    it('reuses a cached completed task instead of calling exportMp3 again', async () => {
        localStorage.setItem('musicGenTaskCache', JSON.stringify({ '42': 'cached-task-1' }));
        mockFetchCachedExportState.mockResolvedValue({
            status: 'completed',
            taskId: 'cached-task-1',
            downloadUrl: '/download/cached-task-1',
        });

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={BRAIN_DATA}
                cacheKey="42"
            />
        );

        await waitFor(() => expect(mockFetchCachedExportState).toHaveBeenCalledWith('cached-task-1', expect.anything()));
        expect(mockExportMp3).not.toHaveBeenCalled();
        expect(await screen.findByText('✓ MP3 已合成')).toBeInTheDocument();
    });

    it('falls back to a fresh export when there is nothing cached, then caches the result', async () => {
        mockFetchCachedExportState.mockResolvedValue(null);
        mockExportMp3.mockImplementation(async (_payload, onStatusChange) => {
            onStatusChange({ status: 'completed', taskId: 'new-task-1', downloadUrl: '/download/new-task-1' });
        });

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={BRAIN_DATA}
                cacheKey="43"
            />
        );

        await waitFor(() => expect(mockExportMp3).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(readCachedTaskId('43')).toBe('new-task-1'));
    });

    it('does not consult the cache at all without a cacheKey (e.g. legacy reports)', async () => {
        mockExportMp3.mockImplementation(async (_payload, onStatusChange) => {
            onStatusChange({ status: 'completed', taskId: 'no-cache-key-task', downloadUrl: '/x' });
        });

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={BRAIN_DATA}
            />
        );

        await waitFor(() => expect(mockExportMp3).toHaveBeenCalledTimes(1));
        expect(mockFetchCachedExportState).not.toHaveBeenCalled();
    });
});
