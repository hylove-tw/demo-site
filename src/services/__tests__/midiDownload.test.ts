import { downloadMidiFile, filenameFromContentDisposition, resolveMidiUrl } from '../midiDownload';

function response(opts: {
    status?: number;
    type?: string | null;
    disposition?: string | null;
    body?: string;
}): Response {
    const status = opts.status ?? 200;
    const headers: Record<string, string> = {};
    if (opts.type) headers['content-type'] = opts.type;
    if (opts.disposition) headers['content-disposition'] = opts.disposition;
    const payload = opts.body ?? 'MThd';
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
        blob: async () => new Blob([payload], { type: opts.type || 'application/octet-stream' }),
    } as unknown as Response;
}

describe('resolveMidiUrl', () => {
    it('prefixes the task path from music-gen PR 2', () => {
        expect(resolveMidiUrl('/api/v1/midi/task-9')).toBe('/api/music-gen/api/v1/midi/task-9');
    });

    it('keeps an absolute URL', () => {
        expect(resolveMidiUrl('https://backend.example/api/v1/midi/task-9'))
            .toBe('https://backend.example/api/v1/midi/task-9');
    });

    it('returns null for null, empty, and non-strings so the control stays hidden', () => {
        expect(resolveMidiUrl(null)).toBeNull();
        expect(resolveMidiUrl(undefined)).toBeNull();
        expect(resolveMidiUrl('')).toBeNull();
        expect(resolveMidiUrl('   ')).toBeNull();
        expect(resolveMidiUrl(false)).toBeNull();
    });
});

describe('filenameFromContentDisposition', () => {
    it('reads the quoted filename the MIDI endpoint sends', () => {
        expect(filenameFromContentDisposition('attachment; filename="task-9.mid"')).toBe('task-9.mid');
    });

    it('returns null when the header is missing', () => {
        expect(filenameFromContentDisposition(null)).toBeNull();
        expect(filenameFromContentDisposition('attachment')).toBeNull();
    });
});

describe('downloadMidiFile', () => {
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

    it('saves one .mid using the Content-Disposition filename', async () => {
        global.fetch = jest.fn().mockResolvedValue(response({
            type: 'audio/midi',
            disposition: 'attachment; filename="task-9.mid"',
        })) as any;

        await downloadMidiFile('/api/music-gen/api/v1/midi/task-9', 'ignored.mid');

        expect(global.fetch).toHaveBeenCalledWith('/api/music-gen/api/v1/midi/task-9');
        expect(downloads).toEqual([{ download: 'task-9.mid' }]);
    });

    it('falls back to the task id filename when the header is absent', async () => {
        global.fetch = jest.fn().mockResolvedValue(response({ type: 'audio/midi' })) as any;

        await downloadMidiFile('/api/music-gen/api/v1/midi/task-9', 'task-9.mid');

        expect(downloads).toEqual([{ download: 'task-9.mid' }]);
    });

    it('rejects a missing file without saving anything', async () => {
        global.fetch = jest.fn().mockResolvedValue(response({ status: 404, body: '' })) as any;

        await expect(downloadMidiFile('/api/music-gen/api/v1/midi/task-9', 'task-9.mid'))
            .rejects.toThrow('MIDI 尚未提供');
        expect(downloads).toEqual([]);
    });

    it('rejects an HTML body so a SPA fallback is not saved as MIDI', async () => {
        global.fetch = jest.fn().mockResolvedValue(response({
            type: 'text/html',
            body: '<html></html>',
        })) as any;

        await expect(downloadMidiFile('/midi', 'task-9.mid')).rejects.toThrow('MIDI 尚未提供');
        expect(downloads).toEqual([]);
    });
});
