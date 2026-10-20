// Behaviour introduced by the "direction A" redesign of the music-parameter
// form: 自訂 opens its melody/rhythm override in place (right under the genre
// strip, not ~900px further down), the 全部曲風 bottom sheet picks a genre
// through the same applyGenre path as the tiles, and the BPM stepper clamps
// to the genre's range instead of snapping on every keystroke.
import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import {
    CompositionParamsForm,
    CompositionParams,
    SINGLE_INSTRUMENT_FIELDS,
    DUAL_INSTRUMENT_FIELDS,
    CUSTOM_GENRE_ID,
    summarizeCompositionParams,
    clampBpm,
} from '../CompositionParamsForm';
import { GENRES, getBpmMidpoint } from '../../config/musicCreativeConstants';

jest.mock('../../hooks/useMusicGenPresets', () => {
    const actual = jest.requireActual('../../hooks/useMusicGenPresets');
    return { ...actual, useMusicGenPresets: () => new Map() };
});

let latest: CompositionParams = {};
const Harness: React.FC<{ initial: CompositionParams; variant?: 'full' | 'compact'; dual?: boolean }> = ({ initial, variant, dual }) => {
    const [value, setValue] = useState<CompositionParams>(initial);
    latest = value;
    return (
        <CompositionParamsForm value={value} onChange={(v) => { latest = v; setValue(v); }} variant={variant}
            instrumentFields={dual ? DUAL_INSTRUMENT_FIELDS : SINGLE_INSTRUMENT_FIELDS} showPlayerMode />
    );
};

const following = (a: Node, b: Node) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe('自訂 panel opens in place', () => {
    it('renders inside the genre section, between the genre strip and the tempo section', () => {
        render(<Harness initial={{}} />);
        expect(screen.queryByTestId('custom-panel')).not.toBeInTheDocument();

        const strip = screen.getByRole('group', { name: '曲風' });
        const customTile = within(strip).getByText('自訂').closest('button')!;
        fireEvent.click(customTile);

        const panel = screen.getByTestId('custom-panel');
        expect(strip.closest('section')).toContainElement(panel);
        expect(following(strip, panel)).toBe(true);
        expect(following(panel, screen.getByText('節奏與調性'))).toBe(true);
        expect(latest.genre).toBe(CUSTOM_GENRE_ID);
        // The tile that was tapped is the same DOM node, now marked selected.
        expect(within(strip).getByText('自訂').closest('button')).toBe(customTile);
        expect(customTile).toHaveAttribute('aria-pressed', 'true');
    });

    it('closes again when a real genre is picked', () => {
        render(<Harness initial={{ genre: CUSTOM_GENRE_ID }} />);
        fireEvent.click(within(screen.getByRole('group', { name: '曲風' })).getByText(GENRES[0].nameZh).closest('button')!);
        expect(screen.queryByTestId('custom-panel')).not.toBeInTheDocument();
        expect(latest.genre).toBe(GENRES[0].id);
    });
});

describe('全部曲風 bottom sheet', () => {
    it('renders its list only while open and applies the picked genre like a tile would', () => {
        render(<Harness initial={{}} />);
        expect(screen.queryByRole('listbox', { name: '曲風' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '全部曲風' }));
        const list = screen.getByRole('listbox', { name: '曲風' });
        const tango = GENRES.find((g) => g.id === 'tango')!;
        fireEvent.click(within(list).getByText(tango.nameZh).closest('button')!);

        expect(latest.genre).toBe('tango');
        expect(latest.bpm).toBe(getBpmMidpoint(tango.bpmRange));
        expect(latest.melodyPattern).toBeDefined();
        expect(screen.queryByRole('listbox', { name: '曲風' })).not.toBeInTheDocument();
        // …and the strip's tango tile now shows as selected.
        expect(within(screen.getByRole('group', { name: '曲風' })).getByText(tango.nameZh).closest('button'))
            .toHaveAttribute('aria-pressed', 'true');
    });

    it('is not offered in the compact editor, which keeps its genre <select>', () => {
        render(<Harness initial={{}} variant="compact" />);
        expect(screen.queryByRole('button', { name: '全部曲風' })).not.toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: '曲風' })).toBeInTheDocument();
    });
});

describe('BPM stepper', () => {
    const waltz = GENRES.find((g) => g.id === 'waltz')!;
    const [lo, hi] = waltz.bpmRange;

    it('steps by one and stops at the genre range', () => {
        render(<Harness initial={{ genre: 'waltz', bpm: hi }} />);
        expect(screen.getByRole('button', { name: 'BPM 加 1' })).toBeDisabled();
        fireEvent.click(screen.getByRole('button', { name: 'BPM 減 1' }));
        expect(latest.bpm).toBe(hi - 1);
        fireEvent.click(screen.getByRole('button', { name: 'BPM 加 1' }));
        expect(latest.bpm).toBe(hi);
    });

    it('lets a value be typed through out-of-range intermediates and clamps on blur', () => {
        render(<Harness initial={{ genre: 'waltz', bpm: 95 }} />);
        const input = screen.getByRole('spinbutton', { name: 'BPM' });
        fireEvent.change(input, { target: { value: '9' } });   // on the way to "95…"
        expect(input).toHaveValue(9);                          // not snapped to 80 mid-typing
        expect(latest.bpm).toBe(95);
        fireEvent.change(input, { target: { value: '500' } });
        fireEvent.blur(input);
        expect(latest.bpm).toBe(hi);
        fireEvent.change(input, { target: { value: '3' } });
        fireEvent.blur(input);
        expect(latest.bpm).toBe(lo);
    });

    it('offers 最慢 / 建議 / 最快 chips for the range', () => {
        render(<Harness initial={{ genre: 'waltz', bpm: 95 }} />);
        fireEvent.click(screen.getByRole('button', { name: `最快 ${hi}` }));
        expect(latest.bpm).toBe(hi);
        fireEvent.click(screen.getByRole('button', { name: `建議 ${getBpmMidpoint(waltz.bpmRange)}` }));
        expect(latest.bpm).toBe(getBpmMidpoint(waltz.bpmRange));
    });

    it('clampBpm clamps both ends', () => {
        expect(clampBpm(10, 30, 200)).toBe(30);
        expect(clampBpm(250, 30, 200)).toBe(200);
        expect(clampBpm(90, 30, 200)).toBe(90);
    });
});

describe('dual-mode instruments', () => {
    it('splits the six parts into 第一人 / 第二人 tabs without remounting the hidden list', () => {
        render(<Harness initial={{ playerMode: 'dual' }} dual />);
        // The inactive list is mounted but hidden (so it is out of the a11y tree).
        const second = screen.getByRole('combobox', { name: '第二人 高音部', hidden: true });
        expect(screen.queryByRole('combobox', { name: '第二人 高音部' })).not.toBeInTheDocument();
        expect(second.closest('[role=tabpanel]')).toHaveAttribute('hidden');
        fireEvent.click(screen.getByRole('tab', { name: '第二人' }));
        expect(screen.getByRole('combobox', { name: '第二人 高音部' })).toBe(second);
        expect(second.closest('[role=tabpanel]')).not.toHaveAttribute('hidden');
        fireEvent.change(second, { target: { value: 'guitar' } });
        expect(latest.second_p1).toBe('guitar');
    });
});

describe('summarizeCompositionParams (sticky 開始分析 bar)', () => {
    it('recaps genre, tempo, key, mode and type', () => {
        expect(summarizeCompositionParams({ genre: 'waltz', bpm: 95 }, { showPlayerMode: true }))
            .toBe('華爾滋 · 95 BPM · C 大調 · 單人 · 情緒');
    });

    it('names the melody in 自訂 mode and clamps BPM like the form does', () => {
        expect(summarizeCompositionParams({
            genre: CUSTOM_GENRE_ID, melodyPattern: 2, bpm: 999, keyType: 'minor', keyCenter: 'E',
            playerMode: 'dual', musicType: 'spiritual',
        }, { showPlayerMode: true })).toBe('自訂 · 主旋律 2 · 200 BPM · E 小調 · 雙人 · 心靈');
    });

    it('says so when no genre is chosen yet', () => {
        expect(summarizeCompositionParams({})).toBe('尚未選擇曲風 · 60 BPM · C 大調 · 情緒');
    });
});
