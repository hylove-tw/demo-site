// User-reported: picking 波沙諾瓦 (bossa nova) showed "節奏：乍古芭" in the
// report's settings summary instead of "節奏：波沙諾瓦". Unrelated to the
// beat/genre state-drift fixed earlier today — this preset's Chinese display
// name was simply mistyped when it was first added (nameEn/description have
// always correctly said "Bossa Nova" / "輕柔巴西節奏").
import { BEAT_PRESETS } from '../beatPresets';
import { RHYTHM_ONLY_STYLES } from '../../config/musicCreativeConstants';

describe('BEAT_PRESETS display names', () => {
    it('every preset name is a real Chinese label, not a mistyped placeholder', () => {
        const bossaNova = BEAT_PRESETS.find((b) => b.id === 'bossanova');
        const canonical = RHYTHM_ONLY_STYLES.find((s) => s.beat === 'bossanova')?.nameZh;
        expect(bossaNova?.name).toBe(canonical);
    });
});
