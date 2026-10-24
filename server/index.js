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
const customAllowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://viennadaytrip.com',
  'https://www.viennadaytrip.com'
];

const allAllowedOrigins = [...new Set([...defaultAllowedOrigins, ...customAllowedOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (
        !origin ||
        allAllowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('viennadaytrip.com')
      ) {
        callback(null, true);
      } else {
        // In development, be permissive; in production, block unauthorized origins
        if (process.env.NODE_ENV === 'production') {
          callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
        } else {
          callback(null, true);
        }
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '20mb' }));
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
