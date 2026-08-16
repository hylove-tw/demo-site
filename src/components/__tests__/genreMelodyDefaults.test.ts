import { applyGenre, defaultMelodyFor } from '../CompositionParamsForm';
import {
    GENRES,
    GENRE_BEAT_MAP,
    MELODY_PATTERNS,
    getCompatibleMelodies,
} from '../../config/musicCreativeConstants';
import { BEAT_PRESETS } from '../../utils/beatPresets';

// Eight of the thirteen genres reject melody 1, which is what the export falls
// back to when none is set. With the melody picker tucked into the advanced
// section nobody sets it by hand, so choosing a genre has to settle it.
describe.each(GENRES.map((g) => g.id))('genre %s', (genreId) => {
    it('yields a melody the genre accepts', () => {
        const melody = defaultMelodyFor(genreId);
        expect(melody).toBeDefined();
        expect(getCompatibleMelodies(genreId).map((m) => m.id)).toContain(melody);
    });

    it('applyGenre never leaves the melody unset', () => {
        const result = applyGenre({}, genreId);
        expect(result.melodyPattern).toBeDefined();
        expect(getCompatibleMelodies(genreId).map((m) => m.id))
            .toContain(result.melodyPattern);
    });

    it('prefers a melody whose metre matches the rhythm, when one exists', () => {
        // Otherwise music-gen silently substitutes a different rhythm preset,
        // and the user hears drums they did not pick.
        const rhythmMetre = BEAT_PRESETS
            .find((b) => b.id === GENRE_BEAT_MAP[genreId])?.timeSignature;
        const compatible = getCompatibleMelodies(genreId);
        const hasMatch = compatible.some((m) => m.timeSignature === rhythmMetre);
        if (!hasMatch) return;

        const chosen = MELODY_PATTERNS.find((m) => m.id === defaultMelodyFor(genreId));
        expect(chosen?.timeSignature).toBe(rhythmMetre);
    });
});

describe('applyGenre', () => {
    it('settles the melody even when the old one was still compatible', () => {
        // blues accepts 1, 5 and 8, but the genre decides — otherwise re-picking
        // a genre would not be a way back from a custom combination.
        expect(applyGenre({ melodyPattern: 8 }, 'blues').melodyPattern)
            .toBe(defaultMelodyFor('blues'));
    });

    it('replaces an incompatible melody rather than clearing it', () => {
        // reggae accepts 2, 5, 9 — this is the combination that returned 422
        const result = applyGenre({ melodyPattern: 1 }, 'reggae');
        expect(result.melodyPattern).not.toBe(1);
        expect([2, 5, 9]).toContain(result.melodyPattern);
    });
});

describe('custom genre state', () => {
    // Picking a genre settles the melody; changing the melody afterwards means
    // the combination is the user's, not the genre's.
    it('a freshly chosen genre is not custom', () => {
        const result = applyGenre({}, 'reggae');
        expect(result.melodyPattern).toBe(defaultMelodyFor('reggae'));
    });

    it('re-picking the genre restores its default melody', () => {
        const custom = { genre: 'reggae', melodyPattern: 9 };
        expect(applyGenre(custom, 'reggae').melodyPattern)
            .toBe(defaultMelodyFor('reggae'));
    });

    it('every genre default is a melody that genre accepts', () => {
        // The whole point: no genre may hand the export a melody the upstream
        // will reject, which is what produced the 422 on reggae.
        for (const genre of GENRES) {
            const melody = defaultMelodyFor(genre.id);
            expect(getCompatibleMelodies(genre.id).map((m) => m.id)).toContain(melody);
        }
    });
});
