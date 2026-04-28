import { useEffect, useRef, useState } from 'react';
import { ExportState, StemVolumes } from '../services/musicGenService';
import { MixDownloadConfig } from '../components/StemMixer';

/**
 * Shared MP3 export bookkeeping for music report editors.
 *
 * Owns: export state machine, abort controller, per-stem volume map,
 * one-shot auto-trigger on mount, and auto-download when the export was
 * initiated from the mixer (vs. the initial page load).
 *
 * The caller provides `doExport`, which performs the actual API call and
 * pushes status updates via the hook's setter. This keeps the hook agnostic
 * of single- vs. dual-mode payload shape — both editors share the bookkeeping
 * but invoke their own export function (exportMp3 / exportDualMp3).
 */
export interface UseMp3ExportOptions<V extends StemVolumes = StemVolumes> {
    /** When true, auto-trigger the first export on mount. */
    canGenerate: boolean;
    /**
     * Performs the actual export. Called once on mount (when canGenerate flips
     * true) and again whenever the user re-runs from the mixer panel.
     * Implementations should call setExportState() and respect the abort signal.
     */
    doExport: (config?: MixDownloadConfig, signal?: AbortSignal) => Promise<void>;
    /** Optional initial volumes (e.g., for restoring saved mixer state). */
    initialVolumes?: V;
}

export interface UseMp3ExportResult<V extends StemVolumes = StemVolumes> {
    exportState: ExportState;
    setExportState: React.Dispatch<React.SetStateAction<ExportState>>;
    stemVolumes: V;
    setStemVolumes: React.Dispatch<React.SetStateAction<V>>;
    isMixerExporting: boolean;
    /** Run an export that should auto-download when complete (mixer-initiated). */
    runMixerExport: (config?: MixDownloadConfig) => void;
    /** Run an export silently (page-load initiated). */
    runSilentExport: (config?: MixDownloadConfig) => void;
    abortRef: React.MutableRefObject<AbortController | null>;
}

export function useMp3Export<V extends StemVolumes = StemVolumes>(
    { canGenerate, doExport, initialVolumes }: UseMp3ExportOptions<V>,
): UseMp3ExportResult<V> {
    const [exportState, setExportState] = useState<ExportState>({ status: 'idle' });
    const [stemVolumes, setStemVolumes] = useState<V>((initialVolumes ?? {}) as V);
    const abortRef = useRef<AbortController | null>(null);
    const autoStarted = useRef(false);
    const mixerInitiated = useRef(false);
    // Stable ref so the auto-start effect doesn't depend on doExport's identity
    const doExportRef = useRef(doExport);
    doExportRef.current = doExport;

    const runExport = (config: MixDownloadConfig | undefined, isMixer: boolean) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        mixerInitiated.current = isMixer;
        // Volumes from the mixer override the local state immediately so the
        // UI reflects what's being baked into the export.
        if (config?.volumes) setStemVolumes(config.volumes as V);
        doExportRef.current(config, controller.signal).catch((err: any) => {
            if (err?.name !== 'AbortError') {
                setExportState({ status: 'failed', error: err?.message || '匯出失敗' });
            }
        });
    };

    // Auto-trigger MP3 generation once when the editor is ready.
    useEffect(() => {
        if (!canGenerate || autoStarted.current) return;
        autoStarted.current = true;
        runExport(undefined, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canGenerate]);

    // Auto-download after a mixer-triggered export completes.
    useEffect(() => {
        if (!mixerInitiated.current) return;
        if (exportState.status === 'completed' && exportState.downloadUrl) {
            mixerInitiated.current = false;
            const a = document.createElement('a');
            a.href = exportState.downloadUrl;
            a.download = '';
            a.click();
        } else if (exportState.status === 'failed') {
            mixerInitiated.current = false;
        }
    }, [exportState.status, exportState.downloadUrl]);

    return {
        exportState,
        setExportState,
        stemVolumes,
        setStemVolumes,
        isMixerExporting: exportState.status === 'pending' || exportState.status === 'processing',
        runMixerExport: (config) => runExport(config, true),
        runSilentExport: (config) => runExport(config, false),
        abortRef,
    };
}
