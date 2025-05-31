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
  });
});
