import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  // Requests per IP per 15 minutes. The defaults are the production limits; tests raise them.
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  // How many proxies sit in front of the API (Express "trust proxy"). Behind one, every request arrives from the
  // proxy's address, so without this all visitors would share one rate-limit bucket. A client cannot forge the hop
  // closest to the server, so trusting one is safe. Production defaults to 1 (Render's load balancer); 0 elsewhere.
  // Set TRUST_PROXY to override, for example 2 when another proxy (a CDN) is in front of that one.
  TRUST_PROXY: process.env.TRUST_PROXY !== undefined && process.env.TRUST_PROXY !== ''
    ? Math.max(0, parseInt(process.env.TRUST_PROXY, 10) || 0)
    : (process.env.NODE_ENV === 'production' ? 1 : 0),
  // Most temporary guest accounts that may exist at once (see AuthService.createGuest).
  GUEST_MAX: Number(process.env.GUEST_MAX) || 200,
  // Public registration can never create an ADMIN unless this is "true" (demo deployments only).
  ALLOW_ADMIN_SIGNUP: process.env.ALLOW_ADMIN_SIGNUP === 'true',
};

// Validate required env vars at startup
const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of required) {
  if (!env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

export default env;
