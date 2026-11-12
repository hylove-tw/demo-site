import { GENRES } from '../musicCreativeConstants';
import { applyGenre } from '../../components/CompositionParamsForm';
import { dualMusicAnalysisCreative, musicAnalysisCreative } from '../analysisMethods';
import { post } from '../../services/api';

jest.mock('../../services/api', () => ({ post: jest.fn() }));

// music-gen app/api/schemas.py GENRE_CONSTRAINTS; null means no upstream limit.
const limits: Record<string, [number, number] | null> = {
  waltz: [60, 120], soul: [30, 60], blues: [60, 80], tango: [60, 100],
  giliba: [80, 120], rumba: [80, 100], disco: [90, 120], rock: [60, 120],
  country: [60, 100], twist: null, reggae: null, quick_waltz: null, chacha: null,
};

it('keeps each selectable genre range and default within the upstream contract', () => {
  expect(Object.keys(limits).sort()).toEqual(GENRES.map(g => g.id).sort());
  for (const genre of GENRES) {
    const bounds = limits[genre.id];
    const bpm = applyGenre({}, genre.id).bpm!;
    expect(bpm).toBeGreaterThanOrEqual(genre.bpmRange[0]);
    expect(bpm).toBeLessThanOrEqual(genre.bpmRange[1]);
    if (bounds) {
      expect(genre.bpmRange[0]).toBeGreaterThanOrEqual(bounds[0]);
      expect(genre.bpmRange[1]).toBeLessThanOrEqual(bounds[1]);
    }
  }
  expect(applyGenre({}, 'soul').bpm).toBe(50);
});

it.each([undefined, '', 'custom'])('sends a compatible explicit base genre for %s in both analysis paths', async genre => {
  (post as jest.Mock).mockResolvedValue('<score/>');
  await musicAnalysisCreative([[], []], { genre, bpm: 60, melodyPattern: 1 });
  expect(post).toHaveBeenLastCalledWith('/api/v2/music', expect.objectContaining({ music: expect.objectContaining({ genre: 'chacha', bpm: 60, melody: 1 }) }));
  await dualMusicAnalysisCreative([[], []], { genre, bpm: 60 });
  expect(post).toHaveBeenLastCalledWith('/api/v1/dualmusic', expect.objectContaining({ genre: 'chacha', bpm: 60 }));
});

it('clamps a saved soul tempo to the currently displayed range before analysis', async () => {
  (post as jest.Mock).mockResolvedValue('<score/>');
  await musicAnalysisCreative([[], []], { genre: 'soul', bpm: 70 });
  expect(post).toHaveBeenLastCalledWith('/api/v2/music', expect.objectContaining({ music: expect.objectContaining({ genre: 'soul', bpm: 60 }) }));
});

it('keeps soul in the ballad 4/4 preset range and repairs older settings', async () => {
  const soul = GENRES.find(g => g.id === 'soul')!;
  expect(soul.bpmRange).toEqual([40, 60]);
  expect(applyGenre({}, 'soul').melodyPattern).toBe(1);
  (post as jest.Mock).mockResolvedValue('<score/>');
  await musicAnalysisCreative([[], []], { genre: 'soul', bpm: 30, melodyPattern: 2 });
  expect(post).toHaveBeenLastCalledWith('/api/v2/music', expect.objectContaining({ music: expect.objectContaining({ bpm: 40, melody: 1 }) }));
});
