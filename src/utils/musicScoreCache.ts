// src/utils/musicScoreCache.ts
//
// Caches a rendered score's SVG pages, keyed by the music-gen task id that
// produced them. Unlike musicExportCache.ts (keyed by the report's own id,
// since a task id doesn't exist yet when that cache is first consulted),
// this one is keyed by task id directly: a given task's rendered score is
// immutable, so it's safe to reuse regardless of which report happens to
// reference it, with no separate invalidation logic needed — a fresh
// generation always gets a fresh task id, which simply misses this cache
// the first time and gets written once rendered.
//
// SVG pages can be sizable, so writes are best-effort: a full localStorage
// (shared with analysisHistory, this cache, and musicGenTaskCache) should
// degrade to "renders every time" here, not break anything.

const STORAGE_KEY = 'musicScorePagesCache';
// Small bound on entry count — this cache exists purely to skip a redundant
// render, not to be a durable store, so it's fine to evict aggressively
// rather than grow forever across many different reports over time.
const MAX_ENTRIES = 5;

function readAll(): Record<string, string[]> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function readCachedScorePages(taskId: string): string[] | undefined {
    return readAll()[taskId];
}

export function writeCachedScorePages(taskId: string, pages: string[]): void {
    try {
        const all = readAll();
        all[taskId] = pages;
        const keys = Object.keys(all);
        if (keys.length > MAX_ENTRIES) {
            // No ordering info is kept, so just drop arbitrary extras down to
            // the bound rather than tracking recency for a best-effort cache.
            for (const k of keys.slice(0, keys.length - MAX_ENTRIES)) delete all[k];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
        // Best-effort — if this is what's over quota, drop the whole cache
        // and move on rather than let a re-render's own state update fail.
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* give up quietly */ }
    }
}
