import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MidiDownloadButton from '../MidiDownloadButton';

function midiResponse(opts: { status?: number; disposition?: string; type?: string } = {}) {
    const status = opts.status ?? 200;
    const headers: Record<string, string> = {
        'content-type': opts.type || 'audio/midi',
    };
    if (opts.disposition) headers['content-disposition'] = opts.disposition;
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
        blob: async () => new Blob(['MThd'], { type: 'audio/midi' }),
    };
}

describe('MidiDownloadButton', () => {
    const downloads: { download: string }[] = [];

    beforeEach(() => {
        downloads.length = 0;
        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            writable: true,
            value: jest.fn(() => 'blob:midi'),
        });
        Object.defineProperty(URL, 'revokeObjectURL', {
            configurable: true,
            writable: true,
            value: jest.fn(),
        });
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            downloads.push({ download: this.download });
        });
    });

    it('renders nothing when midi_url was null', () => {
        const { container } = render(<MidiDownloadButton midiUrl={null} />);
        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('button', { name: '下載 MIDI' })).not.toBeInTheDocument();
    });

    it('shows one download control and saves the server filename', async () => {
        global.fetch = jest.fn().mockResolvedValue(midiResponse({
            disposition: 'attachment; filename="task-9.mid"',
        })) as any;

        render(<MidiDownloadButton midiUrl="/api/music-gen/api/v1/midi/task-9" fallbackName="other.mid" />);

        const button = screen.getByRole('button', { name: '下載 MIDI' });
        expect(button).toHaveClass('btn', 'btn-outline', 'btn-sm');
        fireEvent.click(button);

        await waitFor(() => expect(downloads).toEqual([{ download: 'task-9.mid' }]));
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/music-gen/api/v1/midi/task-9');
        await waitFor(() => expect(button).not.toBeDisabled());
    });

    it('disables the control while the download is in flight', async () => {
        let resolveFetch: (value: ReturnType<typeof midiResponse>) => void = () => {};
        global.fetch = jest.fn(() => new Promise(resolve => { resolveFetch = resolve; })) as any;

        render(<MidiDownloadButton midiUrl="/api/music-gen/api/v1/midi/task-9" fallbackName="task-9.mid" />);
        fireEvent.click(screen.getByRole('button', { name: '下載 MIDI' }));

        expect(screen.getByRole('button', { name: '下載 MIDI' })).toBeDisabled();
        expect(screen.getByRole('button', { name: '下載 MIDI' })).toHaveAttribute('aria-busy', 'true');

        resolveFetch(midiResponse({ disposition: 'attachment; filename="task-9.mid"' }));
        await waitFor(() => expect(downloads).toEqual([{ download: 'task-9.mid' }]));
        await waitFor(() => expect(screen.getByRole('button', { name: '下載 MIDI' })).toBeEnabled());
    });

    it('shows an error on the control when the file is missing and leaves the button in place', async () => {
        global.fetch = jest.fn().mockResolvedValue(midiResponse({ status: 404 })) as any;

        render(<MidiDownloadButton midiUrl="/api/music-gen/api/v1/midi/task-9" />);
        fireEvent.click(screen.getByRole('button', { name: '下載 MIDI' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('MIDI 尚未提供');
        expect(screen.getByRole('button', { name: '下載 MIDI' })).toBeEnabled();
        expect(downloads).toEqual([]);
    });
});
