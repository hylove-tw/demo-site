// Regression test for the real audio bug musicgen traced with byte-level
// request comparison: `editParams.accompaniment` used to survive a rhythm
// change untouched (the old independent "節奏風格" select could change
// `beat` without CompositionParamsForm's onChange ever running), so an
// "不使用伴奏" picked for one style silently carried into the next one and
// the musician's arranged accompaniment got skipped entirely.
//
// No brainData is passed, so useMp3Export's auto-export never fires and
// StemMixer never mounts — this test only exercises the settings panel.
import { render, screen, fireEvent } from '@testing-library/react';
import MusicReportEditor from '../MusicReportEditor';

jest.mock('../../hooks/useMusicGenPresets', () => ({
    useMusicGenPresets: () => new Map(),
    // Every beat "has accompaniment" for this test — real gating logic is
    // covered elsewhere; here we only care whether `accompaniment` resets.
    presetForBeat: () => ({ hasAccompaniment: true, isNew: false, credit: undefined }),
    beatOptionLabel: (_: unknown, preset: { name?: string; id: string }) => preset.name ?? preset.id,
    beatCredit: () => undefined,
}));

jest.mock('../../services/musicGenService', () => ({
    exportMp3: jest.fn(),
    // Never resolves: keeps `scorePages` null so the ready/StemMixer branch
    // never mounts — this test only needs the always-rendered settings panel.
    renderScore: jest.fn(() => new Promise(() => {})),
    resolveRhythmPreset: jest.fn(() => undefined),
    fetchRenderedScore: jest.fn(() => Promise.resolve(null)),
}));

const MINIMAL_MUSICXML = '<?xml version="1.0"?><score-partwise></score-partwise>';

describe('MusicReportEditor accompaniment reset', () => {
    it('resets accompaniment to the default when the rhythm changes', () => {
        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae', accompaniment: 'off', bpm: 90 }}
            />
        );

        fireEvent.click(screen.getByText('編輯設定'));

        // Starts as the caller set it: the accompaniment picked for reggae.
        expect((screen.getByRole('combobox', { name: '伴奏方式' }) as HTMLSelectElement).value)
            .toBe('off');

        // Switch to a different genre — this is exactly the "beat changed"
        // transition that used to leave accompaniment alone.
        fireEvent.change(screen.getByRole('combobox', { name: '曲風' }), { target: { value: 'disco' } });

        expect((screen.getByRole('combobox', { name: '伴奏方式' }) as HTMLSelectElement).value)
            .toBe('replace');
    });

    it('keeps accompaniment untouched when the rhythm does not change', () => {
        render(
            <MusicReportEditor
                musicXML={MINIMAL_MUSICXML}
                initialParams={{ genre: 'reggae', beat: 'reggae', accompaniment: 'off', bpm: 90, title: 'x' }}
            />
        );

        fireEvent.click(screen.getByText('編輯設定'));

        // Something unrelated to genre/beat changes (the title, in 基本設定 —
        // both cards are visible at once, no tab switch needed to reach it).
        fireEvent.change(screen.getByPlaceholderText('未命名的樂譜'), { target: { value: 'y' } });

        expect((screen.getByRole('combobox', { name: '伴奏方式' }) as HTMLSelectElement).value)
            .toBe('off');
    });
});
