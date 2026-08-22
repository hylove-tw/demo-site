import { timeSignatureForMelody } from '../config/musicCreativeConstants';

/**
 * musicGenService.ts
 *
 * Calls the music-gen service (FastAPI) to export a high-quality MP3.
 * Flow: POST /api/v1/generate → poll /api/v1/tasks/{id} → download /api/v1/download/{id}
 */

const MUSIC_GEN_URL = (process.env.REACT_APP_MUSIC_GEN_URL || '').replace(/\/$/, '');

export const isMusicGenEnabled = (): boolean => Boolean(MUSIC_GEN_URL);

// hylove-demo beat preset ID → music-gen YAML preset name
const BEAT_TO_PRESET: Record<string, string> = {
  pop:          'basic_pop',
  rock:         'basic_pop',
  rumba:        'rnb',
  // bossa_nova's legal bpm_range ([100,150]) barely overlapped tango's
  // [60,100] frontend range; rnb's [75,100] gives it real overlap instead.
  tango:        'rnb',
  // The beat preset's id is `bossanova`; this key was hyphenated, so the
  // lookup missed and every bossa-nova beat fell back to basic_pop —
  // the bossa_nova preset was unreachable from the picker.
  bossanova:    'bossa_nova',
  disco:        'disco',
  waltz:        'compound_ballad',  // waltz API returns 6/8; pipeline auto-falls back to gentle_waltz for 3/4
  country:      'basic_pop',
  // 'jazz' is blues' beat id only. lofi's [70,90] gives blues full overlap;
  // rnb's [75,100] used to leave a quarter of blues' range dead.
  jazz:         'lofi',
  // soul had no dedicated preset and borrowed bossa_nova (zero overlap with
  // its own tempo range). ballad's [60,80] isn't soul-tuned either — this is
  // the closest available compromise, not a real fix. See
  // docs/knowledge/preset-bpm-range-mismatch.md.
  soul:         'ballad',
  reggae:       'reggae',
  samba:        'samba',
  none:         'basic_pop',
};

export function resolveRhythmPreset(beatId: string | undefined, timeSignature: string): string {
  if (!beatId || beatId === 'none') {
    if (timeSignature === '3/4') return 'gentle_waltz';
    if (timeSignature === '6/8') return 'compound_ballad';
    return 'basic_pop';
  }
  return BEAT_TO_PRESET[beatId] ?? 'basic_pop';
}

/**
 * A rhythm preset as music-gen describes it.
 *
 * `credit` and `isNew` are authored in the music-gen preset YAML, so the badge
 * and the arranger's name come from the server rather than being duplicated
 * here — two copies of the same fact is how they drift apart.
 */
export interface MusicGenPreset {
  name: string;
  displayName: string | null;
  credit: string | null;
  isNew: boolean;
  hasAccompaniment: boolean;
  /** Pre-rendered clip of this rhythm, for previewing before generating. */
  previewUrl: string | null;
}

let presetCache: Promise<Map<string, MusicGenPreset>> | null = null;

/**
 * Fetch the server's rhythm presets, keyed by preset name.
 *
 * Cached for the page's lifetime and never throws: this only decorates the
 * picker, so a music-gen that is down or an older build that predates these
 * fields must degrade to an unbadged list, not break the editor.
 */
export function fetchMusicGenPresets(): Promise<Map<string, MusicGenPreset>> {
  if (presetCache) return presetCache;
  if (!MUSIC_GEN_URL) return Promise.resolve(new Map());

  presetCache = fetch(`${MUSIC_GEN_URL}/api/v1/presets`)
    .then((res) => (res.ok ? res.json() : []))
    .then((rows: any[]) => new Map(
      (Array.isArray(rows) ? rows : []).map((row) => [row.name as string, {
        name: row.name,
        displayName: row.display_name ?? null,
        credit: row.credit ?? null,
        isNew: Boolean(row.is_new),
        hasAccompaniment: Boolean(row.has_accompaniment),
        previewUrl: row.preview_url ?? null,
      }])
    ))
    .catch(() => new Map<string, MusicGenPreset>());

  return presetCache;
}

/** Resolve the server preset backing a beat id, for badge/credit lookup. */
export function presetNameForBeat(beatId: string | undefined): string {
  return resolveRhythmPreset(beatId, '4/4');
}

export type AccompanimentMode = 'replace' | 'layer' | 'off';
export type AccompanimentHarmony = 'diatonic' | 'full';

/**
 * The MusicXML that was actually rendered for a finished task.
 *
 * Differs from the upstream MusicXML whenever a preset's accompaniment replaced
 * p2/p3 — displaying the upstream copy would print parts nobody plays and omit
 * the ones they do. Resolves to null when the server has no score saved, so the
 * caller can fall back to what it already has.
 */
export async function fetchRenderedScore(taskId: string): Promise<string | null> {
  if (!MUSIC_GEN_URL) return null;
  try {
    const res = await fetch(`${MUSIC_GEN_URL}/api/v1/score/${taskId}`);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

export interface StemVolumes {
  p1?: number;
  p2?: number;
  p3?: number;
  drums?: number;
  brainwave?: number;
  background?: number;
  [key: string]: number | undefined;
}

export interface MusicGenExportParams {
  title?: string;
  accompaniment?: AccompanimentMode;
  accompanimentHarmony?: AccompanimentHarmony;
  bpm?: number;
  time_signature?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  beat?: string;
  beforeBrainData: any;
  afterBrainData: any;
  musicType?: string;
  recordingTime?: number;
  keyCenter?: string;
  keyType?: string;
  melodyPattern?: number;
  genre?: string;
  brainwaveFrequency?: number | null;
  natureSound?: string;
  /** Per-stem volume overrides in dB (0 = unchanged) */
  stemVolumes?: StemVolumes;
}

export interface DualStemVolumes {
  first_p1?: number;
  first_p2?: number;
  first_p3?: number;
  second_p1?: number;
  second_p2?: number;
  second_p3?: number;
  drums?: number;
  brainwave?: number;
  background?: number;
  [key: string]: number | undefined;
}

export interface MusicGenDualExportParams {
  title?: string;
  accompaniment?: AccompanimentMode;
  accompanimentHarmony?: AccompanimentHarmony;
  bpm?: number;
  melodyPattern?: number;
  /** @deprecated 拍號由 `melodyPattern` 決定，伺服器會忽略此欄位。 */
  time_signature?: string;
  first_p1?: string;
  first_p2?: string;
  first_p3?: string;
  second_p1?: string;
  second_p2?: string;
  second_p3?: string;
  beat?: string;
  firstBrainData: any;
  secondBrainData: any;
  musicType?: string;
  recordingTime?: number;
  keyCenter?: string;
  keyType?: string;
  genre?: string;
  brainwaveFrequency?: number | null;
  natureSound?: string;
  stemVolumes?: DualStemVolumes;
}

export type ExportStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportState {
  status: ExportStatus;
  error?: string;
  downloadUrl?: string;
  /** Available after generation completes: stem name → download URL */
  stemUrls?: Record<string, string>;
  /** Needed to fetch the score that was actually rendered. */
  taskId?: string;
}

/**
 * Render MusicXML to SVG pages server-side via Verovio.
 * Returns an array of SVG strings (one per page).
 */
export async function renderScore(
  musicxml: string,
  options?: { pageWidth?: number; scale?: number; beatPreset?: string; measuresPerSystem?: number },
  signal?: AbortSignal,
): Promise<string[]> {
  if (!MUSIC_GEN_URL) throw new Error('REACT_APP_MUSIC_GEN_URL is not configured');
  const resp = await fetch(`${MUSIC_GEN_URL}/api/v1/render-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      musicxml,
      page_width:           options?.pageWidth          ?? 2800,
      scale:                options?.scale              ?? 35,
      beat_preset:          options?.beatPreset         ?? '',
      measures_per_system:  options?.measuresPerSystem  ?? 3,
    }),
    signal,
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`render-score failed: ${msg}`);
  }
  const data = await resp.json();
  return data.pages as string[];
}

export async function exportMp3(
  params: MusicGenExportParams,
  onStatusChange: (state: ExportState) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!MUSIC_GEN_URL) {
    throw new Error('REACT_APP_MUSIC_GEN_URL is not configured');
  }

  const melody = params.melodyPattern || 1;
  // The meter follows the melody pattern; the server derives it the same way and
  // ignores any time_signature we send, so sending one only invites drift.
  const rhythmPreset = resolveRhythmPreset(params.beat, timeSignatureForMelody(melody));

  const payload = {
    title:               params.title || '未命名的樂譜',
    bpm:                 params.bpm || 60,
    p1:                  params.p1 || 'piano',
    p2:                  params.p2 || 'piano',
    p3:                  params.p3 || 'piano',
    before_brain_data:   params.beforeBrainData,
    music_type:          params.musicType || 'emotion',
    recording_time:      params.recordingTime || 5,
    key_center:          params.keyCenter || 'C',
    key_type:            params.keyType || 'major',
    melody,
    genre:               params.genre || '',
    brainwave_frequency: params.brainwaveFrequency ?? null,
    nature_sound:        params.natureSound || 'none',
    rhythm_preset:       rhythmPreset,
    accompaniment:       params.accompaniment ?? 'replace',
    accompaniment_harmony: params.accompanimentHarmony ?? 'diatonic',
    // Per-stem volumes
    p1_volume_db:         params.stemVolumes?.p1         ?? 0,
    p2_volume_db:         params.stemVolumes?.p2         ?? 0,
    p3_volume_db:         params.stemVolumes?.p3         ?? 0,
    drum_volume_db:       params.stemVolumes?.drums      ?? 0,
    brainwave_volume_db:  params.stemVolumes?.brainwave  ?? -15,
    background_volume_db: params.stemVolumes?.background ?? -15,
  };

  await _submitAndPoll('/api/v1/generate', payload, onStatusChange, signal);
}

/**
 * Generate an MP3 from a dual-player brain dataset.
 * music-gen fetches a 6-part MusicXML score from Rails /api/v1/dualmusic
 * (using the same dual logic as 琴瑟合) and renders it through the same
 * MP3 / brainwave / nature-sound pipeline as single mode.
 */
export async function exportDualMp3(
  params: MusicGenDualExportParams,
  onStatusChange: (state: ExportState) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!MUSIC_GEN_URL) {
    throw new Error('REACT_APP_MUSIC_GEN_URL is not configured');
  }
  const melody = params.melodyPattern || 1;
  const rhythmPreset = resolveRhythmPreset(params.beat, timeSignatureForMelody(melody));

  const payload = {
    title:                params.title || '未命名的樂譜',
    bpm:                  params.bpm || 60,
    // Dual mode never forwarded this, so every duet was generated as melody 1
    // whatever the user picked, and the meter followed from that.
    melody,
    first_p1:             params.first_p1  || 'flute',
    first_p2:             params.first_p2  || 'piano',
    first_p3:             params.first_p3  || 'cello',
    second_p1:            params.second_p1 || 'violin',
    second_p2:            params.second_p2 || 'guitar',
    second_p3:            params.second_p3 || 'bass',
    first_brain_data:     params.firstBrainData,
    second_brain_data:    params.secondBrainData,
    music_type:           params.musicType || 'emotion',
    recording_time:       params.recordingTime || 5,
    key_center:           params.keyCenter || 'C',
    key_type:             params.keyType || 'major',
    genre:                params.genre || '',
    brainwave_frequency:  params.brainwaveFrequency ?? null,
    nature_sound:         params.natureSound || 'none',
    rhythm_preset:        rhythmPreset,
    accompaniment:        params.accompaniment ?? 'replace',
    accompaniment_harmony: params.accompanimentHarmony ?? 'diatonic',
    first_p1_volume_db:   params.stemVolumes?.first_p1  ?? 0,
    first_p2_volume_db:   params.stemVolumes?.first_p2  ?? 0,
    first_p3_volume_db:   params.stemVolumes?.first_p3  ?? 0,
    second_p1_volume_db:  params.stemVolumes?.second_p1 ?? 0,
    second_p2_volume_db:  params.stemVolumes?.second_p2 ?? 0,
    second_p3_volume_db:  params.stemVolumes?.second_p3 ?? 0,
    drum_volume_db:       params.stemVolumes?.drums      ?? 0,
    brainwave_volume_db:  params.stemVolumes?.brainwave  ?? -15,
    background_volume_db: params.stemVolumes?.background ?? -15,
  };

  await _submitAndPoll('/api/v1/generate-dual', payload, onStatusChange, signal);
}

async function _submitAndPoll(
  endpoint: string,
  payload: unknown,
  onStatusChange: (state: ExportState) => void,
  signal?: AbortSignal,
): Promise<void> {
  onStatusChange({ status: 'pending' });

  const genResp = await fetch(`${MUSIC_GEN_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!genResp.ok) {
    const errText = await genResp.text().catch(() => genResp.statusText);
    throw new Error(`生成任務建立失敗: ${errText}`);
  }

  const { task_id } = await genResp.json();
  onStatusChange({ status: 'processing' });

  while (true) {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, 2000);
      signal?.addEventListener('abort', () => { clearTimeout(t); reject(new Error('Aborted')); });
    });

    const taskResp = await fetch(`${MUSIC_GEN_URL}/api/v1/tasks/${task_id}`, { signal });
    if (!taskResp.ok) continue;

    const task = await taskResp.json();

    if (task.status === 'completed') {
      const downloadUrl = `${MUSIC_GEN_URL}/api/v1/download/${task_id}`;
      const stemUrls: Record<string, string> | undefined = task.stem_urls
        ? Object.fromEntries(
            Object.entries(task.stem_urls as Record<string, string>).map(
              ([k, v]) => [k, v.startsWith('http') ? v : `${MUSIC_GEN_URL}${v}`]
            )
          )
        : undefined;
      onStatusChange({ status: 'completed', downloadUrl, stemUrls, taskId: task_id });
      return;
    }
    if (task.status === 'failed') {
      const err = task.error || '音樂生成失敗';
      onStatusChange({ status: 'failed', error: err });
      throw new Error(err);
    }
  }
}
