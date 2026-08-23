// Previously every genre defaulted to the same flute/piano/cello combo
// (INSTRUMENT_DEFAULTS in CompositionParamsForm.tsx) regardless of which
// genre was picked — picking 探戈 vs 搖滾 vs 鄉村 made no difference to the
// instrument picker. Genre.defaultInstruments/RhythmOnlyStyle.defaultInstruments
// now carry each style's researched classic ensemble; applyGenre/
// applyRhythmStyle write it onto p1/p2/p3 (or both players' fields in dual
// mode) the same way they already settle bpm/melodyPattern.
import { applyGenre, applyRhythmStyle, INSTRUMENTS } from '../CompositionParamsForm';
import { GENRES, RHYTHM_ONLY_STYLES } from '../../config/musicCreativeConstants';

const INSTRUMENT_VALUES = new Set(INSTRUMENTS.map((i) => i.value));

describe('genre-specific instrument defaults', () => {
    it('every genre only recommends instruments actually offered by the picker', () => {
        for (const genre of GENRES) {
            for (const slot of ['p1', 'p2', 'p3'] as const) {
                expect(INSTRUMENT_VALUES.has(genre.defaultInstruments[slot])).toBe(true);
            }
        }
        for (const style of RHYTHM_ONLY_STYLES) {
            for (const slot of ['p1', 'p2', 'p3'] as const) {
                expect(INSTRUMENT_VALUES.has(style.defaultInstruments[slot])).toBe(true);
            }
        }
    });

    it('applyGenre sets p1/p2/p3 from the genre, not a flat fallback', () => {
        const tango = GENRES.find((g) => g.id === 'tango')!;
        const result = applyGenre({}, 'tango');
        expect(result.p1).toBe(tango.defaultInstruments.p1);
        expect(result.p2).toBe(tango.defaultInstruments.p2);
        expect(result.p3).toBe(tango.defaultInstruments.p3);
    });

    it('different genres recommend different instruments (not the same flat default)', () => {
        const tango = applyGenre({}, 'tango');
        const rock = applyGenre({}, 'rock');
        // At least one slot must differ, or this whole feature is a no-op.
        expect([tango.p1, tango.p2, tango.p3]).not.toEqual([rock.p1, rock.p2, rock.p3]);
    });

    it('applyRhythmStyle uses the style\'s own instruments, not the borrowed genre\'s', () => {
        const samba = RHYTHM_ONLY_STYLES.find((s) => s.id === 'samba')!;
        const chacha = GENRES.find((g) => g.id === 'chacha')!;
        const result = applyRhythmStyle({}, samba);
        expect(result.p1).toBe(samba.defaultInstruments.p1);
        expect([result.p1, result.p2, result.p3]).not.toEqual(
            [chacha.defaultInstruments.p1, chacha.defaultInstruments.p2, chacha.defaultInstruments.p3]
        );
    });

    it('in dual mode, both players get the same genre-authentic instruments', () => {
        const result = applyGenre({ playerMode: 'dual' }, 'country');
        const country = GENRES.find((g) => g.id === 'country')!;
        expect(result.first_p1).toBe(country.defaultInstruments.p1);
        expect(result.second_p1).toBe(country.defaultInstruments.p1);
        expect(result.first_p3).toBe(country.defaultInstruments.p3);
        expect(result.second_p3).toBe(country.defaultInstruments.p3);
        // Single-player fields should not leak into dual mode's result.
        expect(result.p1).toBeUndefined();
    });
});
