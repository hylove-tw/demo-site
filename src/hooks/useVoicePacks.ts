// src/hooks/useVoicePacks.ts
//
// Loads the server's selectable voice packs (synthesised soundfonts) for the
// picker. Degrades silently to an empty list on an unreachable music-gen or
// a build predating this feature — see fetchVoicePacks.

import { useEffect, useState } from 'react';
import { fetchVoicePacks, VoicePack } from '../services/musicGenService';

export function useVoicePacks(): VoicePack[] {
    const [packs, setPacks] = useState<VoicePack[]>([]);

    useEffect(() => {
        let active = true;
        fetchVoicePacks().then((loaded) => {
            if (active) setPacks(loaded);
        });
        return () => { active = false; };
    }, []);

    return packs;
}
