import { resolveBaseUrl, DEFAULT_ANALYSIS_API_BASE, DEFAULT_MUSIC_GEN_URL } from '../apiBase';

describe('resolveBaseUrl', () => {
  it('uses the same-origin fallback when the value is missing', () => {
    expect(resolveBaseUrl(undefined, DEFAULT_MUSIC_GEN_URL)).toBe('/api/music-gen');
    expect(resolveBaseUrl(undefined, DEFAULT_ANALYSIS_API_BASE)).toBe('');
  });

  it('uses the fallback when the value is blank or only a slash', () => {
    expect(resolveBaseUrl('', DEFAULT_MUSIC_GEN_URL)).toBe('/api/music-gen');
    expect(resolveBaseUrl('   ', DEFAULT_MUSIC_GEN_URL)).toBe('/api/music-gen');
    expect(resolveBaseUrl('/', DEFAULT_ANALYSIS_API_BASE)).toBe('');
    expect(resolveBaseUrl('/', DEFAULT_MUSIC_GEN_URL)).toBe('/api/music-gen');
  });

  it('keeps an explicit override and strips trailing slashes', () => {
    expect(resolveBaseUrl('https://backend.example/', DEFAULT_ANALYSIS_API_BASE))
      .toBe('https://backend.example');
    expect(resolveBaseUrl(' https://backend.example/api/music-gen/ ', DEFAULT_MUSIC_GEN_URL))
      .toBe('https://backend.example/api/music-gen');
  });
});
