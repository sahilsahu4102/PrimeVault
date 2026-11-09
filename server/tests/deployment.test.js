// The Secure cookie in production. Needs the test database. (The ALLOW_ADMIN_SIGNUP switch is read once
// when the app starts, so its test is in admin-signup.test.js: every test file runs in a fresh process.)
import { startApp, client } from './setup.js';
process.env.AUTH_RATE_LIMIT_MAX = '1000';

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RUN = `dep${Date.now().toString(36)}`;
let dbError = null;
try { await prisma.user.count(); } catch (e) { dbError = String(e.message).trim().split('\n').pop(); }

after(async () => {
  if (!dbError) await prisma.user.deleteMany({ where: { email: { startsWith: RUN } } });
  await prisma.$disconnect();
});

const it = (name, fn) => test(name, async (t) => {
  if (dbError) return t.skip(`no test database: ${dbError}`);
  await fn();
});

const signup = (api, n, role) => api('/auth/register', { method: 'POST', body: { name: 'Deploy Test', email: `${RUN}-${n}@example.com`, password: 'Str0ngPass', ...(role ? { role } : {}) } });

it('in production the refresh cookie is Secure, HttpOnly and SameSite=None, so a client on another site can use it, and logout clears it the same way', async () => {
  process.env.NODE_ENV = 'production';
  const app = await startApp();
  try {
    const api = client(app.base);
    const r = await signup(api, 'prod');
    assert.equal(r.status, 201);
    const cookie = r.cookies.find((c) => c.startsWith('refreshToken='));
    assert.match(cookie, /; Secure/i);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=None/i); // Strict cookies are never sent across sites, which broke silent refresh
    const out = await api('/auth/logout', { method: 'POST', token: r.body.data.accessToken });
    const cleared = out.cookies.find((c) => c.startsWith('refreshToken=;'));
    assert.match(cleared, /; Secure/i); // a browser only removes it if the attributes match
    assert.match(cleared, /SameSite=None/i);
  } finally {
    await app.close();
    process.env.NODE_ENV = 'test';
  }
});

