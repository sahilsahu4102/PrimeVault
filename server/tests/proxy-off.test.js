// TRUST_PROXY=0 switches proxy trust off: the forwarded address is ignored and every request counts against
// the address the socket saw. This documents what the setting does. No database needed.
import { startApp, client } from './setup.js';
process.env.TRUST_PROXY = '0';
process.env.RATE_LIMIT_MAX = '3';

import { test } from 'node:test';
import assert from 'node:assert/strict';

test('with TRUST_PROXY=0 the forwarded address is ignored, so visitors share one bucket', async () => {
  const app = await startApp();
  const api = client(app.base);
  try {
    for (let i = 1; i <= 3; i++) assert.equal((await api('/health', { headers: { 'X-Forwarded-For': `203.0.113.${i}` } })).status, 200);
    assert.equal((await api('/health', { headers: { 'X-Forwarded-For': '203.0.113.99' } })).status, 429);
  } finally {
    await app.close();
  }
});
