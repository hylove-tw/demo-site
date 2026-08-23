import {
    GENRES,
    GENRE_BEAT_MAP,
    RHYTHM_ONLY_STYLES,
    SAFE_ARRANGED_MELODIES,
    getBpmMidpoint,
} from '../musicCreativeConstants';
import { defaultMelodyFor, safeMelodiesFor } from '../../components/CompositionParamsForm';
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

// music-gen verified these against real requests on 2026-08-23: picking one of
// these melodies makes _resolve_preset_or_fallback() silently swap the
// musician's arranged preset for a generic one, because the melody's time
// signature doesn't match what the preset declares. Encoded here as data so
// the two repos can't drift the way GENRE_BEAT_MAP/BEAT_TO_PRESET's spelling
// once did — this list changing on the backend without this test noticing is
// exactly that failure shape again, just for a range instead of a string.
const KNOWN_UNSAFE_MELODIES: Record<string, number[]> = {
    reggae: [9],
    disco: [9],
    samba: [3, 4, 6, 7, 8],
    bossa_nova: [3, 4, 6, 7, 8],
};

describe('safe-melody / arranged-preset protection', () => {
    it.each(Object.entries(KNOWN_UNSAFE_MELODIES))(
        '%s: the safe list excludes every melody musicgen found unsafe', (id, unsafe) => {
            const style = RHYTHM_ONLY_STYLES.find((s) => s.id === id);
            const safe = style?.safeMelodies ?? SAFE_ARRANGED_MELODIES[id];
            expect(safe).toBeDefined();
            for (const melody of unsafe) {
                expect(safe!.has(melody)).toBe(false);
            }
        });

    it.each(['reggae', 'disco'])(
        "%s's default melody (no manual override) is in its own safe list", (genreId) => {
            const safe = SAFE_ARRANGED_MELODIES[genreId];
            expect(safe.has(defaultMelodyFor(genreId)!)).toBe(true);
        });

    it.each(RHYTHM_ONLY_STYLES.map((s) => [s.id, s.nameZh]))(
        "%s (%s)'s default melody (via its chacha baseGenre) is in its own safe list", (id) => {
            const style = RHYTHM_ONLY_STYLES.find((s) => s.id === id)!;
            const chachaDefault = defaultMelodyFor(style.baseGenre);
            expect(style.safeMelodies?.has(chachaDefault!)).toBe(true);
        });

    it('samba/bossa_nova draw their safe list from safeMelodiesFor, not chacha directly', () => {
        // chacha itself is intentionally unrestricted (GENRE_MELODY_COMPATIBILITY
        // has no melody chacha rejects) — RHYTHM_ONLY_STYLES borrowing that as
        // their compatibility set is exactly what caused this bug, so the fix
        // must come from each style's own safeMelodies, not from chacha's set.
        const samba = RHYTHM_ONLY_STYLES.find((s) => s.id === 'samba')!;
        expect(safeMelodiesFor('chacha', undefined)).toBeUndefined();
        expect(safeMelodiesFor(undefined, samba)).toEqual(samba.safeMelodies);
    });
});
