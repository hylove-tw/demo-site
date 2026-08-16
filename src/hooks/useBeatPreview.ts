// src/hooks/useBeatPreview.ts
//
// Plays a genre's rhythm while the user is choosing, so the choice can be made
// by ear rather than by reading a name and a notated bar.
//
// Entirely local: DrumLooper synthesises the pattern from BEAT_PRESETS in the
// browser, so previewing costs no generation and no round trip. It is the drum
// part only — the accompaniment needs a key and a melody, neither of which
// exists yet at this point in the form.

import { useCallback, useEffect, useRef, useState } from 'react';
import { DrumLooper } from '../utils/drumLooper';
import {
    BEAT_PRESETS,
    convertPresetToDrumLooperPattern,
} from '../utils/beatPresets';
import { GENRE_BEAT_MAP, GENRES, getBpmMidpoint } from '../config/musicCreativeConstants';

export interface BeatPreview {
    /** Genre id currently sounding, or null. */
    playing: string | null;
    /** Start the genre's rhythm; calling with the one already playing stops it. */
    toggle: (genreId: string) => void;
    stop: () => void;
    /** True while the sound font for a preview is still loading. */
    loading: string | null;
}

export function useBeatPreview(): BeatPreview {
    const looperRef = useRef<DrumLooper | null>(null);
    const [playing, setPlaying] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    // Guards against a slow sound-font load finishing after the user has moved
    // on, which would otherwise start a preview they no longer asked for.
    const requestRef = useRef(0);

    const stop = useCallback(() => {
        requestRef.current += 1;
        looperRef.current?.stop();
        setPlaying(null);
        setLoading(null);
    }, []);

    const toggle = useCallback((genreId: string) => {
        if (playing === genreId) {
            stop();
            return;
        }

        const beat = BEAT_PRESETS.find((b) => b.id === GENRE_BEAT_MAP[genreId]);
        const genre = GENRES.find((g) => g.id === genreId);
        if (!beat || beat.id === 'none' || !genre) return;

        const bpm = getBpmMidpoint(genre.bpmRange);
        const pattern = convertPresetToDrumLooperPattern(beat, bpm);
        if (!pattern) return;

        const request = ++requestRef.current;
        looperRef.current?.stop();
        setLoading(genreId);

        (async () => {
            try {
                if (!looperRef.current) looperRef.current = new DrumLooper();
                await looperRef.current.init(80);
                await looperRef.current.setPattern(pattern.pattern, bpm, pattern.beatsPerMeasure);
                if (request !== requestRef.current) return;   // superseded
                looperRef.current.play();
                setPlaying(genreId);
            } catch {
                // Preview is a convenience; a browser that blocks audio or a
                // font that fails to load must not break choosing a genre.
                setPlaying(null);
            } finally {
                if (request === requestRef.current) setLoading(null);
            }
        })();
    }, [playing, stop]);

    useEffect(() => () => { looperRef.current?.stop(); }, []);

    return { playing, toggle, stop, loading };
}
