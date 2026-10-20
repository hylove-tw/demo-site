import { post, ApiError } from './api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const ORIGINAL_API_BASE = process.env.REACT_APP_ANALYSIS_API_BASE;

function loadApi(base: string | undefined) {
  jest.resetModules();
  if (base === undefined) delete process.env.REACT_APP_ANALYSIS_API_BASE;
  else process.env.REACT_APP_ANALYSIS_API_BASE = base;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const api = require('./api') as typeof import('./api');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axiosModule = require('axios');
  const axiosFresh = (typeof axiosModule.post === 'function' ? axiosModule : axiosModule.default) as jest.Mocked<typeof axios>;
  return { post: api.post, axios: axiosFresh };
}

describe('post helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);
  });

  it('calls axios with correct args including timeout', async () => {
    const loaded = loadApi(undefined);
    loaded.axios.post.mockResolvedValueOnce({ data: { ok: true } });
    const data = await loaded.post('/test', { foo: 'bar' });
    expect(loaded.axios.post).toHaveBeenCalledWith(
      '/test',
      { foo: 'bar' },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );
    expect(data).toEqual({ ok: true });
  });

  it('keeps analysis calls on the same origin when the base is blank or "/"', async () => {
    for (const base of ['', '   ', '/']) {
      const loaded = loadApi(base);
      loaded.axios.post.mockResolvedValueOnce({ data: { ok: true } });
      await loaded.post('/api/v1/music', { a: 1 });
      expect(loaded.axios.post).toHaveBeenCalledWith(
        '/api/v1/music',
        { a: 1 },
        expect.objectContaining({ timeout: 60000 }),
      );
    }
  });

  it('uses an explicit REACT_APP_ANALYSIS_API_BASE and strips a trailing slash', async () => {
    const loaded = loadApi('http://localhost:3100/');
    loaded.axios.post.mockResolvedValueOnce({ data: { ok: true } });
    const data = await loaded.post('/api/v1/music', { a: 1 });
    expect(loaded.axios.post).toHaveBeenCalledWith(
      'http://localhost:3100/api/v1/music',
      { a: 1 },
      expect.objectContaining({ timeout: 60000 }),
    );
    expect(data).toEqual({ ok: true });
  });

  it('throws ApiError on network failure', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.post.mockRejectedValueOnce(networkError);

    const result = post('/test', {});
    await expect(result).rejects.toThrow(ApiError);
    await expect(result).rejects.toThrow('Network Error');
  });

  it('throws ApiError with status code on HTTP error', async () => {
    const axiosError = {
      response: {
        status: 422,
        data: { message: 'Validation failed' },
      },
      code: 'ERR_BAD_REQUEST',
    };
    mockedAxios.post.mockRejectedValueOnce(axiosError);
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

    try {
      await post('/test', {});
      fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('Validation failed');
      expect((error as ApiError).statusCode).toBe(422);
    }
  });

  it('handles timeout errors', async () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      response: undefined,
    };
    mockedAxios.post.mockRejectedValueOnce(timeoutError);
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

    try {
      await post('/test', {});
      fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('請求超時，請稍後再試');
    }
  });

  it('handles connection errors', async () => {
    const connectionError = {
      code: 'ERR_NETWORK',
      response: undefined,
    };
    mockedAxios.post.mockRejectedValueOnce(connectionError);
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

    try {
      await post('/test', {});
      fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('無法連接到伺服器，請檢查網路連線');
    }
  });

});

afterAll(() => {
  if (ORIGINAL_API_BASE === undefined) delete process.env.REACT_APP_ANALYSIS_API_BASE;
  else process.env.REACT_APP_ANALYSIS_API_BASE = ORIGINAL_API_BASE;
});
