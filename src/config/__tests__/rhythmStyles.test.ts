import {
    GENRES,
    GENRE_BEAT_MAP,
    RHYTHM_ONLY_STYLES,
    getBpmMidpoint,
} from '../musicCreativeConstants';
import { BEAT_PRESETS } from '../../utils/beatPresets';
import { presetNameForBeat } from '../../services/musicGenService';

// Tempo is what the musician used to separate these two; he reported them as
// hard to tell apart, and said samba below 150 stops being samba.
describe('tempo separation', () => {
    const style = (id: string) => RHYTHM_ONLY_STYLES.find((s) => s.id === id)!;

    it('samba never goes below 150', () => {
        expect(style('samba').bpmRange[0]).toBeGreaterThanOrEqual(150);
    });

    it('bossa nova stays inside 100–150', () => {
        expect(style('bossa_nova').bpmRange).toEqual([100, 150]);
    });

    it('their ranges do not overlap', () => {
        expect(style('samba').bpmRange[0]).toBeGreaterThanOrEqual(
            style('bossa_nova').bpmRange[1]);
    });
});

describe.each(RHYTHM_ONLY_STYLES.map((s) => [s.id, s.nameZh]))(
    'rhythm-only style %s (%s)', (id) => {
        const style = RHYTHM_ONLY_STYLES.find((s) => s.id === id)!;

        it('maps to a beat preset that exists', () => {
            expect(BEAT_PRESETS.find((b) => b.id === style.beat)).toBeDefined();
        });

        it('resolves to a distinct server preset', () => {
            // A missed lookup here silently falls back to basic_pop, which is
            // how the bossa-nova beat went unused for months.
            expect(presetNameForBeat(style.beat)).not.toBe('basic_pop');
        });

        it('borrows a genre whose tempo the upstream does not cap', () => {
            // chacha is the only unrestricted one; anything else would reject
            // the tempo this style needs.
            expect(style.baseGenre).toBe('chacha');
        });

        it('has a midpoint inside its own range', () => {
            const mid = getBpmMidpoint(style.bpmRange);
            expect(mid).toBeGreaterThanOrEqual(style.bpmRange[0]);
            expect(mid).toBeLessThanOrEqual(style.bpmRange[1]);
        });
    });

describe('genre beat mapping', () => {
    it.each(GENRES.map((g) => [g.id, g.nameZh]))(
        '%s (%s) resolves to a real server preset', (genreId) => {
            const beat = GENRE_BEAT_MAP[genreId as string];
            expect(BEAT_PRESETS.find((b) => b.id === beat)).toBeDefined();
        });

    it('disco uses the disco rhythm, not the generic pop one', () => {
        expect(GENRE_BEAT_MAP.disco).toBe('disco');
        expect(presetNameForBeat('disco')).toBe('disco');
    });

    it('the bossanova beat reaches the bossa_nova preset', () => {
        // It was spelled 'bossa-nova' in the map and 'bossanova' in the presets,
        // so it resolved to basic_pop instead.
        expect(presetNameForBeat('bossanova')).toBe('bossa_nova');
    });
});
