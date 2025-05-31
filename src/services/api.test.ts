
import axios from 'axios';
import http from 'http';
import { post } from './api';

describe('api helper', () => {
  it('uses axios for POST requests', async () => {
    const spy = jest.spyOn(axios, 'post').mockResolvedValue({ data: { ok: 1 } });
    const result = await post('/test', { a: 1 });
    expect(spy).toHaveBeenCalledWith(
      'http://localhost:3000/test',
      { a: 1 },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual({ ok: 1 });
    spy.mockRestore();
  });

  it('performs a real HTTP POST', async () => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: JSON.parse(body) }));
      });
    });

    await new Promise(resolve => server.listen(0, resolve));
    const { port } = server.address() as any;
    process.env.REACT_APP_ANALYSIS_API_BASE = `http://localhost:${port}`;

    const result = await post('/echo', { hello: 'world' });
    expect(result).toEqual({ received: { hello: 'world' } });

    server.close();
=======
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
