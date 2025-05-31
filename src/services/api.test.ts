import { post } from './api';
import axios from 'axios/dist/node/axios.cjs';
import http from 'http';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('post helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls axios with correct args', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });
    const data = await post('/test', { foo: 'bar' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/test',
      { foo: 'bar' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(data).toEqual({ ok: true });
  });

  it('works with real http server', async () => {
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
