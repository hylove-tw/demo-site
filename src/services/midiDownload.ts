import { MUSIC_GEN_URL } from '../config/apiBase';

/**
 * music-gen MIDI download.
 *
 * Contract (https://github.com/hylove-tw/music-gen/pull/2, not merged yet):
 *
 * A completed `GET /api/v1/tasks/{task_id}` includes `midi_url`.
 * - A path such as `/api/v1/midi/{task_id}` is prefixed with `MUSIC_GEN_URL`
 *   the same way `stem_urls` are. Absolute `http(s)` URLs are kept.
 * - `null`, `""`, or a missing field means this task has no MIDI file.
 *   The MP3 export is still completed; callers must not treat that as failure.
 *
 * `GET /api/v1/midi/{task_id}` returns `Content-Type: audio/midi` and
 * `Content-Disposition: attachment; filename="<task_id>.mid"`.
 * Solo and dual each produce one multi-track file, so there is one URL.
 */

/** Turn the task's `midi_url` into a fetchable URL, or null when MIDI is absent. */
export function resolveMidiUrl(midiUrl: unknown): string | null {
  if (typeof midiUrl !== 'string') return null;
  const trimmed = midiUrl.trim();
  if (!trimmed) return null;
  // Same rule as stem_urls in `_mapCompletedTask`: only absolute URLs are
  // used as-is. `https://` starts with `http`.
  return trimmed.startsWith('http') ? trimmed : `${MUSIC_GEN_URL}${trimmed}`;
}

/** Filename from `Content-Disposition`, or null when the header has none. */
export function filenameFromContentDisposition(header: string | null | undefined): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|"|')?([^"';]+)/i.exec(header);
  if (!match) return null;
  const raw = match[1].trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function fallbackMidiName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim();
  const base = cleaned || 'music';
  return base.toLowerCase().endsWith('.mid') ? base : `${base}.mid`;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

/**
 * Download one MIDI file. Throws on HTTP errors so the button can show them;
 * never signals that the MP3 generation itself failed.
 */
export async function downloadMidiFile(url: string, fallbackName: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('MIDI 下載失敗');
  }

  if (response.status === 404 || response.status === 204) {
    throw new Error('MIDI 尚未提供');
  }
  if (!response.ok) {
    throw new Error(`MIDI 下載失敗（${response.status}）`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('text/html')) {
    throw new Error('MIDI 尚未提供');
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error('MIDI 尚未提供');
  }

  const filename = filenameFromContentDisposition(response.headers.get('content-disposition'))
    || fallbackMidiName(fallbackName);
  triggerBlobDownload(blob, filename);
}
