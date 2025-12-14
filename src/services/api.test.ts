import { post, ApiError } from './api';
import axios from 'axios';
import http from 'http';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('post helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);
  });

  it('calls axios with correct args including timeout', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });
    const data = await post('/test', { foo: 'bar' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/test',
      { foo: 'bar' },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );
    expect(data).toEqual({ ok: true });
  });

  it('throws ApiError on network failure', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.post.mockRejectedValueOnce(networkError);

    await expect(post('/test', {})).rejects.toThrow(ApiError);
    await expect(post('/test', {})).rejects.toThrow('Network Error');
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

  it('works with real http server', async () => {
    // Restore real axios for this test
    jest.unmock('axios');
    const realAxios = jest.requireActual('axios');
    mockedAxios.post.mockImplementation(realAxios.post);

    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/real') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }
    });
    await new Promise<void>(resolve => {
      server.listen(3100, () => resolve());
    });

    process.env.REACT_APP_ANALYSIS_API_BASE = 'http://localhost:3100';
    const result = await post('/real', { a: 1 });
    expect(result).toEqual({ success: true });
    server.close();
  });
});
