// Regression test for the doExport → exportMp3 call site: voicePack must
// actually be forwarded from appliedParams into the export payload, the
// same way genre/beat/etc. already are. A typo or omission here wouldn't be
// caught by musicGenService.test.ts (which only exercises exportMp3 in
// isolation) or CompositionParamsForm's own tests (which never reach this
// call site at all).
import { render, screen, waitFor } from '@testing-library/react';
import MusicReportEditor from '../MusicReportEditor';

const mockExportMp3 = jest.fn();

jest.mock('../../hooks/useMusicGenPresets', () => ({
    useMusicGenPresets: () => new Map(),
    presetForBeat: () => undefined,
    beatOptionLabel: (_: unknown, preset: { name?: string; id: string }) => preset.name ?? preset.id,
    beatCredit: () => undefined,
}));

jest.mock('../../hooks/useVoicePacks', () => ({
    useVoicePacks: () => ([{ id: 'generaluser-gs', displayName: 'GeneralUser GS', previewUrl: null }]),
}));

jest.mock('../../services/musicGenService', () => ({
    exportMp3: (...args: unknown[]) => mockExportMp3(...args),
    fetchCachedExportState: jest.fn().mockResolvedValue(null),
    renderScore: jest.fn().mockResolvedValue(['<svg>page</svg>']),
    resolveRhythmPreset: jest.fn(() => undefined),
    fetchRenderedScore: jest.fn().mockResolvedValue(null),
}));

const MINIMAL_MUSICXML = '<?xml version="1.0"?><score-partwise></score-partwise>';
const BRAIN_DATA = { before: {}, after: {} };

describe('MusicReportEditor voice pack forwarding', () => {
    beforeEach(() => {
        localStorage.clear();
        mockExportMp3.mockReset();
        mockExportMp3.mockImplementation(async (_payload, onStatusChange) => {
            onStatusChange({ status: 'completed', taskId: 'task-1', downloadUrl: '/x' });
        });
    });

    it('forwards the applied voicePack into the exportMp3 payload', async () => {
        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae', voicePack: 'generaluser-gs' }}
                brainData={BRAIN_DATA}
                cacheKey="200"
            />
        );

        await waitFor(() => expect(mockExportMp3).toHaveBeenCalledTimes(1));
        expect(mockExportMp3.mock.calls[0][0]).toEqual(
            expect.objectContaining({ voicePack: 'generaluser-gs' })
        );
    });

    it('leaves voicePack undefined when the report never set one', async () => {
        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae' }}
                brainData={BRAIN_DATA}
                cacheKey="201"
            />
        );

        await waitFor(() => expect(mockExportMp3).toHaveBeenCalledTimes(1));
        expect(mockExportMp3.mock.calls[0][0].voicePack).toBeUndefined();
    });

    it("shows the chosen pack's display name in the settings summary", async () => {
        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae', voicePack: 'generaluser-gs' }}
                brainData={BRAIN_DATA}
                cacheKey="202"
            />
        );

        await waitFor(() => expect(screen.getByText('GeneralUser GS')).toBeInTheDocument());
    });
});
