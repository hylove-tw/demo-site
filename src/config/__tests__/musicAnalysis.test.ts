import { musicAnalysis } from '../analysisMethods';
import { post } from '../../services/api';
jest.mock('../../services/api', () => ({ post: jest.fn() }));

it('preserves legacy analysis brain data for MP3 generation', async () => {
    (post as jest.Mock).mockResolvedValue('<score/>');
    const before = [{ value: 1 }];
    const after = [{ value: 2 }];
    expect(await musicAnalysis([before, after])).toEqual({ musicXML: '<score/>', _beforeBrainData: before, _afterBrainData: after });
});
