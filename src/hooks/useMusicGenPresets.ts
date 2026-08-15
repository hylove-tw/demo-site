// src/hooks/useMusicGenPresets.ts
//
// Decorates the rhythm picker with metadata that music-gen owns: which grooves
// are newly added, and who arranged them.
//
// Those facts live in the music-gen preset YAML rather than being repeated
// here, so adding a style or crediting a different arranger is a change in one
// repository, not two. The hook degrades silently — an unreachable music-gen,
// or a build that predates the fields, simply yields an unbadged picker.

import { useEffect, useState } from 'react';
import {
    fetchMusicGenPresets,
    MusicGenPreset,
    presetNameForBeat,
} from '../services/musicGenService';

export function useMusicGenPresets(): Map<string, MusicGenPreset> {
    const [presets, setPresets] = useState<Map<string, MusicGenPreset>>(new Map());

    useEffect(() => {
        let active = true;
        fetchMusicGenPresets().then((loaded) => {
            if (active) setPresets(loaded);
        });
        return () => { active = false; };
    }, []);

    return presets;
}

/** The server preset backing a beat id, or undefined when there is no match. */
export function presetForBeat(
    presets: Map<string, MusicGenPreset>,
    beatId: string | undefined,
): MusicGenPreset | undefined {
    if (!beatId || beatId === 'none') return undefined;
    return presets.get(presetNameForBeat(beatId));
}

/**
 * Option label for a beat, marked when the groove is newly added.
 *
 * The marker is part of the text because this is a native <select>, whose
 * <option> elements cannot carry styled children in any cross-browser way.
 */
export function beatOptionLabel(
    presets: Map<string, MusicGenPreset>,
    beat: { id: string; name: string; nameEn: string },
): string {
    const base = beat.id === 'none' ? beat.name : `${beat.name} (${beat.nameEn})`;
    return presetForBeat(presets, beat.id)?.isNew ? `${base} ‧ NEW` : base;
}

/** Credit line for a beat, or null when nobody is credited for it. */
export function beatCredit(
    presets: Map<string, MusicGenPreset>,
    beatId: string | undefined,
): string | null {
    const credit = presetForBeat(presets, beatId)?.credit;
    return credit ? `節奏由 ${credit} 調校` : null;
}
