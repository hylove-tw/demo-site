// Regression tests for the 曲風="自訂" mechanism that replaced the old
// "顯示更多組合" advanced-toggle: melody/rhythm overrides are now only
// reachable by explicitly switching the genre to "自訂", not by expanding a
// details panel while a real genre stays selected. This also covers the
// architectural fix behind it — MusicReportEditor/DualMusicReportEditor used
// to let a separate "節奏風格" select write `beat` directly regardless of
// `genre`, which is exactly the kind of drift that showed samba as "節奏：
// 流行" after a report reload.
import { render, screen, fireEvent } from '@testing-library/react';
import { CompositionParamsForm } from '../CompositionParamsForm';

jest.mock('../../hooks/useMusicGenPresets', () => {
    const actual = jest.requireActual('../../hooks/useMusicGenPresets');
    return { ...actual, useMusicGenPresets: () => new Map() };
});

const openMusicTab = () => fireEvent.click(screen.getByText('音樂設定'));

describe('custom genre reveal', () => {
    it('does not show a melody/rhythm override while a real genre is selected', () => {
        render(<CompositionParamsForm value={{ genre: 'reggae', melodyPattern: 9 }} onChange={jest.fn()} />);
        openMusicTab();
        expect(screen.queryByText('請選擇主旋律')).not.toBeInTheDocument();
        expect(screen.queryByText('請選擇伴奏節奏')).not.toBeInTheDocument();
    });

    it('shows the melody/rhythm override once genre is "自訂"', () => {
        render(<CompositionParamsForm value={{ genre: 'custom' }} onChange={jest.fn()} />);
        openMusicTab();
        expect(screen.getByText('請選擇主旋律')).toBeInTheDocument();
        expect(screen.getByText('請選擇伴奏節奏')).toBeInTheDocument();
    });

    it('picking 自訂 from the compact genre dropdown clears any inherited beat', () => {
        const onChange = jest.fn();
        render(
            <CompositionParamsForm
                value={{ genre: 'chacha', beat: 'samba', bpm: 175 }}
                onChange={onChange}
                variant="compact"
            />
        );
        openMusicTab();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'custom' } });
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ genre: 'custom', beat: undefined })
        );
    });

    it('defaults to the 基本設定 tab', () => {
        render(<CompositionParamsForm value={{}} onChange={jest.fn()} />);
        expect(screen.getByText('樂譜標題')).toBeInTheDocument();
        expect(screen.queryByText('曲風')).not.toBeInTheDocument();
    });
});
