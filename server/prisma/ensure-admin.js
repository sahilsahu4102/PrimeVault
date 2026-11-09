// Creates the demo admin, or resets its password and role. You run it yourself, against the database you
// point DATABASE_URL at (it prints which one first), for example when the seeded login stopped working:
//
//   ADMIN_PASSWORD=choose-one npm run db:admin                       (bash)
//   $env:ADMIN_PASSWORD = "choose-one"; npm run db:admin             (PowerShell)
//
// ADMIN_EMAIL defaults to admin@primevault.ai. Nothing else in the database is touched, and the password is
// stored as a bcrypt hash (cost 12), the same as every other account.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';

export async function ensureAdmin(prisma, { email = 'admin@primevault.ai', password, name = 'Operations Manager' }) {
  if (!password || password.length < 8) throw new Error('ADMIN_PASSWORD is required and must have at least 8 characters');
  const hash = await bcrypt.hash(password, 12);
  return prisma.user.upsert({
    where: { email },
    // an existing account: new password, admin role, and any old refresh token is dropped
    update: { password: hash, role: 'ADMIN', refreshToken: null },
    create: { email, name, password: hash, role: 'ADMIN' },
    select: { id: true, email: true, role: true },
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const target = new URL(process.env.DATABASE_URL);
  console.log(`Target database: ${target.pathname.replace('/', '')} on ${target.hostname}`);
  const prisma = new PrismaClient();
  try {
    const admin = await ensureAdmin(prisma, { email: process.env.ADMIN_EMAIL || undefined, password: process.env.ADMIN_PASSWORD });
    console.log(`Admin ready: ${admin.email} (${admin.role})`);
  } finally {
    await prisma.$disconnect();
  }
}
