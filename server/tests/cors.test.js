// CLIENT_URL is a comma-separated list of the client origins allowed to call the API with credentials.
// It is easy to paste with a trailing slash or stray spaces, which used to refuse every browser request
// (a browser's Origin header never ends in a slash). No database needed; the list is read once at start-up.
import { startApp, client } from './setup.js';
process.env.CLIENT_URL = 'https://app.example.vercel.app/, http://localhost:5173//  ,http://127.0.0.1:5174'; // after setup.js, before the app loads

import { test } from 'node:test';
import assert from 'node:assert/strict';

test('a CLIENT_URL written with trailing slashes and spaces still allows the real origins', async () => {
  const app = await startApp();
  const api = client(app.base);
  try {
    for (const origin of ['https://app.example.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5174']) {
      const r = await api('/health', { headers: { Origin: origin } });
      assert.equal(r.status, 200, origin);
      assert.equal(r.headers.get('access-control-allow-origin'), origin, origin);
      assert.equal(r.headers.get('access-control-allow-credentials'), 'true');
    }
    const pre = await api('/auth/guest', { method: 'OPTIONS', headers: { Origin: 'https://app.example.vercel.app', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(pre.status, 204, 'the browser preflight succeeds');
    assert.equal(pre.headers.get('access-control-allow-origin'), 'https://app.example.vercel.app');
  } finally {
    await app.close();
  }
});

test('other origins are refused with a plain 403 and get no CORS permission', async () => {
  const app = await startApp();
  const api = client(app.base);
  try {
    for (const origin of ['https://evil.example', 'http://localhost:5173.evil.example', 'http://app.example.vercel.app', 'https://app.example.vercel.app.evil.example']) {
      const r = await api('/health', { headers: { Origin: origin } });
      assert.equal(r.status, 403, origin);
      assert.equal(r.body.message, 'Not allowed by CORS');
      assert.equal(r.headers.get('access-control-allow-origin'), null, origin);
    }
    assert.equal((await api('/health')).status, 200, 'no Origin header (curl, same-origin) is still fine');
  } finally {
    await app.close();
  }
});
