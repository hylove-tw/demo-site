// src/utils/lastVoicePackCache.ts
//
// Remembers the last voice pack the user explicitly picked, so the next
// composition form defaults to it instead of always starting back at the
// server's own default. Purely a picker convenience: it never writes into
// a report's params on its own, and the user still has to apply/regenerate
// for a choice to take effect either way.

const STORAGE_KEY = 'lastVoicePack';

export function readLastVoicePack(): string | undefined {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? undefined;
    } catch {
        return undefined;
    }
}

export function writeLastVoicePack(voicePackId: string): void {
    try {
        localStorage.setItem(STORAGE_KEY, voicePackId);
    } catch {
        // Best-effort — a failed cache write shouldn't break selection itself.
    }
}
