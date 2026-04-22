import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import env from './config/env.js';
import logger from './config/logger.js';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/error.middleware.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import assetRoutes from './modules/assets/asset.routes.js';

const app = express();

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = env.CLIENT_URL.split(',').map(o => o.trim());
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ─── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Request Logging ───────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// ─── API Documentation ────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PrimeVault API Documentation',
}));

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'PrimeVault API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

// ─── API Routes (v1) ──────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/assets', assetRoutes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

export default app;
