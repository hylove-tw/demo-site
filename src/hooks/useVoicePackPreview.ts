// src/hooks/useVoicePackPreview.ts
//
// Plays a fixed demo phrase rendered with a given voice pack, so the choice
// between soundfonts can be made by ear.
//
// Unlike useBeatPreview.ts, there is no indirection through a genre/beat map
// here: each VoicePack already carries its own previewUrl straight from
// GET /api/v1/voice-packs, keyed by the pack's own id (the default pack's
// id is '' — see VoicePack in musicGenService.ts).

import { useCallback, useEffect, useRef, useState } from 'react';
import { VoicePack } from '../services/musicGenService';

const MUSIC_GEN_URL = (process.env.REACT_APP_MUSIC_GEN_URL || '').replace(/\/$/, '');

export interface VoicePackPreview {
    /** Voice pack id currently sounding, or null. */
    playing: string | null;
    /** Start the clip for a pack; the one playing stops it. */
    toggle: (pack: VoicePack) => void;
    stop: () => void;
    /** Voice pack id whose clip is still loading. */
    loading: string | null;
    /** True when a pack has a clip to play at all. */
    canPreview: (pack: VoicePack) => boolean;
}

export function useVoicePackPreview(): VoicePackPreview {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const stop = useCallback(() => {
        audioRef.current?.pause();
        setPlaying(null);
        setLoading(null);
    }, []);

    const toggle = useCallback((pack: VoicePack) => {
        const key = pack.id;
        if (playing === key) {
            stop();
            return;
        }
        if (!pack.previewUrl) return;
        const url = `${MUSIC_GEN_URL}${pack.previewUrl}`;

        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        audio.pause();
        audio.loop = true;          // a fixed phrase is easier to judge looping
        audio.src = url;
        setLoading(key);

        audio.oncanplay = () => setLoading((current) => (current === key ? null : current));
        audio.onplaying = () => { setPlaying(key); setLoading(null); };
        audio.onerror = () => { setPlaying(null); setLoading(null); };
        audio.onpause = () => setPlaying((current) => (current === key ? null : current));

        // A preview is a convenience; a browser that blocks playback must not
        // interfere with choosing a voice pack.
        audio.play().catch(() => { setPlaying(null); setLoading(null); });
    }, [playing, stop]);

    const canPreview = useCallback((pack: VoicePack) => Boolean(pack.previewUrl), []);

    useEffect(() => () => { audioRef.current?.pause(); }, []);

    return { playing, toggle, stop, loading, canPreview };
}
