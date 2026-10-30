import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import os from 'os';
import { initDatabase, ensureDbInitialized } from './config/db.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;
const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

// Ensure database initialization on serverless & local invocations
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
  } catch (err) {
    console.error('[DB Init Middleware Note]:', err.message);
  }
  next();
});

// Security & Parsing Middleware

// Explicitly approved production domains
const defaultProductionOrigins = [
  'https://vienna-website-mbtdl2jng-yashdev15.vercel.app',
  'https://vienna-website-seven.vercel.app',
  'https://viennadaytrip.com',
  'https://www.viennadaytrip.com'
];

// Helper to reliably check for loopback/localhost origins without unsafe substring matching
function isLocalhostOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost')
    );
  } catch {
    return false;
  }
}

// Helper to normalize origin string (trim and strip trailing slash)
function normalizeOrigin(origin) {
  return typeof origin === 'string' ? origin.trim().replace(/\/+$/, '') : '';
}

// User-supplied origins via environment variable
const customAllowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

// Strict production allowlist (localhost origins are explicitly excluded from production)
const productionAllowedOrigins = new Set([
  ...defaultProductionOrigins.map(normalizeOrigin),
  ...customAllowedOrigins.filter((origin) => !isLocalhostOrigin(origin))
]);

// Development allowlist (includes common local dev ports plus all production origins)
const developmentAllowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  ...defaultProductionOrigins.map(normalizeOrigin),
  ...customAllowedOrigins
]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin)
    if (!origin) {
      return callback(null, true);
    }

    const normalized = normalizeOrigin(origin);
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // PRODUCTION: strictly allow only explicitly configured production origins
      if (productionAllowedOrigins.has(normalized)) {
        return callback(null, true);
      }
      return callback(
        new Error(`CORS policy does not allow access from origin: ${origin}`)
      );
    } else {
      // DEVELOPMENT: allow localhost / loopback interfaces and configured development origins
      if (
        developmentAllowedOrigins.has(normalized) ||
        isLocalhostOrigin(normalized)
      ) {
        return callback(null, true);
      }
      // In development, permit other local network origins gracefully
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Preserve raw body buffer for Stripe webhook signature verification
app.use(
  ['/api/v1/public/payments/webhook', '/api/public/payments/webhook'],
  express.raw({ type: '*/*', limit: '10mb' }),
  (req, res, next) => {
    if (Buffer.isBuffer(req.body)) {
      req.rawBody = req.body;
    }
    next();
  }
);

app.use(
  express.json({
    limit: '20mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'vienna_luxury_cookie_secret_dev_2026'));

// Static uploads serving
app.use('/uploads', express.static(path.resolve('public/uploads')));
try {
  const tmpUploads = path.join(os.tmpdir(), 'uploads');
  app.use('/uploads', express.static(tmpUploads));
} catch {
  // Gracefully ignored
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Vienna Day Trip API Engine'
  });
});

// API v1 Routes
app.use('/api/v1', apiRouter);
// Forward /api to /api/v1
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global API Error]:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected server error occurred.'
  });
});

// Initialize Database & Start Server
async function startServer() {
  await initDatabase();

  const server = app.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(`🚀 VIENNA DAY TRIP LUXURY REST API RUNNING`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🛡️  Admin API: http://localhost:${PORT}/api/v1/admin`);
    console.log(`🌍 Public API: http://localhost:${PORT}/api/v1/public`);
    console.log(`============================================================\n`);
  });

  return server;
}

// Only listen on port in non-serverless environments (local dev & standalone VM)
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
