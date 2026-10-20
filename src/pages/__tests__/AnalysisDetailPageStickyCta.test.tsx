// The 開始分析 bar is sticky at the bottom of the screen (on mobile the form
// used to push it ~5,000px down) and carries a one-line recap of the
// parameters. It must stay the *same* single button wired to handleAnalyze —
// not a second, sticky copy with its own submission logic.
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '../../analysis/plugins/yuanshenyinv2';
import AnalysisDetailPage from '../AnalysisDetailPage';

// react-router-dom v7 does not resolve under this Jest setup (App.test.tsx
// fails on main for the same reason), so stand in for the three pieces the
// page uses.
jest.mock('react-router-dom', () => ({
    useParams: () => ({ id: 'yuanshenyin-v2' }),
    useNavigate: () => jest.fn(),
    Link: ({ children, to, ...rest }: any) => <a href={String(to)} {...rest}>{children}</a>,
}), { virtual: true });
jest.mock('../../context/UserContext', () => ({
    useUserContext: () => ({ currentUser: { id: 'u1', name: '測試者' }, users: [{ id: 'u1', name: '測試者' }] }),
}));
jest.mock('../../hooks/useMusicGenPresets', () => {
    const actual = jest.requireActual('../../hooks/useMusicGenPresets');
    return { ...actual, useMusicGenPresets: () => new Map() };
});
jest.mock('../../config/analysisMethods', () => ({
    musicAnalysisCreative: jest.fn(),
    dualMusicAnalysisCreative: jest.fn(),
}));
jest.mock('../../components/FileGroupSelector', () => () => <div>檔案選擇</div>);

describe('AnalysisDetailPage sticky 開始分析 bar', () => {
    it('shows a live parameter summary next to a single 開始分析 button', () => {
        render(<AnalysisDetailPage />);
        const buttons = screen.getAllByRole('button', { name: '開始分析' });
        expect(buttons).toHaveLength(1);
        const bar = buttons[0].closest('.sticky')!;
        expect(bar).toBeInTheDocument();
        expect(bar.className).toContain('safe-area-inset-bottom');

        const summary = screen.getByTestId('params-summary');
        expect(bar).toContainElement(summary);
        expect(summary).toHaveTextContent('尚未選擇曲風');

        fireEvent.click(screen.getAllByText('華爾滋')[0].closest('button')!);
        expect(summary).toHaveTextContent('華爾滋 · 95 BPM · C 大調 · 單人 · 情緒');
    });

    it('runs the existing handleAnalyze (its file check fires) when tapped', () => {
        const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
        render(<AnalysisDetailPage />);
        fireEvent.click(screen.getByRole('button', { name: '開始分析' }));
        expect(alert).toHaveBeenCalledWith(expect.stringContaining('請選擇所有檔案'));
        alert.mockRestore();
    });
});
