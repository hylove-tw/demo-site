// Regression tests for the mobile "page jumps up after picking a music
// parameter" report. CompositionParamsForm used to declare its Card/Divider
// helpers inside the render body, so every onChange produced new component
// types and React remounted both cards' whole DOM subtree — the tapped control
// lost focus and the scroll container lost its position. These tests pin the
// fix: a parameter change must update the existing DOM nodes in place.
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    CompositionParamsForm,
    CompositionParams,
    SINGLE_INSTRUMENT_FIELDS,
    applyMelody,
    CUSTOM_GENRE_ID,
} from '../CompositionParamsForm';
import { GENRES } from '../../config/musicCreativeConstants';

jest.mock('../../hooks/useMusicGenPresets', () => {
    const actual = jest.requireActual('../../hooks/useMusicGenPresets');
    return { ...actual, useMusicGenPresets: () => new Map() };
});

const Harness: React.FC<{ initial: CompositionParams; variant?: 'full' | 'compact' }> = ({ initial, variant }) => {
    const [value, setValue] = useState<CompositionParams>(initial);
    return (
        <CompositionParamsForm value={value} onChange={setValue} variant={variant}
            instrumentFields={SINGLE_INSTRUMENT_FIELDS} />
    );
};

describe.each(['full', 'compact'] as const)('CompositionParamsForm (%s) keeps its DOM across changes', (variant) => {
    it('does not remount the cards when a parameter changes', () => {
        render(<Harness initial={{}} variant={variant} />);
        const titleInput = screen.getByPlaceholderText('未命名的樂譜');
        const musicCard = screen.getByText('音樂設定').parentElement!;
        const rangeInput = musicCard.querySelector('input[type="range"]')!;

        fireEvent.click(screen.getByRole('button', { name: '小調' }));
        fireEvent.change(titleInput, { target: { value: 'abc' } });
        fireEvent.change(rangeInput, { target: { value: '70' } });

        expect(screen.getByPlaceholderText('未命名的樂譜')).toBe(titleInput);
        expect(screen.getByText('音樂設定').parentElement).toBe(musicCard);
        expect(musicCard.querySelector('input[type="range"]')).toBe(rangeInput);
    });

    it('keeps focus on the title input while typing', () => {
        render(<Harness initial={{}} variant={variant} />);
        const titleInput = screen.getByPlaceholderText('未命名的樂譜');
        titleInput.focus();
        fireEvent.change(titleInput, { target: { value: 'a' } });
        fireEvent.change(titleInput, { target: { value: 'ab' } });
        expect(document.activeElement).toBe(titleInput);
    });
});

it('picking a genre card does not replace the card that was tapped', () => {
    render(<Harness initial={{}} />);
    const genre = GENRES[1];
    const card = screen.getAllByText(genre.nameZh)[0].closest('button')!;
    fireEvent.click(card);
    expect(screen.getAllByText(genre.nameZh)[0].closest('button')).toBe(card);
    expect(card.className).toContain('border-primary');
});

describe('自訂 mode', () => {
    it('applyMelody keeps genre=自訂 instead of dropping it as incompatible', () => {
        expect(applyMelody({ genre: CUSTOM_GENRE_ID }, 3).genre).toBe(CUSTOM_GENRE_ID);
    });

    it('choosing a melody in 自訂 mode keeps the melody/rhythm section open', () => {
        render(<Harness initial={{ genre: CUSTOM_GENRE_ID }} />);
        const melodySelect = screen.getByText('請選擇主旋律').closest('select')!;
        fireEvent.change(melodySelect, { target: { value: '3' } });
        expect(screen.getByText('請選擇主旋律').closest('select')).toBe(melodySelect);
        expect(screen.getByText('請選擇伴奏節奏')).toBeInTheDocument();
    });
});
