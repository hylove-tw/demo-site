// Voice pack (voice_pack) picker: an independent field alongside
// genre/rhythm, added because music-gen now supports selectable synthesis
// soundfonts. /api/v1/generate-dual has no equivalent field yet, so dual
// callers pass showVoicePack={false} to hide the whole section rather than
// show a control that would silently do nothing.
import { render, screen, fireEvent } from '@testing-library/react';
import { CompositionParamsForm } from '../CompositionParamsForm';
import type { VoicePack } from '../../services/musicGenService';
import { readLastVoicePack } from '../../utils/lastVoicePackCache';

const mockVoicePacks: VoicePack[] = [
    { id: '', displayName: '預設音色', previewUrl: '/api/v1/assets/voice-pack-preview/default' },
    { id: 'generaluser-gs', displayName: 'GeneralUser GS', previewUrl: '/api/v1/assets/voice-pack-preview/generaluser-gs' },
    // No preview clip rendered for this one yet — its card must not offer a
    // preview button that would 404.
    { id: 'no-preview-pack', displayName: '尚無試聽音色', previewUrl: null },
];

jest.mock('../../hooks/useVoicePacks', () => ({
    useVoicePacks: () => mockVoicePacks,
}));

describe('CompositionParamsForm voice pack section', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('shows a card per voice pack in full mode, including the default', () => {
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} variant="full" />);
        expect(screen.getByText('預設音色')).toBeInTheDocument();
        expect(screen.getByText('GeneralUser GS')).toBeInTheDocument();
    });

    it('shows a <select> instead of cards in compact mode', () => {
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} variant="compact" />);
        expect(screen.getByRole('combobox', { name: '音色' })).toBeInTheDocument();
        expect(screen.queryByText('GeneralUser GS', { selector: 'span' })).not.toBeInTheDocument();
    });

    it('picking a card calls onChange with the pack id and remembers the choice', () => {
        const onChange = jest.fn();
        render(<CompositionParamsForm value={{}} onChange={onChange} variant="full" />);

        fireEvent.click(screen.getByText('GeneralUser GS'));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ voicePack: 'generaluser-gs' }));
        expect(readLastVoicePack()).toBe('generaluser-gs');
    });

    it('shows a preview button only for packs with a preview clip', () => {
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} variant="full" />);
        expect(screen.getByRole('button', { name: '試聽 GeneralUser GS' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '試聽 尚無試聽音色' })).not.toBeInTheDocument();
    });

    it('hides the whole section when showVoicePack is false (dual mode, no server support yet)', () => {
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} variant="full" showVoicePack={false} />);
        expect(screen.queryByText('GeneralUser GS')).not.toBeInTheDocument();
        expect(screen.queryByText('音色')).not.toBeInTheDocument();
    });

    it('defaults the picker to the last-selected pack when the current value has none set', () => {
        // Simulates opening a fresh form after a previous session picked
        // GeneralUser GS — the picker should pre-select it rather than
        // silently reverting to the server default every time.
        localStorage.setItem('lastVoicePack', 'generaluser-gs');
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} variant="compact" />);
        expect(screen.getByRole('combobox', { name: '音色' })).toHaveValue('generaluser-gs');
    });

    it("an explicit value.voicePack of '' (server default) overrides the remembered pick", () => {
        localStorage.setItem('lastVoicePack', 'generaluser-gs');
        render(<CompositionParamsForm value={{ voicePack: '' }} onChange={jest.fn()} variant="compact" />);
        expect(screen.getByRole('combobox', { name: '音色' })).toHaveValue('');
    });
});
