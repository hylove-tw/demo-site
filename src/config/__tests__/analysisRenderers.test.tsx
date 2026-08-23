// Highcharts touches CSS APIs jsdom doesn't implement (tk.CSS?.supports),
// and analysisRenderers.tsx pulls it in at module load for an unrelated
// chart renderer — mock both out since these tests never touch that path.
jest.mock('highcharts', () => ({}));
jest.mock('highcharts-react-official', () => ({ __esModule: true, default: () => null }));

import { renderBrainWaveMusicReport, renderDualMusicReportCreative } from '../analysisRenderers';

// User-reported: picking samba, then opening the generated report showed
// "節奏：流行" (pop) instead of samba, with a JS interaction that clamped BPM
// display. Root cause: initialParams was built by copying customParams field
// by field, and `beat` was never one of the fields copied — even though
// RHYTHM_ONLY_STYLES (samba/bossa_nova) and manual overrides set it
// explicitly on the real form state. With `beat` missing, the GENRE_BEAT_MAP
// fallback kicked in and guessed from the *borrowed* genre (chacha -> pop)
// instead of the style actually chosen.
describe('report renderers carry the chosen beat through, not just genre', () => {
    it('renderBrainWaveMusicReport keeps an explicit beat (e.g. samba) instead of guessing from genre', () => {
        const element = renderBrainWaveMusicReport('<score/>', {
            genre: 'chacha', // samba's borrowed baseGenre
            beat: 'samba',
            bpm: 175,
        }) as React.ReactElement<any>;
        expect(element.props.initialParams.beat).toBe('samba');
    });

    it('still falls back to GENRE_BEAT_MAP when no explicit beat was chosen', () => {
        const element = renderBrainWaveMusicReport('<score/>', {
            genre: 'reggae',
        }) as React.ReactElement<any>;
        expect(element.props.initialParams.beat).toBe('reggae');
    });

    it('renderDualMusicReportCreative keeps an explicit beat the same way', () => {
        const element = renderDualMusicReportCreative('<score/>', {
            genre: 'chacha',
            beat: 'bossanova',
            bpm: 125,
        }) as React.ReactElement<any>;
        expect(element.props.initialParams.beat).toBe('bossanova');
    });
});
