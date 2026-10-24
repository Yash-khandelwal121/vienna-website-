import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

dotenv.config();

console.log('================================================================');
console.log('  VIENNA DAY TRIP — NEON POSTGRESQL AUTOMATED PROVISIONING');
console.log('================================================================');

const resolvedUrl =
  process.env.DATABASE_URL ||
  process.env.Database_POSTGRES_URL ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

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

if (!resolvedUrl || resolvedUrl.includes('localhost:5432')) {
  console.log(`\n❌ Current connection target is local: ${maskUrl(resolvedUrl)}`);
  console.log('   Please set your Neon PostgreSQL URL in .env as DATABASE_URL or Database_POSTGRES_URL.');
  process.exit(1);
}

console.log(`\n📌 Target Neon Database: ${maskUrl(resolvedUrl)}`);

async function runSetup() {
  try {
    // 1. Push Prisma Schema to Neon
    console.log('\n[1/3] Deploying Prisma Schema to Neon PostgreSQL...');
    const directUrl =
      process.env.DIRECT_URL ||
      process.env.Database_POSTGRES_URL_NON_POOLING ||
      resolvedUrl;

    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: resolvedUrl,
        DIRECT_URL: directUrl,
      },
    });
    console.log('✅ Schema synchronization completed!');

    // 2. Sync Local Bookings & Enquiries into Neon
    console.log('\n[2/3] Migrating existing local bookings & enquiries into Neon...');
    execSync('node scripts/sync-bookings-to-postgres.js', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: resolvedUrl },
    });

    // 3. Seed Default Super Admin & Fleet
    console.log('\n[3/3] Seeding Super Admin & Luxury Fleet in Neon...');
    execSync('node prisma/seed.js', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: resolvedUrl },
    });

    // 4. Verification
    console.log('\n[Verification] Checking Neon live table counts...');
    const prisma = new PrismaClient({
      datasources: { db: { url: resolvedUrl } },
    });
    await prisma.$connect();

    const [adminCount, bookingCount, enquiryCount, vehicleCount] = await Promise.all([
      prisma.adminUser.count(),
      prisma.booking.count(),
      prisma.contactEnquiry.count(),
      prisma.vehicle.count(),
    ]);

    console.log(`   - Super Admin Users: ${adminCount}`);
    console.log(`   - Bookings in Neon:  ${bookingCount}`);
    console.log(`   - Enquiries in Neon: ${enquiryCount}`);
    console.log(`   - Vehicles in Neon:  ${vehicleCount}`);

    await prisma.$disconnect();

    console.log('\n🎉 Neon PostgreSQL provisioning completed successfully!');
  } catch (err) {
    console.error('\n❌ Neon provisioning failed:', err.message);
    process.exit(1);
  }
}

runSetup();
