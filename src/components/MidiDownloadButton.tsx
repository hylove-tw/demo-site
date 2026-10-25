import React, { useState } from 'react';
import { downloadMidiFile } from '../services/midiDownload';

/**
 * 「下載 MIDI」 beside the MP3 / MusicXML actions.
 *
 * Renders nothing when `midiUrl` is missing — that is `midi_url: null` on the
 * completed task. A missing file is not a failed generation; the MP3 control
 * stays as it was.
 *
 * Solo and dual share this button: music-gen returns one multi-track file.
 */
const MidiDownloadButton: React.FC<{
  midiUrl?: string | null;
  /** Used when the response has no Content-Disposition filename. */
  fallbackName?: string;
}> = ({ midiUrl, fallbackName }) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!midiUrl) return null;

  const onClick = async () => {
    setPending(true);
    setError(null);
    try {
      await downloadMidiFile(midiUrl, fallbackName || 'music.mid');
    } catch (err: any) {
      setError(err?.message || 'MIDI 下載失敗');
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        className="btn btn-outline btn-sm gap-1"
        onClick={onClick}
        disabled={pending}
        aria-busy={pending}
        title="下載 MIDI（.mid）"
      >
        {pending
          ? <span className="loading loading-spinner loading-xs" />
          : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
        下載 MIDI
      </button>
      {error && (
        <span role="alert" className="text-error text-xs">{error}</span>
      )}
    </span>
  );
};

export default MidiDownloadButton;
