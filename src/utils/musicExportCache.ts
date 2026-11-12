// src/utils/musicExportCache.ts
//
// Remembers which music-gen task produced a given report's MP3, so
// refreshing the report page can reuse it (via fetchCachedExportState — a
// single cheap GET) instead of resynthesizing from scratch every time. Keyed
// by the analysis history record's own id: that's stable across refreshes
// and known before any task exists, unlike the task id itself.
//
// Deliberately only caches the report's original, page-load generation
// (see the `!config` check at the call sites) — edits made in the report
// editor aren't persisted back to the history record today, so a refresh
// already reverts to the original params regardless; caching only that one
// generation keeps the cache trivially correct without having to reason
// about invalidating it when params change.

const STORAGE_KEY = 'musicGenTaskCache';

function readAll(storageKey = STORAGE_KEY): Record<string, string> {
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function readCachedTaskId(reportKey: string, remapMelody = false): string | undefined {
    return readAll(remapMelody ? `${STORAGE_KEY}:remap` : STORAGE_KEY)[reportKey];
}

export function writeCachedTaskId(reportKey: string, taskId: string, remapMelody = false): void {
    try {
        const storageKey = remapMelody ? `${STORAGE_KEY}:remap` : STORAGE_KEY;
        const all = readAll(storageKey);
        all[reportKey] = taskId;
        localStorage.setItem(storageKey, JSON.stringify(all));
    } catch {
        // Best-effort — a failed cache write shouldn't break the export itself.
    }
}
