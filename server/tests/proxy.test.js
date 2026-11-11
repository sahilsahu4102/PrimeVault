// Behind a proxy (Render) every request arrives from the proxy's address. In production the app trusts one
// proxy hop, so the rate limit counts each visitor (the address the proxy saw) separately instead of putting
// everybody in one bucket. No database needed. The setting is read once at start-up, hence a file of its own.
import { startApp, client } from './setup.js';
process.env.NODE_ENV = 'production'; // after setup.js and before the app loads
process.env.RATE_LIMIT_MAX = '3';
delete process.env.TRUST_PROXY;

import { test } from 'node:test';
import assert from 'node:assert/strict';

const as = (ip) => ({ headers: { 'X-Forwarded-For': ip } });

test('in production each visitor behind the proxy gets their own rate-limit bucket', async () => {
  const app = await startApp();
  const api = client(app.base);
  try {
    for (let i = 1; i <= 3; i++) assert.equal((await api('/health', as('203.0.113.10'))).status, 200, `visitor A, request ${i}`);
    const blocked = await api('/health', as('203.0.113.10'));
    assert.equal(blocked.status, 429, 'visitor A used their three requests');
    assert.equal(blocked.headers.get('ratelimit-remaining'), '0');

    const other = await api('/health', as('203.0.113.11'));
    assert.equal(other.status, 200, 'visitor B is not blocked by visitor A');
    assert.equal(other.headers.get('ratelimit-remaining'), '2');
  } finally {
    await app.close();
    process.env.NODE_ENV = 'test';
  }
});

test('a visitor cannot dodge the limit by forging the address they claim', async () => {
  // The proxy appends the real address on the right; a forged left part does not change who the limit sees.
  const app = await startApp();
  const api = client(app.base);
  try {
    for (let i = 0; i < 3; i++) await api('/health', as('198.51.100.7, 203.0.113.20'));
    const blocked = await api('/health', as('192.0.2.99, 203.0.113.20'));
    assert.equal(blocked.status, 429, 'same real address, different forged prefix, same bucket');
  } finally {
    await app.close();
    process.env.NODE_ENV = 'test';
  }
});
