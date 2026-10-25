// The creative-platform result toolbar (single and dual) gains 「下載 MIDI」
// only after music-gen reports a midi_url. A null midi_url must leave the
// MP3 download in place and must not look like a failed generation.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MusicReportEditor from '../MusicReportEditor';
import DualMusicReportEditor from '../DualMusicReportEditor';
import { writeCachedScorePages } from '../../utils/musicScoreCache';

const mockExportMp3 = jest.fn();
const mockExportDualMp3 = jest.fn();
const mockRenderScore = jest.fn();
const mockFetchRenderedScore = jest.fn();
const mockFetchCachedExportState = jest.fn();

jest.mock('../../hooks/useMusicGenPresets', () => ({
    useMusicGenPresets: () => new Map(),
    presetForBeat: () => undefined,
    beatOptionLabel: (_: unknown, preset: { name?: string; id: string }) => preset.name ?? preset.id,
    beatCredit: () => undefined,
}));

jest.mock('../../hooks/useVoicePacks', () => ({
    useVoicePacks: () => [],
}));

jest.mock('../../services/musicGenService', () => ({
    exportMp3: (...args: unknown[]) => mockExportMp3(...args),
    exportDualMp3: (...args: unknown[]) => mockExportDualMp3(...args),
    fetchCachedExportState: (...args: unknown[]) => mockFetchCachedExportState(...args),
    renderScore: (...args: unknown[]) => mockRenderScore(...args),
    resolveRhythmPreset: jest.fn(() => undefined),
    fetchRenderedScore: (...args: unknown[]) => mockFetchRenderedScore(...args),
}));

const MINIMAL_MUSICXML = '<?xml version="1.0"?><score-partwise></score-partwise>';

function completeWith(midiUrl: string | undefined) {
    return async (_payload: unknown, onStatusChange: (state: Record<string, unknown>) => void) => {
        onStatusChange({
            status: 'completed',
            taskId: 'task-midi',
            downloadUrl: '/api/music-gen/api/v1/download/task-midi',
            ...(midiUrl ? { midiUrl } : {}),
        });
    };
}

describe('music result MIDI download', () => {
    beforeEach(() => {
        localStorage.clear();
        mockExportMp3.mockReset();
        mockExportDualMp3.mockReset();
        mockRenderScore.mockReset();
        mockFetchRenderedScore.mockReset();
        mockFetchCachedExportState.mockReset();
        mockFetchCachedExportState.mockResolvedValue(null);
        mockFetchRenderedScore.mockResolvedValue(null);
        mockRenderScore.mockResolvedValue(['<svg></svg>']);
        writeCachedScorePages('task-midi', ['<svg>cached</svg>']);
    });

    it('places 下載 MIDI next to the MP3 download on the single-player report', async () => {
        mockExportMp3.mockImplementation(completeWith('/api/music-gen/api/v1/midi/task-midi'));

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ title: '腦波曲', genre: 'reggae', beat: 'reggae' }}
                brainData={{ before: {}, after: {} }}
                cacheKey="midi-single"
            />
        );

        const midi = await screen.findByRole('button', { name: '下載 MIDI' }, { timeout: 3000 });
        const mp3 = screen.getByRole('link', { name: '音樂下載' });
        expect(midi.parentElement?.parentElement).toBe(mp3.parentElement);
        expect(screen.getAllByRole('button', { name: '下載 MIDI' })).toHaveLength(1);
        expect(mp3).toHaveAttribute('href', '/api/music-gen/api/v1/download/task-midi');
    });

    it('hides MIDI and keeps the completed MP3 when midi_url is null', async () => {
        mockExportMp3.mockImplementation(completeWith(undefined));

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={{ before: {}, after: {} }}
                cacheKey="midi-null"
            />
        );

        await screen.findByText('重新生成', {}, { timeout: 3000 });
        expect(screen.queryByRole('button', { name: '下載 MIDI' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: '音樂下載' })).toBeInTheDocument();
        expect(screen.getByText('✓ MP3 已就緒')).toBeInTheDocument();
    });

    it('a failed MIDI download does not take down the MP3', async () => {
        mockExportMp3.mockImplementation(completeWith('/api/music-gen/api/v1/midi/task-midi'));
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
            headers: { get: () => null },
            blob: async () => new Blob(),
        }) as any;

        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={{ before: {}, after: {} }}
                cacheKey="midi-error"
            />
        );

        const midi = await screen.findByRole('button', { name: '下載 MIDI' }, { timeout: 3000 });
        fireEvent.click(midi);

        expect(await screen.findByRole('alert')).toHaveTextContent('MIDI 尚未提供');
        expect(screen.getByRole('link', { name: '音樂下載' })).toHaveAttribute(
            'href',
            '/api/music-gen/api/v1/download/task-midi',
        );
        expect(screen.getByText('✓ MP3 已就緒')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '下載 MIDI' })).toBeEnabled();
    });

    it('offers one MIDI file on the dual report, and hides it when midi_url is null', async () => {
        mockExportDualMp3.mockImplementation(completeWith('/api/music-gen/api/v1/midi/task-midi'));

        const { unmount } = render(
            <DualMusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ title: '雙人曲', genre: 'reggae', beat: 'reggae' }}
                brainData={{ first: {}, second: {} }}
                cacheKey="midi-dual"
            />
        );

        expect(await screen.findByRole('button', { name: '下載 MIDI' }, { timeout: 3000 })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: '下載 MIDI' })).toHaveLength(1);
        expect(screen.getByRole('link', { name: '音樂下載' })).toBeInTheDocument();

        unmount();
        mockExportDualMp3.mockImplementation(completeWith(undefined));
        render(
            <DualMusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={{ first: {}, second: {} }}
                cacheKey="midi-dual-null"
            />
        );

        await screen.findByText('重新生成', {}, { timeout: 3000 });
        expect(screen.queryByRole('button', { name: '下載 MIDI' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: '音樂下載' })).toBeInTheDocument();
    });
});
