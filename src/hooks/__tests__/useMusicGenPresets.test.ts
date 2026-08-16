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
        isNew: true, hasAccompaniment: true, previewUrl: '/api/v1/assets/preview/reggae',
    }],
    ['samba', {
        name: 'samba', displayName: '森巴 Samba', credit: '漢克呂',
        isNew: true, hasAccompaniment: true, previewUrl: '/api/v1/assets/preview/samba',
    }],
    ['basic_pop', {
        name: 'basic_pop', displayName: null, credit: null,
        isNew: false, hasAccompaniment: false, previewUrl: '/api/v1/assets/preview/basic_pop',
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

describe('genre cards', () => {
    // Choosing a genre also chooses the rhythm it maps to, so the credit shown
    // on a genre card comes from that rhythm — not from the genre itself.
    const beatFor: Record<string, string> = {
        reggae: 'reggae', waltz: 'waltz', blues: 'jazz', giliba: 'pop',
    };

    it('credits the rhythm a genre maps to', () => {
        expect(presetForBeat(presets, beatFor.reggae)?.credit).toBe('漢克呂');
    });

    it('leaves genres whose rhythm has no credit unmarked', () => {
        expect(presetForBeat(presets, beatFor.giliba)?.credit).toBeNull();
        expect(presetForBeat(presets, beatFor.waltz)).toBeUndefined();
    });
});

describe('rhythms with no matching genre', () => {
    it('samba is credited even though no genre maps to it', () => {
        // The upstream genre enum has no samba, so it is only reachable through
        // an explicit rhythm choice — and must still show its credit there.
        expect(presetForBeat(presets, 'samba')?.credit).toBe('漢克呂');
        expect(presetForBeat(presets, 'samba')?.isNew).toBe(true);
    });

    it('labels samba with the NEW marker', () => {
        expect(beatOptionLabel(presets, beat('samba', '森巴', 'Samba')))
            .toBe('森巴 (Samba) ‧ NEW');
    });
});
