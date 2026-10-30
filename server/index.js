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

// ─────────────────────────────────────────────────────────────────────────────
// CORS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// Explicitly approved production & stable preview domains
const defaultProductionOrigins = [
  'https://vienna-website-mbtdl2jng-yashdev15.vercel.app', // legacy stable preview
  'https://vienna-website-seven.vercel.app',               // stable alias
  'https://viennadaytrip.com',
  'https://www.viennadaytrip.com'
];

/**
 * Scoped Vercel Preview allowance.
 *
 * Allows ONLY preview deployments for THIS specific project + team:
 *   https://vienna-website-<alphanumeric_hash>-yashdev15.vercel.app
 *
 * Security guarantees:
 *  ✓ Anchored regex — no partial matches
 *  ✓ Hash segment restricted to lowercase alphanumerics only (no dots, slashes, etc.)
 *  ✓ Project name must be exactly "vienna-website"
 *  ✓ Team slug must be exactly "yashdev15"
 *  ✓ HTTPS only (enforced by protocol check below)
 *  ✗ Will NOT allow:  other-project-hash-yashdev15.vercel.app
 *  ✗ Will NOT allow:  vienna-website-hash-otherperson.vercel.app
 *  ✗ Will NOT allow:  evil-vienna-website-hash-yashdev15.vercel.app
 *  ✗ Will NOT allow:  any arbitrary *.vercel.app domain
 */
const VERCEL_PREVIEW_PATTERN = /^vienna-website-[a-z0-9]+-yashdev15\.vercel\.app$/;

/**
 * Returns true if origin is a HTTPS Vercel Preview URL matching this project.
 * Parses the URL properly rather than doing substring matching.
 */
function isAuthorizedVercelPreview(origin) {
  try {
    const parsed = new URL(origin);
    // Must be HTTPS — never HTTP
    if (parsed.protocol !== 'https:') return false;
    // Hostname must exactly match the project + team preview pattern
    return VERCEL_PREVIEW_PATTERN.test(parsed.hostname);
  } catch {
    return false;
  }
}

/** Returns true if origin is localhost / loopback (no substring tricks) */
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

/** Normalize origin string — trim whitespace and strip any trailing slash */
function normalizeOrigin(origin) {
  return typeof origin === 'string' ? origin.trim().replace(/\/+$/, '') : '';
}

// Extra origins supplied via CORS_ORIGIN env-var (comma-separated, Vercel env panel)
const customAllowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

// Production allowlist — static Set, no localhost entries permitted
const productionAllowedOrigins = new Set([
  ...defaultProductionOrigins.map(normalizeOrigin),
  ...customAllowedOrigins.filter((o) => !isLocalhostOrigin(o))
]);

// Development allowlist — includes localhost ports + all production origins
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
    // Requests with no origin header (server-to-server, curl, same-origin) — always allow
    if (!origin) {
      return callback(null, true);
    }

    const normalized = normalizeOrigin(origin);
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // ① Static production allowlist (exact match)
      if (productionAllowedOrigins.has(normalized)) {
        return callback(null, true);
      }

      // ② Scoped Vercel Preview allowance — project-specific pattern only
      if (isAuthorizedVercelPreview(normalized)) {
        return callback(null, true);
      }

      // ③ Everything else — reject
      return callback(
        new Error(`CORS policy does not allow access from origin: ${origin}`)
      );
    } else {
      // DEVELOPMENT: allow localhost / loopback and explicitly configured origins
      if (
        developmentAllowedOrigins.has(normalized) ||
        isLocalhostOrigin(normalized)
      ) {
        return callback(null, true);
      }
      // Permit other LAN / emulator origins in development gracefully
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
