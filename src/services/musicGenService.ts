/**
 * musicGenService.ts
 *
 * Calls the music-gen service (FastAPI) to export a high-quality MP3.
 * Flow: POST /api/v1/generate → poll /api/v1/tasks/{id} → download /api/v1/download/{id}
 */

const MUSIC_GEN_URL = (process.env.REACT_APP_MUSIC_GEN_URL || '').replace(/\/$/, '');
const ANALYSIS_API_BASE = (process.env.REACT_APP_ANALYSIS_API_BASE || 'http://localhost:3000').replace(/\/$/, '');

export const isMusicGenEnabled = (): boolean => Boolean(MUSIC_GEN_URL);

// hylove-demo beat preset ID → music-gen YAML preset name
const BEAT_TO_PRESET: Record<string, string> = {
  pop:        'basic_pop',
  rock:       'basic_pop',
  rumba:      'rnb',
  tango:      'bossa_nova',
  'bossa-nova': 'bossa_nova',
  waltz:      'gentle_waltz',
  country:    'basic_pop',
  jazz:       'rnb',
  reggae:     'ballad',
  none:       'basic_pop',
};

export function resolveRhythmPreset(beatId: string | undefined, timeSignature: string): string {
  if (!beatId || beatId === 'none') {
    return timeSignature === '3/4' ? 'gentle_waltz' : 'basic_pop';
  }
  return BEAT_TO_PRESET[beatId] ?? 'basic_pop';
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

export type ExportStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportState {
  status: ExportStatus;
  error?: string;
  downloadUrl?: string;
  /** Available after generation completes: stem name → download URL */
  stemUrls?: Record<string, string>;
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

  const timeSignature = params.time_signature || '4/4';
  const rhythmPreset = resolveRhythmPreset(params.beat, timeSignature);

  const payload = {
    music_api_base_url:  ANALYSIS_API_BASE,
    music_api_version:   'v2',
    title:               params.title || '未命名的樂譜',
    bpm:                 params.bpm || 60,
    time_signature:      timeSignature,
    p1:                  params.p1 || 'piano',
    p2:                  params.p2 || 'piano',
    p3:                  params.p3 || 'piano',
    before_brain_data:   params.beforeBrainData,
    after_brain_data:    params.afterBrainData,
    music_type:          params.musicType || 'emotion',
    recording_time:      params.recordingTime || 5,
    key_center:          params.keyCenter || 'C',
    key_type:            params.keyType || 'major',
    melody_pattern:      params.melodyPattern || 1,
    genre:               params.genre || '',
    brainwave_frequency: params.brainwaveFrequency ?? null,
    nature_sound:        params.natureSound || 'none',
    rhythm_preset:       rhythmPreset,
    // Per-stem volumes
    p1_volume_db:         params.stemVolumes?.p1         ?? 0,
    p2_volume_db:         params.stemVolumes?.p2         ?? 0,
    p3_volume_db:         params.stemVolumes?.p3         ?? 0,
    drum_volume_db:       params.stemVolumes?.drums      ?? 0,
    brainwave_volume_db:  params.stemVolumes?.brainwave  ?? -15,
    background_volume_db: params.stemVolumes?.background ?? -15,
  };

  onStatusChange({ status: 'pending' });

  const genResp = await fetch(`${MUSIC_GEN_URL}/api/v1/generate`, {
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

  // Poll every 2 s until completed or failed
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
      // Prefix relative stem URLs with MUSIC_GEN_URL
      const stemUrls: Record<string, string> | undefined = task.stem_urls
        ? Object.fromEntries(
            Object.entries(task.stem_urls as Record<string, string>).map(
              ([k, v]) => [k, v.startsWith('http') ? v : `${MUSIC_GEN_URL}${v}`]
            )
          )
        : undefined;
      onStatusChange({ status: 'completed', downloadUrl, stemUrls });
      return;
    }
    if (task.status === 'failed') {
      const err = task.error || '音樂生成失敗';
      onStatusChange({ status: 'failed', error: err });
      throw new Error(err);
    }
  }
}
