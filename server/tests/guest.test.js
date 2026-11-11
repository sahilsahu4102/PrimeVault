// Guest sessions: POST /auth/guest makes a temporary USER account that expires. Needs the test database.
// GUEST_MAX is read once when the app starts, which is why this has a test file (and process) of its own.
import { startApp, client, cookiePair } from './setup.js';
process.env.GUEST_MAX = '3'; // after setup.js and before the app loads
process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.RATE_LIMIT_MAX = '100000';

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const isGuest = { email: { endsWith: '@guest.invalid' } };
let dbError = null;
try { await prisma.user.count(); } catch (e) { dbError = String(e.message).trim().split('\n').pop(); }

let app, api;
before(async () => {
  if (dbError) return;
  await prisma.user.deleteMany({ where: isGuest }); // the cap test counts every guest, so start from none
  app = await startApp();
  api = client(app.base);
});
after(async () => {
  if (!dbError) {
    await prisma.user.deleteMany({ where: isGuest }); // their assets go with them
    await app.close();
  }
  await prisma.$disconnect();
});

const it = (name, fn) => test(name, async (t) => {
  if (dbError) return t.skip(`no test database: ${dbError}`);
  await fn(t);
});
const guest = () => api('/auth/guest', { method: 'POST' });

it('a guest session is a normal USER with tokens, a script-proof refresh cookie and no usable password', async () => {
  const r = await guest();
  assert.equal(r.status, 201);
  const { user, accessToken } = r.body.data;
  assert.equal(user.role, 'USER');
  assert.match(user.name, /^Guest [0-9A-F]{4}$/);
  assert.match(user.email, /^guest-[0-9a-f-]{36}@guest\.invalid$/);
  assert.equal(user.password, undefined);

  const cookie = r.cookies.find((c) => c.startsWith('refreshToken='));
  assert.ok(cookie && /HttpOnly/i.test(cookie), 'refresh token is an httpOnly cookie');
  assert.equal((await api('/auth/me', { token: accessToken })).body.data.user.id, user.id);
  assert.equal((await api('/auth/refresh', { method: 'POST', cookie: cookiePair(cookie) })).status, 200, 'refresh works');

  const stored = await prisma.user.findUnique({ where: { id: user.id } });
  assert.ok(stored.password.startsWith('!'), 'the stored password is not a bcrypt hash');
  assert.equal((await api('/auth/login', { method: 'POST', body: { email: user.email, password: stored.password } })).status, 400, 'the reserved address cannot even be used to sign in');
});

it('a guest can create and delete their own asset but cannot reach the users routes', async () => {
  const { accessToken: token } = (await guest()).body.data;
  const made = await api('/assets', { method: 'POST', token, body: { name: 'Guest Coin', price: 1.5, category: 'Guest Test' } });
  assert.equal(made.status, 201);
  assert.equal((await api(`/assets/${made.body.data.asset.id}`, { method: 'DELETE', token })).status, 200);
  assert.equal((await api('/users', { token })).status, 403);
});

it('nobody can register on the reserved guest address', async () => {
  const r = await api('/auth/register', { method: 'POST', body: { name: 'Fake Guest', email: 'someone@guest.invalid', password: 'Str0ngPass' } });
  assert.equal(r.status, 400);
});

it('guests older than 24 hours are deleted, with their assets, when the next guest starts', async () => {
  const old = (await guest()).body.data;
  const made = await api('/assets', { method: 'POST', token: old.accessToken, body: { name: 'Old Guest Coin', price: 2, category: 'Guest Test' } });
  assert.equal(made.status, 201);
  await prisma.user.update({ where: { id: old.user.id }, data: { createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) } });

  assert.equal((await guest()).status, 201);
  assert.equal(await prisma.user.count({ where: { id: old.user.id } }), 0, 'the expired guest is gone');
  assert.equal(await prisma.asset.count({ where: { id: made.body.data.asset.id } }), 0, 'and so is their asset');
});

it('the admin user list and its total leave temporary guests out', async () => {
  await prisma.user.deleteMany({ where: isGuest });
  const adminEmail = `guest-admin-${Date.now()}@example.com`;
  const reg = await api('/auth/register', { method: 'POST', body: { name: 'Guest Admin Check', email: adminEmail, password: 'Str0ngPass' } });
  await prisma.user.update({ where: { id: reg.body.data.user.id }, data: { role: 'ADMIN' } });
  const token = reg.body.data.accessToken;
  try {
    const g = (await guest()).body.data.user;
    const list = await api('/users?limit=100&search=Guest', { token });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.users.some((u) => u.email === adminEmail), 'real users are still listed');
    assert.ok(!list.body.data.users.some((u) => u.id === g.id), 'the guest is not listed');
    const everyone = await api('/users?limit=100', { token });
    assert.ok(everyone.body.data.users.every((u) => !u.email.endsWith('@guest.invalid')));
    assert.equal(everyone.body.data.pagination.total, await prisma.user.count({ where: { NOT: isGuest } }), 'the total does not count guests');
  } finally {
    await prisma.user.delete({ where: { id: reg.body.data.user.id } });
  }
});

it('once GUEST_MAX guests exist the next one gets a plain 503, and a real account still works', async () => {
  await prisma.user.deleteMany({ where: isGuest });
  for (let i = 0; i < 3; i += 1) assert.equal((await guest()).status, 201);

  const full = await guest();
  assert.equal(full.status, 503);
  assert.match(full.body.message, /create an account instead/i);

  const real = await api('/auth/register', { method: 'POST', body: { name: 'Real Person', email: `guest-cap-${Date.now()}@example.com`, password: 'Str0ngPass' } });
  assert.equal(real.status, 201);
  await prisma.user.delete({ where: { id: real.body.data.user.id } });
});
