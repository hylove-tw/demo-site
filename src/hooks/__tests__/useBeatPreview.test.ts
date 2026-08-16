import { GENRES, GENRE_BEAT_MAP } from '../../config/musicCreativeConstants';
import { presetForBeat } from '../useMusicGenPresets';
import { presetNameForBeat } from '../../services/musicGenService';
import type { MusicGenPreset } from '../../services/musicGenService';

// Previews are pre-rendered clips served by music-gen. What matters here is
// that every genre resolves through beat id to a *server preset name* that a
// clip can exist for — a genre that dead-ends gets no play button at all, and
// does so silently.
const preset = (name: string): MusicGenPreset => ({
    name, displayName: null, credit: null, isNew: false,
    hasAccompaniment: false, previewUrl: `/api/v1/assets/preview/${name}`,
});

// Keyed the way presetForBeat looks them up: by server preset name, not beat id.
const presets = new Map<string, MusicGenPreset>(
    Object.values(GENRE_BEAT_MAP)
        .map((beat) => presetNameForBeat(beat))
        .map((name) => [name, preset(name)]),
);

describe.each(GENRES.map((g) => [g.id, g.nameZh]))('%s (%s)', (genreId) => {
    it('maps to a rhythm', () => {
        expect(GENRE_BEAT_MAP[genreId as string]).toBeDefined();
    });

    it('resolves to a server preset that can carry a preview', () => {
        const found = presetForBeat(presets, GENRE_BEAT_MAP[genreId as string]);
        expect(found?.previewUrl).toMatch(/^\/api\/v1\/assets\/preview\//);
    });
});

describe('presets without a rendered clip', () => {
    it('reports no preview rather than a broken url', () => {
        const name = presetNameForBeat('pop');
        const empty = new Map<string, MusicGenPreset>([
            [name, { ...preset(name), previewUrl: null }],
        ]);
        expect(presetForBeat(empty, 'pop')?.previewUrl).toBeNull();
    });
});
