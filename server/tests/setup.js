// Imported first by every test file. It sets the environment BEFORE the app loads.
//
// Safety: the database is always TEST_DATABASE_URL (or the local Docker one below), never the
// DATABASE_URL from .env, which points at the real database. The name must contain "test".
const DEFAULT_URL = 'mysql://root:pw@127.0.0.1:3307/primevault_test';
const url = process.env.TEST_DATABASE_URL || DEFAULT_URL;

const dbName = new URL(url).pathname.replace('/', '');
if (!/test/i.test(dbName)) {
  throw new Error(`Refusing to run tests against database "${dbName}": its name must contain "test".`);
}

Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: url,
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  CLIENT_URL: 'http://localhost:5173',
});
delete process.env.ALLOW_ADMIN_SIGNUP; // tests that need it set it themselves

export const TEST_DATABASE_URL = url;

// Start the app on a random port and return its base URL plus a close function.
export async function startApp() {
  const { default: app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  return { base, close: () => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }) };
}

// A tiny HTTP helper: JSON in, { status, body, headers, cookies } out.
export function client(base) {
  return async (path, { method = 'GET', token, body, cookie, headers = {} } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch { /* not JSON, e.g. the docs page */ }
    return { status: res.status, body: parsed, text, headers: res.headers, cookies: res.headers.getSetCookie() };
  };
}

// "refreshToken=abc; Path=/; HttpOnly; ..." -> "refreshToken=abc" (what a browser sends back)
export const cookiePair = (setCookie) => setCookie.split(';')[0];
