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
import { render, screen, fireEvent } from '@testing-library/react';
import { StemMixer } from '../StemMixer';

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
