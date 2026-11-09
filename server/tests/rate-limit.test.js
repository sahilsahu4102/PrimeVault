// The production limits (the defaults): 20 sign-in attempts per IP per 15 minutes, 100 requests overall.
// No database needed: invalid logins are rejected by validation, but they still count.
import { startApp, client } from './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('the 21st sign-in attempt in 15 minutes gets 429, and the response says how much is left', async () => {
  const app = await startApp();
  const api = client(app.base);
  try {
    for (let i = 1; i <= 20; i++) {
      const r = await api('/auth/login', { method: 'POST', body: {} });
      assert.equal(r.status, 400, `attempt ${i} should reach validation`);
      assert.equal(r.headers.get('ratelimit-limit'), '20');
    }
    const blocked = await api('/auth/login', { method: 'POST', body: {} });
    assert.equal(blocked.status, 429);
    assert.match(blocked.body.message, /authentication attempts/);
    assert.equal(blocked.headers.get('ratelimit-remaining'), '0');
  } finally {
    await app.close();
  }
});

test('the 101st request overall in 15 minutes gets 429', async () => {
  // The 21 sign-in requests above already count towards the 100, because the general limiter runs first.
  const app = await startApp();
  const api = client(app.base);
  try {
    let allowed = 0;
    for (let i = 0; i < 120; i++) {
      const r = await api('/health');
      if (r.status === 429) {
        assert.match(r.body.message, /Too many requests/);
        break;
      }
      allowed++;
    }
    assert.equal(allowed, 100 - 21);
  } finally {
    await app.close();
  }
});
