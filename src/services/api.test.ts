import { post } from './api';
import axios from 'axios';
import http from 'http';
import { AddressInfo } from 'net';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('api.post helper', () => {
  const originalBase = process.env.REACT_APP_ANALYSIS_API_BASE;

  afterEach(() => {
    process.env.REACT_APP_ANALYSIS_API_BASE = originalBase;
    jest.resetAllMocks();
  });

  test('sends POST request with axios', async () => {
    process.env.REACT_APP_ANALYSIS_API_BASE = 'http://localhost';
    mockedAxios.post.mockResolvedValue({ data: { ok: true } });
    const result = await post('/path', { foo: 'bar' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost/path',
      { foo: 'bar' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual({ ok: true });
  });

  test('works with real http server', async () => {
    const server = http.createServer((req, res) => {
      const chunks: Uint8Array[] = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ received: Buffer.concat(chunks).toString() }));
      });
    });
    await new Promise(resolve => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    process.env.REACT_APP_ANALYSIS_API_BASE = `http://localhost:${port}`;
    const payload = { hello: 'world' };
    const result = await post('/real', payload);
    expect(result).toEqual({ received: JSON.stringify(payload) });

    await new Promise(resolve => server.close(resolve));
  });
});
