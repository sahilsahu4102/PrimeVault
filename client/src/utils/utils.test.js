// Unit tests for the client's pure helpers, on Node's built-in test runner (no extra dependencies): `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiUrl, docsUrl } from './apiUrl.js';
import { readError } from './errors.js';
import { formatPrice, formatCount, ownerKind } from './format.js';

test('the API address always ends in /api/v1, whichever way the setting is written', () => {
  const full = 'https://primevault-kc1y.onrender.com/api/v1';
  assert.equal(normalizeApiUrl(full), full);
  assert.equal(normalizeApiUrl(`${full}/`), full, 'trailing slash');
  assert.equal(normalizeApiUrl('https://primevault-kc1y.onrender.com'), full, 'host only (the live deployment had this)');
  assert.equal(normalizeApiUrl('https://primevault-kc1y.onrender.com/'), full, 'host with a slash');
  assert.equal(normalizeApiUrl('  https://primevault-kc1y.onrender.com/api/v1  '), full, 'stray spaces');
  assert.equal(normalizeApiUrl(undefined), 'http://localhost:5000/api/v1', 'the local default');
  assert.equal(normalizeApiUrl(''), 'http://localhost:5000/api/v1');
  assert.equal(normalizeApiUrl('http://localhost:5010/api/v1'), 'http://localhost:5010/api/v1');
});

test('the docs link sits on the same host as the API', () => {
  assert.equal(docsUrl('https://primevault-kc1y.onrender.com/api/v1'), 'https://primevault-kc1y.onrender.com/api-docs');
  assert.equal(docsUrl('http://localhost:5000/api/v1'), 'http://localhost:5000/api-docs');
});

test('readError: a network failure is told apart from an answer, and field messages are kept by field', () => {
  const offline = readError(new Error('Network Error'));
  assert.match(offline.message, /Could not reach the server/);
  assert.deepEqual(offline.fields, {});

  const rejected = readError({ response: { data: { message: 'Validation failed', errors: [{ field: 'name', message: 'Asset name must be at least 2 characters' }, { field: 'price', message: 'Price is required' }, { field: 'name', message: 'second message for name' }] } } });
  assert.equal(rejected.message, 'Validation failed');
  assert.equal(rejected.list.length, 3);
  assert.equal(rejected.fields.name, 'Asset name must be at least 2 characters', 'the first message for a field wins');
  assert.equal(rejected.fields.price, 'Price is required');

  assert.equal(readError({ response: { data: {} } }, 'Fallback text').message, 'Fallback text');
  assert.equal(readError({ response: { data: { message: 'Invalid email or password' } } }).message, 'Invalid email or password');
});

test('prices and counts are written the way a reader expects', () => {
  assert.equal(formatPrice(1449319.02), '1,449,319.02');
  assert.equal(formatPrice(0), '0.00');
  assert.equal(formatPrice(5), '5.00');
  assert.equal(formatPrice(999.999), '1,000.00');
  assert.equal(formatCount(65), '65');
  assert.equal(formatCount(12345), '12,345');
});

test('the ownership mark says whether the signed-in user may edit: dot for yours, diamond for admins, none otherwise', () => {
  const mine = { userId: 'u1' };
  const theirs = { userId: 'u2' };
  assert.equal(ownerKind(mine, { id: 'u1' }, false), 'yours');
  assert.equal(ownerKind(mine, { id: 'u1' }, true), 'yours', 'an admin still sees their own as theirs');
  assert.equal(ownerKind(theirs, { id: 'u1' }, true), 'admin');
  assert.equal(ownerKind(theirs, { id: 'u1' }, false), null);
  assert.equal(ownerKind(theirs, undefined, false), null);
});
