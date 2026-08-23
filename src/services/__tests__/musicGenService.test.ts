// Voice pack wiring: GET /api/v1/voice-packs (fetchVoicePacks) and the
// voice_pack field it feeds into POST /api/v1/generate (exportMp3).
//
// MUSIC_GEN_URL is captured once at module import time from
// REACT_APP_MUSIC_GEN_URL, so each test reloads the module fresh via
// jest.resetModules() to control that gate.
export {};

const ORIGINAL_ENV = process.env.REACT_APP_MUSIC_GEN_URL;

function loadService(musicGenUrl: string | undefined) {
    jest.resetModules();
    if (musicGenUrl === undefined) {
        delete process.env.REACT_APP_MUSIC_GEN_URL;
    } else {
        process.env.REACT_APP_MUSIC_GEN_URL = musicGenUrl;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../musicGenService') as typeof import('../musicGenService');
}

afterEach(() => {
    jest.restoreAllMocks();
    if (ORIGINAL_ENV === undefined) delete process.env.REACT_APP_MUSIC_GEN_URL;
    else process.env.REACT_APP_MUSIC_GEN_URL = ORIGINAL_ENV;
});

describe('fetchVoicePacks', () => {
    it("normalises the default row's id: null to '' and maps the rest through", async () => {
        const service = loadService('http://music-gen.test');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [
                { id: null, display_name: '預設音色', preview_url: '/api/v1/assets/voice-pack-preview/default' },
                { id: 'generaluser-gs', display_name: 'GeneralUser GS', preview_url: '/api/v1/assets/voice-pack-preview/generaluser-gs' },
            ],
        }) as any;

        expect(await service.fetchVoicePacks()).toEqual([
            { id: '', displayName: '預設音色', previewUrl: '/api/v1/assets/voice-pack-preview/default' },
            { id: 'generaluser-gs', displayName: 'GeneralUser GS', previewUrl: '/api/v1/assets/voice-pack-preview/generaluser-gs' },
        ]);
    });

    it('falls back to the id, then a generic label, when display_name is missing', async () => {
        const service = loadService('http://music-gen.test');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [
                { id: 'raw-pack', preview_url: null },
                { id: null, preview_url: null },
            ],
        }) as any;

        expect(await service.fetchVoicePacks()).toEqual([
            { id: 'raw-pack', displayName: 'raw-pack', previewUrl: null },
            { id: '', displayName: '預設音色', previewUrl: null },
        ]);
    });

    it('degrades to an empty list without a network call when music-gen is not configured', async () => {
        const service = loadService(undefined);
        const fetchMock = jest.fn();
        global.fetch = fetchMock as any;

        expect(await service.fetchVoicePacks()).toEqual([]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('degrades to an empty list when the request fails, rather than throwing', async () => {
        const service = loadService('http://music-gen.test');
        global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

        expect(await service.fetchVoicePacks()).toEqual([]);
    });

    it('caches the result for the page lifetime', async () => {
        const service = loadService('http://music-gen.test');
        const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
        global.fetch = fetchMock as any;

        await service.fetchVoicePacks();
        await service.fetchVoicePacks();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

// exportMp3 kicks off a real generate-and-poll cycle; fake timers keep the
// poll loop's 2s wait from ever firing so these tests only need to observe
// the single /generate call and its payload, not run the export to completion.
describe('exportMp3 voice_pack payload', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('sends voice_pack when a pack is chosen', () => {
        const service = loadService('http://music-gen.test');
        const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ task_id: 't1' }) });
        global.fetch = fetchMock as any;

        service.exportMp3(
            { beforeBrainData: {}, afterBrainData: {}, voicePack: 'generaluser-gs' },
            jest.fn(),
        ).catch(() => { /* the export is left mid-flight on purpose; see comment above */ });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [, init] = fetchMock.mock.calls[0];
        expect(JSON.parse(init.body).voice_pack).toBe('generaluser-gs');
    });

    it('omits voice_pack entirely when nothing is chosen — unchanged from before this feature', () => {
        const service = loadService('http://music-gen.test');
        const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ task_id: 't1' }) });
        global.fetch = fetchMock as any;

        service.exportMp3(
            { beforeBrainData: {}, afterBrainData: {} },
            jest.fn(),
        ).catch(() => { /* the export is left mid-flight on purpose; see comment above */ });

        const [, init] = fetchMock.mock.calls[0];
        expect('voice_pack' in JSON.parse(init.body)).toBe(false);
    });
});
