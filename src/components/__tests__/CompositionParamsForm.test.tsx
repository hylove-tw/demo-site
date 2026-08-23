// Regression test for a preview-button gap that only hit bossa nova: the
// card's ▶ button is gated by preview.canPreview(style.id), but for a
// RHYTHM_ONLY_STYLE the id ('bossa_nova') and the beat id actually used to
// resolve a server preset ('bossanova') differ. samba's id and beat happen
// to be the same string, which is why samba's button worked and hid the bug.
import { render, screen, fireEvent } from '@testing-library/react';
import { CompositionParamsForm, applyRhythmStyle } from '../CompositionParamsForm';
import { RHYTHM_ONLY_STYLES, getBpmMidpoint } from '../../config/musicCreativeConstants';
import type { MusicGenPreset } from '../../services/musicGenService';

// Genre/BPM live under the 音樂設定 tab, which isn't active by default —
// the panel opens on 基本設定 (title, recording time, key).
const openMusicTab = () => fireEvent.click(screen.getByText('音樂設定'));

jest.mock('../../hooks/useMusicGenPresets', () => {
    const actual = jest.requireActual('../../hooks/useMusicGenPresets');
    const preset = (name: string): MusicGenPreset => ({
        name, displayName: null, credit: '漢克呂', isNew: true,
        hasAccompaniment: true, previewUrl: `/api/v1/assets/preview/${name}`,
    });
    // Deliberately no 'basic_pop' entry: a lookup that falls through to it
    // (the previous bug's symptom) must find nothing, not a stray previewUrl.
    return {
        ...actual,
        useMusicGenPresets: () => new Map([
            ['samba', preset('samba')],
            ['bossa_nova', preset('bossa_nova')],
        ]),
    };
});

describe('CompositionParamsForm rhythm-only style preview buttons', () => {
    it('shows a preview button for samba', () => {
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} />);
        openMusicTab();
        expect(screen.getByRole('button', { name: '試聽 森巴 節奏' })).toBeInTheDocument();
    });

    it('shows a preview button for bossa nova too, even though its id and beat differ', () => {
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} />);
        openMusicTab();
        expect(screen.getByRole('button', { name: '試聽 波沙諾瓦 節奏' })).toBeInTheDocument();
    });
});

// User-reported: the BPM slider itself correctly showed samba's 150-200
// range, but the "建議" (suggested) label below it showed 100 — chacha's
// borrowed-baseGenre midpoint, not samba's. The suggestion text reads
// currentGenre.bpmRange directly instead of the same `tempoRange` the
// slider's own min/max already derive from (which does prefer the active
// RHYTHM_ONLY_STYLE's range over the borrowed genre's).
describe('BPM suggestion label', () => {
    it("shows the active rhythm-only style's own midpoint, not the borrowed genre's", () => {
        const samba = RHYTHM_ONLY_STYLES.find((s) => s.id === 'samba')!;
        const value = applyRhythmStyle({}, samba);
        render(<CompositionParamsForm value={value} onChange={jest.fn()} />);
        openMusicTab();
        const sambaMidpoint = getBpmMidpoint(samba.bpmRange);
        expect(screen.getByText(`建議 ${sambaMidpoint}`)).toBeInTheDocument();
    });
});
