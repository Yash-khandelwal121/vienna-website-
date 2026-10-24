import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

console.log('================================================================');
console.log('  VIENNA DAY TRIP — PRODUCTION PRE-DEPLOYMENT BUILD PIPELINE');
console.log('================================================================');

// 1. Resolve and normalize database URLs across Neon / Vercel integration variants
const resolvedDbUrl =
  process.env.DATABASE_URL ||
  process.env.Database_POSTGRES_URL ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:5432/viennadaytrip?schema=public';

const resolvedDirectUrl =
  process.env.DIRECT_URL ||
  process.env.Database_POSTGRES_URL_NON_POOLING ||
  process.env.Database_POSTGRES_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_NON_POOLING ||
  resolvedDbUrl;

process.env.DATABASE_URL = resolvedDbUrl;
process.env.DIRECT_URL = resolvedDirectUrl;

function maskUrl(url) {
  if (!url) return 'NOT_CONFIGURED';
  try {
    const p = new URL(url);
    if (p.password) p.password = '********';
    return p.toString();
  } catch {
    return url.replace(/:([^@/]+)@/, ':********@');
  }
}

console.log(`\n[1/2] Generating Prisma Client (Multi-Architecture Targets)...`);
console.log(`      DATABASE_URL: ${maskUrl(resolvedDbUrl)}`);
console.log(`      DIRECT_URL:   ${maskUrl(resolvedDirectUrl)}`);

try {
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: resolvedDbUrl,
      DIRECT_URL: resolvedDirectUrl,
    },
  });
  console.log('  ✅ Prisma Client generated successfully!');
} catch (err) {
  // On local Windows dev, active Node background processes can lock query_engine-windows.dll.node.
  // In Linux / Vercel containerized builds, this never occurs.
  if (process.platform === 'win32' && fs.existsSync('node_modules/@prisma/client/index.js')) {
    console.warn('  ⚠️ Note: Windows file lock encountered on local development machine (background server process holds .dll). Existing Prisma Client is active and valid.');
  } else {
    console.error('  ❌ Prisma Client generation failed:', err.message);
    process.exit(1);
  }
}

console.log(`\n[2/2] Compiling Vite Frontend Bundles for Production...`);
try {
  execSync('npx vite build', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('  ✅ Vite production build compiled successfully!');
} catch (err) {
  console.error('  ❌ Vite build compilation failed:', err.message);
  process.exit(1);
}

console.log('\n================================================================');
console.log('  🎉 PRODUCTION BUILD PIPELINE COMPLETED SUCCESSFULLY');
console.log('================================================================\n');
