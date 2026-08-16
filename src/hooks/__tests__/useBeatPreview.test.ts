import { GENRES, GENRE_BEAT_MAP, getBpmMidpoint } from '../../config/musicCreativeConstants';
import { BEAT_PRESETS, convertPresetToDrumLooperPattern } from '../../utils/beatPresets';

// The preview synthesises locally from BEAT_PRESETS, so a genre whose mapped
// beat is missing or unconvertible would simply do nothing when clicked —
// silently, since the preview deliberately swallows its own failures.
describe.each(GENRES.map((g) => [g.id, g.nameZh]))('preview for %s (%s)', (genreId) => {
    it('maps to a beat preset that exists', () => {
        const beat = BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[genreId as string]);
        expect(beat).toBeDefined();
    });

    it('produces a playable pattern with at least one hit', () => {
        const genre = GENRES.find((g) => g.id === genreId)!;
        const beat = BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[genreId as string])!;
        const pattern = convertPresetToDrumLooperPattern(beat, getBpmMidpoint(genre.bpmRange));

        expect(pattern).not.toBeNull();
        expect(pattern!.pattern.length).toBeGreaterThan(0);
        expect(pattern!.beatsPerMeasure).toBeGreaterThan(0);
    });

    it('previews at a tempo inside the genre range', () => {
        const genre = GENRES.find((g) => g.id === genreId)!;
        const bpm = getBpmMidpoint(genre.bpmRange);
        expect(bpm).toBeGreaterThanOrEqual(genre.bpmRange[0]);
        expect(bpm).toBeLessThanOrEqual(genre.bpmRange[1]);
    });
});
