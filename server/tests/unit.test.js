// No database needed: validation, role checks, token checks that fail early, and error mapping.
import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const { default: validate } = await import('../src/middleware/validate.middleware.js');
const { default: authorize } = await import('../src/middleware/rbac.middleware.js');
const { default: authenticate } = await import('../src/middleware/auth.middleware.js');
const { default: errorHandler } = await import('../src/middleware/error.middleware.js');
const { default: ApiError } = await import('../src/utils/ApiError.js');
const { registerSchema, loginSchema } = await import('../src/modules/auth/auth.validation.js');
const { createAssetSchema, updateAssetSchema, assetQuerySchema } = await import('../src/modules/assets/asset.validation.js');

// Run a middleware and report what it did: the error it passed on, or the request it let through.
const run = (mw, req) => new Promise((resolve) => mw(req, {}, (err) => resolve({ err, req })));
const fakeRes = () => ({ status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });

const GOOD_USER = { name: 'Ada Lovelace', email: 'Ada@Example.com', password: 'Str0ngPass' };
const GOOD_ASSET = { name: 'Ethereum', price: 3000.5, category: 'Layer 1' };

test('registration cleans the input: trims the name and lowercases the email', async () => {
  const { err, req } = await run(validate({ body: registerSchema }), { body: { ...GOOD_USER, name: '  Ada Lovelace  ' } });
  assert.equal(err, undefined);
  assert.equal(req.body.email, 'ada@example.com');
  assert.equal(req.body.name, 'Ada Lovelace');
});

for (const [why, password] of [['too short', 'Ab1'], ['no uppercase', 'lowercase1'], ['no lowercase', 'UPPERCASE1'], ['no digit', 'NoDigitsHere']]) {
  test(`registration rejects a password that is ${why}`, async () => {
    const { err } = await run(validate({ body: registerSchema }), { body: { ...GOOD_USER, password } });
    assert.equal(err.statusCode, 400);
    assert.equal(err.errors[0].field, 'password');
  });
}

test('registration reports every bad field at once, with the field name', async () => {
  const { err } = await run(validate({ body: registerSchema }), { body: { name: 'A', email: 'nope', password: 'x' } });
  assert.deepEqual([...new Set(err.errors.map((e) => e.field))].sort(), ['email', 'name', 'password']);
  assert.ok(err.errors.every((e) => !e.message.includes('"')));
});

test('unknown fields are stripped, which blocks mass assignment', async () => {
  const { req } = await run(validate({ body: createAssetSchema }), { body: { ...GOOD_ASSET, userId: 'someone-else', id: 'x', createdAt: '2000-01-01' } });
  assert.deepEqual(Object.keys(req.body).sort(), ['category', 'isActive', 'name', 'price', 'stock']);
});

test('login needs a valid email and any password', async () => {
  assert.equal((await run(validate({ body: loginSchema }), { body: { email: 'a@b.co', password: 'x' } })).err, undefined);
  assert.equal((await run(validate({ body: loginSchema }), { body: { email: 'a@b.co' } })).err.statusCode, 400);
});

test('asset rules: price must be positive, stock a whole number from zero, update needs a field', async () => {
  const bad = (schema, body) => run(validate({ body: schema }), { body }).then((r) => r.err?.statusCode);
  assert.equal(await bad(createAssetSchema, { ...GOOD_ASSET, price: 0 }), 400);
  assert.equal(await bad(createAssetSchema, { ...GOOD_ASSET, price: -5 }), 400);
  assert.equal(await bad(createAssetSchema, { ...GOOD_ASSET, stock: -1 }), 400);
  assert.equal(await bad(createAssetSchema, { ...GOOD_ASSET, stock: 1.5 }), 400);
  assert.equal(await bad(createAssetSchema, { price: 1, category: 'DeFi' }), 400); // no name
  assert.equal(await bad(updateAssetSchema, {}), 400);
  assert.equal(await bad(updateAssetSchema, { stock: 3 }), undefined);
});

test('asset list query: defaults, a page-size cap and a sort whitelist', async () => {
  const ok = await run(validate({ query: assetQuerySchema }), { query: {} });
  assert.equal(ok.req.query.page, 1);
  assert.equal(ok.req.query.limit, 10);
  assert.equal(ok.req.query.sortBy, 'createdAt');
  assert.equal((await run(validate({ query: assetQuerySchema }), { query: { limit: '101' } })).err.statusCode, 400);
  assert.equal((await run(validate({ query: assetQuerySchema }), { query: { sortBy: 'userId' } })).err.statusCode, 400);
  assert.equal((await run(validate({ query: assetQuerySchema }), { query: { order: 'sideways' } })).err.statusCode, 400);
});

test('role check: no user is 401, the wrong role is 403 and names the roles, the right role passes', async () => {
  const admin = authorize('ADMIN');
  assert.equal((await run(admin, {})).err.statusCode, 401);
  const wrong = (await run(admin, { user: { role: 'USER' } })).err;
  assert.equal(wrong.statusCode, 403);
  assert.match(wrong.message, /Required role\(s\): ADMIN.*Your role: USER/);
  assert.equal((await run(admin, { user: { role: 'ADMIN' } })).err, undefined);
  assert.equal((await run(authorize('USER', 'ADMIN'), { user: { role: 'USER' } })).err, undefined);
});

test('access-token check refuses a missing, malformed, forged or expired token before touching the database', async () => {
  const expectation = async (headers, status, message) => {
    const { err } = await run(authenticate, { headers });
    assert.equal(err.statusCode, status, JSON.stringify(headers));
    assert.match(err.message, message);
  };
  await expectation({}, 401, /required/);
  await expectation({ authorization: 'Basic abc' }, 401, /required/);
  await expectation({ authorization: 'Bearer ' }, 401, /required/);
  await expectation({ authorization: 'Bearer not.a.jwt' }, 401, /Invalid access token/);
  const forged = jwt.sign({ userId: 'x' }, 'some-other-secret');
  await expectation({ authorization: `Bearer ${forged}` }, 401, /Invalid access token/);
  const expired = jwt.sign({ userId: 'x' }, process.env.JWT_ACCESS_SECRET, { expiresIn: -10 });
  await expectation({ authorization: `Bearer ${expired}` }, 401, /expired/);
  const noneAlg = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"userId":"x"}').toString('base64url')}.`;
  await expectation({ authorization: `Bearer ${noneAlg}` }, 401, /Invalid access token/); // unsigned tokens are refused
});

test('error handler: our errors keep their status and field list', () => {
  const res = fakeRes();
  errorHandler(ApiError.badRequest('Validation failed', [{ field: 'name', message: 'bad' }]), { path: '/x', method: 'POST' }, res);
  assert.equal(res.code, 400);
  assert.deepEqual(res.body, { success: false, message: 'Validation failed', errors: [{ field: 'name', message: 'bad' }] });
});

test('error handler: database errors become 409 for a duplicate and 404 for a missing row', () => {
  const dup = fakeRes();
  errorHandler(Object.assign(new Error('x'), { code: 'P2002', meta: { target: ['email'] } }), { path: '/x', method: 'POST' }, dup);
  assert.equal(dup.code, 409);
  assert.equal(dup.body.message, 'A record with this email already exists');
  const gone = fakeRes();
  errorHandler(Object.assign(new Error('x'), { code: 'P2025' }), { path: '/x', method: 'GET' }, gone);
  assert.equal(gone.code, 404);
});

test('error handler: an unexpected error is a 500 that leaks neither its message nor its stack outside development', () => {
  const res = fakeRes();
  errorHandler(new Error('db password is hunter2'), { path: '/x', method: 'GET' }, res);
  assert.equal(res.code, 500);
  assert.equal(res.body.message, 'Internal Server Error');
  assert.equal(res.body.stack, undefined);
});

test('error handler: a 503 we threw on purpose keeps its client-facing message', () => {
  const res = fakeRes();
  errorHandler(ApiError.serviceUnavailable('Guest accounts are all in use right now.'), { path: '/x', method: 'POST' }, res);
  assert.equal(res.code, 503);
  assert.equal(res.body.message, 'Guest accounts are all in use right now.');
});
