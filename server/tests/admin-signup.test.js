// A demo deployment can switch on admin sign-up with ALLOW_ADMIN_SIGNUP=true. Needs the test database.
// The switch is read once when the app starts, which is why this has a test file (and process) of its own.
import { startApp, client } from './setup.js';
process.env.ALLOW_ADMIN_SIGNUP = 'true'; // after setup.js (which clears it) and before the app loads
process.env.AUTH_RATE_LIMIT_MAX = '1000';

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RUN = `adm${Date.now().toString(36)}`;
let dbError = null;
try { await prisma.user.count(); } catch (e) { dbError = String(e.message).trim().split('\n').pop(); }

after(async () => {
  if (!dbError) await prisma.user.deleteMany({ where: { email: { startsWith: RUN } } });
  await prisma.$disconnect();
});

test('with ALLOW_ADMIN_SIGNUP=true, sign-up can create an admin; a made-up role is still refused', async (t) => {
  if (dbError) return t.skip(`no test database: ${dbError}`);
  const app = await startApp();
  try {
    const api = client(app.base);
    const signup = (n, role) => api('/auth/register', { method: 'POST', body: { name: 'Admin Test', email: `${RUN}-${n}@example.com`, password: 'Str0ngPass', role } });
    const admin = await signup('admin', 'ADMIN');
    assert.equal(admin.status, 201);
    assert.equal(admin.body.data.user.role, 'ADMIN');
    assert.equal((await signup('bogus', 'SUPERUSER')).status, 400);
  } finally {
    await app.close();
  }
});
