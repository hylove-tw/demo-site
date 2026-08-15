import {
    beatCredit,
    beatOptionLabel,
    presetForBeat,
} from '../useMusicGenPresets';
import type { MusicGenPreset } from '../../services/musicGenService';

// Exactly what GET /api/v1/presets returns for these two, after the service
// maps it into camelCase.
const presets = new Map<string, MusicGenPreset>([
    ['reggae', {
        name: 'reggae', displayName: '雷鬼 Reggae', credit: '漢克呂',
        isNew: true, hasAccompaniment: true,
    }],
    ['samba', {
        name: 'samba', displayName: '森巴 Samba', credit: '漢克呂',
        isNew: true, hasAccompaniment: true,
    }],
    ['basic_pop', {
        name: 'basic_pop', displayName: null, credit: null,
        isNew: false, hasAccompaniment: false,
    }],
]);

const beat = (id: string, name: string, nameEn: string) => ({ id, name, nameEn });

describe('presetForBeat', () => {
    it('resolves a beat id through to the server preset backing it', () => {
        expect(presetForBeat(presets, 'reggae')?.name).toBe('reggae');
        expect(presetForBeat(presets, 'samba')?.name).toBe('samba');
    });

    it('maps beats that share a server preset', () => {
        // pop and rock both render with basic_pop.
        expect(presetForBeat(presets, 'pop')?.name).toBe('basic_pop');
        expect(presetForBeat(presets, 'rock')?.name).toBe('basic_pop');
    });

    it('treats "no rhythm" as having no preset', () => {
        expect(presetForBeat(presets, 'none')).toBeUndefined();
        expect(presetForBeat(presets, undefined)).toBeUndefined();
    });
});

describe('beatOptionLabel', () => {
    it('marks a newly added groove', () => {
        expect(beatOptionLabel(presets, beat('reggae', '雷鬼', 'Reggae')))
            .toBe('雷鬼 (Reggae) ‧ NEW');
    });

    it('leaves established grooves unmarked', () => {
        expect(beatOptionLabel(presets, beat('pop', '流行', 'Pop')))
            .toBe('流行 (Pop)');
    });

    it('omits the English name for "no rhythm"', () => {
        expect(beatOptionLabel(presets, beat('none', '無節奏', 'None')))
            .toBe('無節奏');
    });

    it('degrades to a plain label when music-gen is unreachable', () => {
        // An empty map is what fetchMusicGenPresets resolves to on failure; the
        // picker must still be usable, just unbadged.
        expect(beatOptionLabel(new Map(), beat('reggae', '雷鬼', 'Reggae')))
            .toBe('雷鬼 (Reggae)');
    });
});

describe('beatCredit', () => {
    it('names the arranger the server credits', () => {
        expect(beatCredit(presets, 'reggae')).toBe('節奏由 漢克呂 調校');
        expect(beatCredit(presets, 'samba')).toBe('節奏由 漢克呂 調校');
    });

    it('returns null when nobody is credited', () => {
        expect(beatCredit(presets, 'pop')).toBeNull();
        expect(beatCredit(presets, 'none')).toBeNull();
        expect(beatCredit(new Map(), 'reggae')).toBeNull();
    });
});
