#!/usr/bin/env node
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const testEnvPath = path.resolve(rootDir, '.env.test.local');

// 1. Guard against missing .env.test.local
if (!fs.existsSync(testEnvPath)) {
  console.error('\n❌ [SAFETY ABORT] .env.test.local not found.');
  console.error('Please ensure .env.test.local exists with isolated test credentials before running this runner.\n');
  process.exit(1);
}

// 2. Load .env.test.local with override: true and prevent loading production .env
dotenv.config({ path: testEnvPath, override: true });
process.env.DOTENV_CONFIG_PATH = testEnvPath;
process.env.NODE_ENV = 'test';

// 3. Database URL Hostname Check
const dbUrl = process.env.DATABASE_URL || '';
const EXPECTED_PREVIEW_HOST = 'ep-quiet-block-ba6yurfj-pooler.c-8.eu-central-1.aws.neon.tech';
const PRODUCTION_HOST_KEYWORD = 'ep-proud-wind-ba8a0s2j';

if (!dbUrl) {
  console.error('\n❌ [SAFETY ABORT] DATABASE_URL is not set in .env.test.local\n');
  process.exit(1);
}

if (dbUrl.includes(PRODUCTION_HOST_KEYWORD)) {
  console.error('\n🚨 [CRITICAL SAFETY ABORT] Production database endpoint detected in DATABASE_URL!');
  console.error('The test runner will NEVER connect to the Production database.');
  console.error(`Expected Preview Host: ${EXPECTED_PREVIEW_HOST}\n`);
  process.exit(1);
}

if (!dbUrl.includes(EXPECTED_PREVIEW_HOST)) {
  console.error('\n❌ [SAFETY ABORT] DATABASE_URL does not point to the approved Neon Preview endpoint.');
  console.error(`Expected Preview Host: ${EXPECTED_PREVIEW_HOST}\n`);
  process.exit(1);
}

// 4. Stripe Key Safety Verification
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const isLiveKey = stripeKey.startsWith('sk_live_') || stripeKey.startsWith('rk_live_');
const isTestKey = stripeKey.startsWith('sk_test_') || stripeKey.startsWith('rk_test_');
const isUnsetPlaceholder =
  !stripeKey ||
  stripeKey.includes('YOUR_TEST_SECRET_KEY_HERE') ||
  stripeKey.includes('ViennaDayTripChauffeurTestKey') ||
  stripeKey.includes('placeholder');

if (isLiveKey) {
  console.error('\n🚨 [CRITICAL SAFETY ABORT] Stripe LIVE key detected in STRIPE_SECRET_KEY!');
  console.error('The test runner strictly forbids live credentials to prevent real charges.');
  console.error('Please configure a valid test key starting with sk_test_ in .env.test.local\n');
  process.exit(1);
}

if (isUnsetPlaceholder || !isTestKey) {
  console.error('\n⚠️ [CONFIGURATION REQUIRED] STRIPE_SECRET_KEY is not configured with a valid Stripe TEST key.');
  console.error('Current value is missing or contains placeholder text.');
  console.error('To proceed with Stripe testing, open .env.test.local and enter your Stripe test secret key:');
  console.error('  STRIPE_SECRET_KEY=sk_test_51...\n');
  process.exit(1);
}

// 5. Runtime Neon Branch ID Verification via Prisma query
import { PrismaClient } from '@prisma/client';

console.log('🔍 [Safety Check] Verifying isolated Neon Preview branch at runtime...');

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

try {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT 
      current_setting('neon.branch_id', true) AS branch_id,
      current_setting('neon.project_id', true) AS project_id;
  `);

  const branchId = rows[0]?.branch_id;
  const projectId = rows[0]?.project_id;
  const EXPECTED_BRANCH_ID = 'br-still-lake-bafug39c';

  if (branchId !== EXPECTED_BRANCH_ID) {
    console.error(`\n🚨 [CRITICAL SAFETY ABORT] Neon Branch ID mismatch!`);
    console.error(`Connected Branch: ${branchId}`);
    console.error(`Expected Preview: ${EXPECTED_BRANCH_ID}`);
    console.error('Server boot cancelled immediately.\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  const countRows = await prisma.$queryRawUnsafe('SELECT count(*)::int as count FROM "Booking";');
  const bookingCount = countRows[0]?.count;

  await prisma.$disconnect();

  console.log(`✅ [Safety Check Passed] Verified Neon Branch: ${branchId} (Project: ${projectId})`);
  console.log(`✅ [Safety Check Passed] Preview Database Endpoint: ${EXPECTED_PREVIEW_HOST}`);
  console.log(`✅ [Safety Check Passed] Stripe Key Mode: TEST (starts with ${stripeKey.slice(0, 8)}...)`);
  console.log(`ℹ️ [Database Status] Current Preview Booking count: ${bookingCount}`);
  console.log(`🚀 [Booting] Starting isolated Express test backend...\n`);

  // 6. Dynamically import and boot server/index.js
  await import('../server/index.js');
} catch (error) {
  console.error('\n❌ [Safety Check Error] Failed during database preflight check:', error.message);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
}
