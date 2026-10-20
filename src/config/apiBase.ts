/**
 * Build-time API bases.
 *
 * CRA inlines REACT_APP_* into the bundle. When a variable is unset or blank,
 * requests stay on the page's own origin (`/api/...`, `/api/music-gen/...`) so
 * the same build works on every hostname the Worker serves. Set an absolute
 * URL only to point `npm start` (or a one-off build) at a remote backend.
 *
 * A value of `/` counts as blank. Callers concatenate this base with paths
 * that already start with `/`, and `//api/...` would be protocol-relative.
 */
export function resolveBaseUrl(raw: string | undefined, fallback: string): string {
  const trimmed = (raw ?? '').trim().replace(/\/+$/, '');
  return trimmed || fallback;
}

/** Analysis paths already include `/api/v1` or `/api/v2`. */
export const DEFAULT_ANALYSIS_API_BASE = '';

/** music-gen is mounted under this path on the same host as the SPA. */
export const DEFAULT_MUSIC_GEN_URL = '/api/music-gen';

export const ANALYSIS_API_BASE = resolveBaseUrl(
  process.env.REACT_APP_ANALYSIS_API_BASE,
  DEFAULT_ANALYSIS_API_BASE,
);

export const MUSIC_GEN_URL = resolveBaseUrl(
  process.env.REACT_APP_MUSIC_GEN_URL,
  DEFAULT_MUSIC_GEN_URL,
);
