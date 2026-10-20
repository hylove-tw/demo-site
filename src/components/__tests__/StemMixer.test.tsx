// Regression test for a Safari-only silent-playback bug: pressing 播放
// visibly worked (button flipped to pause, progress bar advanced normally)
// but no audio ever reached the speaker. Root cause was that `ensureCtx()`
// (which lazily does `new AudioContext()`) was only reached deep inside the
// stem-loading chain, after an `await fetch(...)` — Safari only credits an
// AudioContext to the triggering user gesture when it is created/resumed
// *synchronously* within that gesture's call stack; a context created a
// microtask or more later still reports `state: 'running'` and advances
// `currentTime` normally, but never actually routes audio to the output
// device. Chrome/Firefox are lenient about this timing, which is why the
// bug went unnoticed until tested in Safari.
//
// jsdom doesn't implement AudioContext at all, so this test can't observe
// "does sound come out" directly — but it can observe the one thing that
// actually matters for Safari's unlock rule: does AudioContext get
// constructed synchronously within the click, before the pending stem fetch
// has any chance to resolve.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StemMixer } from '../StemMixer';
import { MUSIC_GEN_URL } from '../../config/apiBase';

describe('StemMixer Safari audio unlock', () => {
    let audioContextMock: jest.Mock;
    let resumeMock: jest.Mock;
    let originalAudioContext: unknown;
    let originalFetch: unknown;

    beforeEach(() => {
        resumeMock = jest.fn();
        audioContextMock = jest.fn().mockImplementation(() => ({
            state: 'suspended',
            resume: resumeMock,
            close: jest.fn(),
            currentTime: 0,
            createGain: () => ({ gain: { value: 0, setTargetAtTime: jest.fn() }, connect: jest.fn() }),
            destination: {},
        }));
        originalAudioContext = (global as any).AudioContext;
        (global as any).AudioContext = audioContextMock;

        originalFetch = global.fetch;
        // Never resolves: if AudioContext creation only happens after this
        // fetch settles, this test will observe it never happening at all.
        global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    });

    afterEach(() => {
        (global as any).AudioContext = originalAudioContext;
        global.fetch = originalFetch as typeof fetch;
    });

    it('creates the AudioContext synchronously within the play click, not after the stem fetch resolves', () => {
        render(<StemMixer stemUrls={{ p1: '/p1.mp3' }} onDownload={jest.fn()} />);

        expect(audioContextMock).not.toHaveBeenCalled();
        fireEvent.click(screen.getByTitle('播放'));

        expect(audioContextMock).toHaveBeenCalledTimes(1);
        expect(resumeMock).toHaveBeenCalledTimes(1);
    });
});

describe('StemMixer music-gen URLs', () => {
    const stemUrl = `${MUSIC_GEN_URL}/api/v1/stems/task-1/p1`;
    let originalAudioContext: unknown;
    let originalFetch: unknown;

    beforeEach(() => {
        originalAudioContext = (global as any).AudioContext;
        (global as any).AudioContext = jest.fn().mockImplementation(() => ({
            state: 'running',
            resume: jest.fn(),
            close: jest.fn(),
            currentTime: 0,
            destination: {},
            createGain: () => ({ gain: { value: 0, setTargetAtTime: jest.fn() }, connect: jest.fn() }),
            decodeAudioData: jest.fn(async () => ({ duration: 1.5 })),
        }));
        originalFetch = global.fetch;
        global.fetch = jest.fn(async () => ({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(8),
        })) as unknown as typeof fetch;
    });

    afterEach(() => {
        (global as any).AudioContext = originalAudioContext;
        global.fetch = originalFetch as typeof fetch;
    });

    it('fetches stems and optional assets with a single /api/music-gen prefix', async () => {
        expect(MUSIC_GEN_URL).toBe('/api/music-gen');
        render(
            <StemMixer
                stemUrls={{ p1: stemUrl }}
                availableBrainwaves={[{ value: '7.83', label: '舒曼波' }]}
                availableBackgrounds={[{ value: 'ocean', label: '海浪' }]}
                onDownload={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /腦波/ }));
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(stemUrl);
            expect(global.fetch).toHaveBeenCalledWith(`${MUSIC_GEN_URL}/api/v1/assets/brainwave/7.83`);
        });

        fireEvent.click(screen.getByRole('button', { name: /自然音效/ }));
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(`${MUSIC_GEN_URL}/api/v1/assets/background/ocean`);
        });

        const urls = (global.fetch as jest.Mock).mock.calls.map((call) => String(call[0]));
        expect(urls).toEqual([
            '/api/music-gen/api/v1/stems/task-1/p1',
            '/api/music-gen/api/v1/assets/brainwave/7.83',
            '/api/music-gen/api/v1/assets/background/ocean',
        ]);
        for (const url of urls) {
            expect(url.match(/\/api\/music-gen/g)).toHaveLength(1);
        }
    });
});
