// src/hooks/useBeatPreview.ts
//
// Plays a genre's rhythm while the user is choosing, so the choice can be made
// by ear rather than by reading a name and a notated bar.
//
// The clip comes from music-gen, pre-rendered: the same drum part and the same
// accompaniment the pipeline produces, through the same synthesiser. An earlier
// version synthesised the drum pattern locally, which answered "what is the
// pattern" but left out the accompaniment the musician wrote — and that is most
// of what makes samba sound unlike reggae.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMusicGenPresets, presetForBeat } from './useMusicGenPresets';
import { GENRE_BEAT_MAP } from '../config/musicCreativeConstants';

const MUSIC_GEN_URL = (process.env.REACT_APP_MUSIC_GEN_URL || '').replace(/\/$/, '');

export interface BeatPreview {
    /** Genre id currently sounding, or null. */
    playing: string | null;
    /** Start the genre's clip; calling with the one already playing stops it. */
    toggle: (genreId: string) => void;
    stop: () => void;
    /** Genre id whose clip is still loading. */
    loading: string | null;
    /** True when a genre has a clip to play at all. */
    canPreview: (genreId: string) => boolean;
}

export function useBeatPreview(): BeatPreview {
    const presets = useMusicGenPresets();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const previewUrl = useCallback((genreId: string): string | null => {
        const preset = presetForBeat(presets, GENRE_BEAT_MAP[genreId]);
        if (!preset?.previewUrl) return null;
        return `${MUSIC_GEN_URL}${preset.previewUrl}`;
    }, [presets]);

    const stop = useCallback(() => {
        audioRef.current?.pause();
        setPlaying(null);
        setLoading(null);
    }, []);

    const toggle = useCallback((genreId: string) => {
        if (playing === genreId) {
            stop();
            return;
        }
        const url = previewUrl(genreId);
        if (!url) return;

        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        audio.pause();
        audio.loop = true;          // a few bars is easier to judge looping
        audio.src = url;
        setLoading(genreId);

        audio.oncanplay = () => setLoading((current) => (current === genreId ? null : current));
        audio.onplaying = () => { setPlaying(genreId); setLoading(null); };
        audio.onerror = () => { setPlaying(null); setLoading(null); };
        audio.onpause = () => setPlaying((current) => (current === genreId ? null : current));

        // A preview is a convenience; a browser that blocks playback must not
        // interfere with choosing a genre.
        audio.play().catch(() => { setPlaying(null); setLoading(null); });
    }, [playing, previewUrl, stop]);

    const canPreview = useCallback(
        (genreId: string) => previewUrl(genreId) !== null, [previewUrl]);

    useEffect(() => () => { audioRef.current?.pause(); }, []);

    return { playing, toggle, stop, loading, canPreview };
}
