import { render } from '@testing-library/react';
import { BeatPatternStaff } from '../BeatPatternStaff';

describe('BeatPatternStaff', () => {
    it('draws one notehead per beat', () => {
        const { container } = render(<BeatPatternStaff pattern="重-輕-輕" />);
        expect(container.querySelectorAll('ellipse')).toHaveLength(3);
    });

    it('fills the stressed beats and leaves the rest open', () => {
        const { container } = render(<BeatPatternStaff pattern="重-輕-重-輕" />);
        const filled = Array.from(container.querySelectorAll('ellipse'))
            .filter((e) => e.getAttribute('fill') === 'currentColor');
        expect(filled).toHaveLength(2);
    });

    it('draws a barline at each end', () => {
        const { container } = render(<BeatPatternStaff pattern="重-輕" />);
        // 1 staff line + 2 barlines + 1 stem per beat
        const lines = container.querySelectorAll('line');
        expect(lines.length).toBe(1 + 2 + 2);
    });

    it('describes itself for screen readers', () => {
        const { getByRole } = render(<BeatPatternStaff pattern="重-輕-輕" />);
        expect(getByRole('img')).toHaveAttribute('aria-label', '節拍：重-輕-輕');
    });

    it('renders nothing for an empty pattern', () => {
        const { container } = render(<BeatPatternStaff pattern="" />);
        expect(container.querySelector('svg')).toBeNull();
    });
});
