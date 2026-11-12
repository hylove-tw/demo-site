import { fireEvent, render, screen } from '@testing-library/react';
import { CompositionParamsForm } from '../CompositionParamsForm';
import { readCachedTaskId, writeCachedTaskId } from '../../utils/musicExportCache';

jest.mock('../../hooks/useMusicGenPresets', () => ({ useMusicGenPresets: () => new Map(), presetForBeat: () => undefined, beatOptionLabel: (_: unknown, p: any) => p.name, beatCredit: () => undefined }));
jest.mock('../../hooks/useVoicePacks', () => ({ useVoicePacks: () => [] }));

it.each(['full', 'compact'] as const)('offers the switch in %s form, off by default', (variant) => {
    const onChange = jest.fn();
    render(<CompositionParamsForm value={{}} onChange={onChange} variant={variant} instrumentFields={[]} />);
    const toggle = screen.getByRole('checkbox', { name: /旋律音級重新對應/ });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith({ remapMelody: true });
    expect(screen.getByText(/原始分析預覽不會套用/)).toBeInTheDocument();
});

it('keeps remapped and original exports separate, including legacy cache entries', () => {
    localStorage.clear();
    writeCachedTaskId('report', 'original');
    expect(readCachedTaskId('report', true)).toBeUndefined();
    writeCachedTaskId('report', 'remapped', true);
    expect(readCachedTaskId('report')).toBe('original');
    expect(readCachedTaskId('report', true)).toBe('remapped');
});
