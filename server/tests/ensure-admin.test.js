// The demo-admin script (npm run db:admin). Needs the test database. It only has to create or repair one
// account: a wrong or forgotten password, or a demoted admin, is fixed by running it again.
import { startApp, client } from './setup.js';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const { ensureAdmin } = await import('../prisma/ensure-admin.js');
const prisma = new PrismaClient();
const RUN = `adm${Date.now().toString(36)}`;
const EMAIL = `${RUN}-demo@example.com`;
let dbError = null;
try { await prisma.user.count(); } catch (e) { dbError = String(e.message).trim().split('\n').pop(); }

after(async () => {
  if (!dbError) await prisma.user.deleteMany({ where: { email: { startsWith: RUN } } });
  await prisma.$disconnect();
});

test('the script creates an admin who can log in, and rerunning repairs a changed password and a demoted role', async (t) => {
  if (dbError) return t.skip(`no test database: ${dbError}`);
  const app = await startApp();
  try {
    const api = client(app.base);
    const login = (password) => api('/auth/login', { method: 'POST', body: { email: EMAIL, password } });

    const made = await ensureAdmin(prisma, { email: EMAIL, password: 'First-Passw0rd' });
    assert.equal(made.role, 'ADMIN');
    const first = await login('First-Passw0rd');
    assert.equal(first.status, 200);
    assert.equal(first.body.data.user.role, 'ADMIN');

    await prisma.user.update({ where: { email: EMAIL }, data: { role: 'USER' } }); // demoted by mistake
    const again = await ensureAdmin(prisma, { email: EMAIL, password: 'Second-Passw0rd' });
    assert.equal(again.id, made.id); // the same account, not a duplicate
    assert.equal((await login('First-Passw0rd')).status, 401); // the old password stops working
    const second = await login('Second-Passw0rd');
    assert.equal(second.status, 200);
    assert.equal(second.body.data.user.role, 'ADMIN');
    assert.equal(await prisma.user.count({ where: { email: EMAIL } }), 1);
  } finally {
    await app.close();
  }
});

test('the script refuses a missing or short password', async () => {
  for (const password of [undefined, '', 'short']) {
    await assert.rejects(() => ensureAdmin(prisma, { email: EMAIL, password }), /at least 8 characters/);
  }
});
