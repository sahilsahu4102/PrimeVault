// The real API over HTTP against a real MySQL (see tests/README.md for the one-line Docker setup).
// Every user created here has an email starting with a per-run prefix and is deleted at the end.
import { startApp, client, cookiePair } from './setup.js';
process.env.RATE_LIMIT_MAX = '100000'; // the limiters have their own test files
process.env.AUTH_RATE_LIMIT_MAX = '100000';

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RUN = `qa${Date.now().toString(36)}`;
const CATEGORY = `Cat-${RUN}`;
const PASSWORD = 'Str0ngPass';
const email = (n) => `${RUN}-${n}@example.com`;
const uuid = () => '00000000-0000-4000-8000-000000000000';

let app, api, dbError;
const u = {}; // alice and bob (users), root (admin): { id, token, cookie }

const register = (n, extra = {}) => api('/auth/register', { method: 'POST', body: { name: `User ${n}`, email: email(n), password: PASSWORD, ...extra } });
const login = (n, password = PASSWORD) => api('/auth/login', { method: 'POST', body: { email: email(n), password } });
const newAsset = (token, over = {}) => api('/assets', { method: 'POST', token, body: { name: `${RUN} Coin`, price: 10, category: CATEGORY, ...over } });

before(async () => {
  try {
    await prisma.user.count(); // fails if the database is down or the tables were never created
  } catch (e) {
    dbError = String(e.message).trim().split('\n').pop();
    return;
  }
  app = await startApp();
  api = client(app.base);
  for (const n of ['alice', 'bob', 'root']) {
    const r = await register(n);
    u[n] = { id: r.body.data.user.id, token: r.body.data.accessToken };
  }
  await prisma.user.update({ where: { email: email('root') }, data: { role: 'ADMIN' } }); // the role is read from the database on every request
});

after(async () => {
  if (!dbError) {
    await prisma.user.deleteMany({ where: { email: { startsWith: RUN } } }); // their assets go with them
    await app.close();
  }
  await prisma.$disconnect();
});

const it = (name, fn) => test(name, async (t) => {
  if (dbError) return t.skip(`no test database: ${dbError}`);
  await fn(t);
});

// ── Authentication ────────────────────────────────────────────────────────────

it('registering returns the user without secrets and sets a refresh cookie scripts cannot read', async () => {
  const r = await register('reg1');
  assert.equal(r.status, 201);
  assert.equal(r.body.data.user.email, email('reg1'));
  assert.equal(r.body.data.user.role, 'USER');
  assert.ok(r.body.data.accessToken);
  assert.ok(!('password' in r.body.data.user) && !('refreshToken' in r.body.data.user));
  const cookie = r.cookies.find((c) => c.startsWith('refreshToken='));
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  const row = await prisma.user.findUnique({ where: { email: email('reg1') } });
  assert.match(row.password, /^\$2[aby]\$12\$/); // a bcrypt hash with cost 12, never the password
});

it('the same email cannot register twice, whatever its capitals', async () => {
  assert.equal((await register('dup')).status, 201);
  const again = await api('/auth/register', { method: 'POST', body: { name: 'Dup', email: email('dup').toUpperCase(), password: PASSWORD } });
  assert.equal(again.status, 409);
});

it('a weak password is refused and the response names the field', async () => {
  const r = await register('weak', { password: 'password' });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.some((e) => e.field === 'password'));
});

it('registration cannot create an admin', async () => {
  const r = await register('sneaky', { role: 'ADMIN' });
  assert.equal(r.status, 403);
  assert.equal(await prisma.user.count({ where: { email: email('sneaky') } }), 0);
  const asUser = await register('plain', { role: 'USER' });
  assert.equal(asUser.status, 201);
  assert.equal(asUser.body.data.user.role, 'USER');
});

it('login: the right password works; a wrong password and an unknown email get the same 401', async () => {
  const ok = await login('alice');
  assert.equal(ok.status, 200);
  assert.ok(ok.body.data.accessToken);
  assert.ok(ok.cookies.some((c) => c.startsWith('refreshToken=')));
  const wrong = await login('alice', 'Wr0ngPassword');
  const unknown = await api('/auth/login', { method: 'POST', body: { email: email('nobody'), password: PASSWORD } });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.body.message, unknown.body.message); // does not reveal which emails exist
});

it('/auth/me returns the profile with the number of assets', async () => {
  const r = await api('/auth/me', { token: u.alice.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.user.email, email('alice'));
  assert.equal(typeof r.body.data.user._count.assets, 'number');
});

it('requests without a good access token are refused', async () => {
  const get = (token) => api('/auth/me', { token });
  assert.equal((await api('/auth/me')).status, 401);
  assert.equal((await get('garbage')).status, 401);
  const expired = jwt.sign({ userId: u.alice.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: -10 });
  assert.match((await get(expired)).body.message, /expired/);
  const forged = jwt.sign({ userId: u.alice.id }, 'not-the-secret');
  assert.equal((await get(forged)).status, 401);
  const refreshAsAccess = jwt.sign({ userId: u.alice.id }, process.env.JWT_REFRESH_SECRET);
  assert.equal((await get(refreshAsAccess)).status, 401); // the two secrets are not interchangeable
});

it('a token for a user who was deleted stops working at once', async () => {
  const r = await register('ghost');
  await prisma.user.delete({ where: { email: email('ghost') } });
  const me = await api('/auth/me', { token: r.body.data.accessToken });
  assert.equal(me.status, 401);
  assert.match(me.body.message, /no longer exists/);
});

it('refresh gives a new access token and rotates the refresh token, so the old one stops working', async () => {
  const first = cookiePair((await login('alice')).cookies[0]);
  await sleep(1100); // tokens are time-stamped to the second, so a refresh in the same second would be identical
  const r = await api('/auth/refresh', { method: 'POST', cookie: first });
  assert.equal(r.status, 200);
  const second = cookiePair(r.cookies[0]);
  assert.notEqual(second, first);
  assert.equal((await api('/auth/me', { token: r.body.data.accessToken })).status, 200);
  assert.equal((await api('/auth/refresh', { method: 'POST', cookie: first })).status, 401); // rotated out
  assert.equal((await api('/auth/refresh', { method: 'POST', cookie: second })).status, 200);
});

it('refresh refuses a missing, garbage or wrongly signed token', async () => {
  const bad = (cookie) => api('/auth/refresh', { method: 'POST', cookie }).then((r) => r.status);
  assert.equal(await bad(undefined), 401);
  assert.equal(await bad('refreshToken=garbage'), 401);
  const wrongSecret = jwt.sign({ userId: u.alice.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '7d' });
  assert.equal(await bad(`refreshToken=${wrongSecret}`), 401);
});

it('a page on another site cannot refresh a session: an unlisted Origin is refused before it reaches the handler', async () => {
  const cookie = cookiePair((await login('alice')).cookies[0]);
  const evil = await api('/auth/refresh', { method: 'POST', cookie, headers: { Origin: 'http://evil.example' } });
  assert.ok(evil.status >= 400);
  assert.equal(evil.cookies.length, 0); // no new cookie, so nothing was rotated
  const good = await api('/auth/refresh', { method: 'POST', cookie, headers: { Origin: 'http://localhost:5173' } });
  assert.equal(good.status, 200); // the same cookie still works from the real client
});

it('logout kills the refresh token and clears the cookie; it needs a login', async () => {
  const r = await login('bob');
  const cookie = cookiePair(r.cookies[0]);
  assert.equal((await api('/auth/logout', { method: 'POST' })).status, 401);
  const out = await api('/auth/logout', { method: 'POST', token: r.body.data.accessToken });
  assert.equal(out.status, 200);
  assert.ok(out.cookies.some((c) => /^refreshToken=;/.test(c)));
  assert.equal((await api('/auth/refresh', { method: 'POST', cookie })).status, 401);
});

// ── Roles ─────────────────────────────────────────────────────────────────────

it('a normal user cannot list users; an admin can, and no password or token is ever in the list', async () => {
  const denied = await api('/users', { token: u.alice.token });
  assert.equal(denied.status, 403);
  assert.match(denied.body.message, /Required role\(s\): ADMIN/);
  const ok = await api(`/users?search=${RUN}`, { token: u.root.token });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.data.users.length >= 3);
  assert.ok(ok.body.data.pagination.total >= 3);
  assert.ok(!/password|refreshToken/i.test(ok.text));
});

it('an admin can read a user and change a role; bad roles, unknown users and non-admins are refused', async () => {
  const target = (await register('promote')).body.data.user.id;
  assert.equal((await api(`/users/${target}`, { token: u.root.token })).body.data.user.email, email('promote'));
  assert.equal((await api(`/users/${target}/role`, { method: 'PATCH', token: u.alice.token, body: { role: 'ADMIN' } })).status, 403);
  assert.equal((await api(`/users/${target}/role`, { method: 'PATCH', token: u.root.token, body: { role: 'SUPERUSER' } })).status, 400);
  assert.equal((await api(`/users/${uuid()}/role`, { method: 'PATCH', token: u.root.token, body: { role: 'ADMIN' } })).status, 404);
  const ok = await api(`/users/${target}/role`, { method: 'PATCH', token: u.root.token, body: { role: 'ADMIN' } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.user.role, 'ADMIN');
});

it('deleting a user also deletes their assets', async () => {
  const r = await register('doomed');
  const asset = (await newAsset(r.body.data.accessToken)).body.data.asset;
  assert.equal((await api(`/users/${r.body.data.user.id}`, { method: 'DELETE', token: u.alice.token })).status, 403);
  assert.equal((await api(`/users/${r.body.data.user.id}`, { method: 'DELETE', token: u.root.token })).status, 200);
  assert.equal((await api(`/assets/${asset.id}`, { token: u.alice.token })).status, 404);
});

// ── Assets ────────────────────────────────────────────────────────────────────

it('creating an asset: the owner is the caller even if the body names someone else, and the price comes back as price', async () => {
  const r = await newAsset(u.alice.token, { price: 2500.75, userId: u.bob.id });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.asset.user.id, u.alice.id);
  assert.equal(r.body.data.asset.price, 2500.75);
  assert.ok(!('volume' in r.body.data.asset));
});

it('creating an asset refuses bad input and anonymous callers', async () => {
  assert.equal((await newAsset(u.alice.token, { price: -1 })).status, 400);
  assert.equal((await newAsset(u.alice.token, { category: undefined })).status, 400);
  assert.equal((await newAsset(undefined)).status, 401);
});

it('listing: pagination, search, category filter, active filter and sorting', async () => {
  const cat = `${CATEGORY}-list`; // a category of its own, so other tests' assets cannot change the counts
  const prices = { A: 5, B: 3, C: 1, D: 4, E: 2 };
  for (const [k, price] of Object.entries(prices)) await newAsset(u.alice.token, { name: `${RUN} Zeta ${k}`, price, category: cat });
  await newAsset(u.alice.token, { name: `${RUN} Zeta off`, price: 9, isActive: false, category: cat });
  const list = (q) => api(`/assets?category=${cat}&${q}`, { token: u.bob.token }).then((r) => r.body.data);

  const page2 = await list('limit=2&page=2&sortBy=price&order=asc');
  assert.deepEqual(page2.assets.map((a) => a.price), [3, 4]);
  assert.equal(page2.pagination.page, 2);
  assert.equal(page2.pagination.limit, 2);
  assert.ok(page2.pagination.total >= 6 && page2.pagination.totalPages >= 3);

  assert.equal((await list(`search=${RUN}+Zeta+C`)).assets.length, 1);
  assert.equal((await list('isActive=false')).assets.every((a) => a.isActive === false), true);
  const desc = await list('sortBy=price&order=desc&limit=1');
  assert.equal(desc.assets[0].price, 9);
  assert.equal((await api('/assets?sortBy=userId', { token: u.bob.token })).status, 400);
  assert.equal((await api('/assets?limit=1000', { token: u.bob.token })).status, 400);
});

it('categories lists each category once', async () => {
  await newAsset(u.alice.token);
  const cats = (await api('/assets/categories', { token: u.bob.token })).body.data.categories;
  assert.equal(cats.filter((c) => c === CATEGORY).length, 1);
});

it('one asset can be read by id; an unknown id is 404', async () => {
  const asset = (await newAsset(u.alice.token)).body.data.asset;
  assert.equal((await api(`/assets/${asset.id}`, { token: u.bob.token })).body.data.asset.id, asset.id);
  assert.equal((await api(`/assets/${uuid()}`, { token: u.bob.token })).status, 404);
});

it('only the owner or an admin can change or delete an asset', async () => {
  const asset = (await newAsset(u.alice.token, { price: 10 })).body.data.asset;
  const url = `/assets/${asset.id}`;
  assert.equal((await api(url, { method: 'PUT', token: u.bob.token, body: { price: 1 } })).status, 403);
  assert.equal((await api(url, { method: 'DELETE', token: u.bob.token })).status, 403);
  assert.equal((await api(url, { method: 'PUT', token: u.alice.token, body: {} })).status, 400); // nothing to update
  const mine = await api(url, { method: 'PUT', token: u.alice.token, body: { price: 11.5, stock: 3 } });
  assert.equal(mine.status, 200);
  assert.equal(mine.body.data.asset.price, 11.5);
  assert.equal(mine.body.data.asset.stock, 3);
  assert.equal((await api(url, { method: 'PUT', token: u.root.token, body: { name: 'Edited by admin' } })).status, 200);
  assert.equal((await api(url, { method: 'DELETE', token: u.root.token })).status, 200);
  assert.equal((await api(url, { token: u.alice.token })).status, 404);
});

it('every asset route needs a login', async () => {
  for (const [method, path] of [['GET', '/assets'], ['POST', '/assets'], ['GET', `/assets/${uuid()}`], ['PUT', `/assets/${uuid()}`], ['DELETE', `/assets/${uuid()}`]]) {
    assert.equal((await api(path, { method, body: method === 'GET' ? undefined : {} })).status, 401, `${method} ${path}`);
  }
});

// ── The platform around it ────────────────────────────────────────────────────

it('health answers, and an unknown route is a JSON 404', async () => {
  const h = await api('/health');
  assert.equal(h.status, 200);
  assert.equal(h.body.success, true);
  const nope = await api('/nothing-here');
  assert.equal(nope.status, 404);
  assert.match(nope.body.message, /Route GET \/api\/v1\/nothing-here not found/);
});

it('security headers are on, and only the configured origin gets CORS access', async () => {
  const plain = await api('/health');
  assert.equal(plain.headers.get('x-powered-by'), null);
  assert.equal(plain.headers.get('x-content-type-options'), 'nosniff');
  const good = await api('/health', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(good.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal(good.headers.get('access-control-allow-credentials'), 'true');
  const evil = await api('/health', { headers: { Origin: 'http://evil.example' } });
  assert.equal(evil.headers.get('access-control-allow-origin'), null);
  assert.ok(evil.status >= 400);
});

it('a request body over 10 KB is refused', async () => {
  const r = await api('/auth/login', { method: 'POST', body: { email: 'a@b.co', password: 'x'.repeat(11_000) } });
  assert.equal(r.status, 413);
});

it('the interactive API docs are served', async () => {
  const res = await fetch(app.base.replace('/api/v1', '/api-docs/'));
  assert.equal(res.status, 200);
  assert.match(await res.text(), /swagger/i);
});
