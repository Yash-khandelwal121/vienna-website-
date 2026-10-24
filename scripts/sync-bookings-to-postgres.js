import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const storePath = path.join(rootDir, 'server', 'data', 'store.json');

console.log('================================================================');
console.log('  VIENNA DAY TRIP — POSTGRESQL BOOKINGS & ENQUIRIES SYNC');
console.log('================================================================');

async function main() {
  if (!fs.existsSync(storePath)) {
    console.log('ℹ️ No local store.json found. Nothing to sync.');
    return;
  }

  const rawStore = fs.readFileSync(storePath, 'utf8');
  const store = JSON.parse(rawStore);

  const localBookings = store.bookings || [];
  const localEnquiries = store.enquiries || [];

  console.log(`\n📋 Local Records Found:`);
  console.log(`   - Bookings:  ${localBookings.length}`);
  console.log(`   - Enquiries: ${localEnquiries.length}`);

  const resolvedDatabaseUrl =
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

  const prisma = new PrismaClient({
    datasources: resolvedDatabaseUrl
      ? { db: { url: resolvedDatabaseUrl } }
      : undefined,
  });

  try {
    await prisma.$connect();
    console.log(`✅ Connected to PostgreSQL successfully (${maskUrl(resolvedDatabaseUrl)}).`);
  } catch (err) {
    console.warn(`\n⚠️ Cannot connect to PostgreSQL at ${maskUrl(resolvedDatabaseUrl)}: ${err.message}`);
    console.warn('ℹ️ Existing local bookings and enquiries remain 100% preserved in server/data/store.json.');
    console.warn('   Once production PostgreSQL (Neon, Supabase, etc.) is configured, run:');
    console.warn('   npm run db:sync\n');
    return;
  }

  // 1. Sync Bookings
  let bookingsInserted = 0;
  let bookingsSkipped = 0;

  for (const bk of localBookings) {
    const existing = await prisma.booking.findFirst({
      where: {
        OR: [
          { reference: bk.reference },
          { id: bk.id },
        ],
      },
    });

    if (existing) {
      bookingsSkipped++;
    } else {
      await prisma.booking.create({
        data: {
          id: bk.id,
          reference: bk.reference,
          status: bk.status || 'NEW',
          source: bk.source || 'WEBSITE_FORM',
          customerName: bk.customerName || '',
          email: bk.email || '',
          phone: bk.phone || '',
          serviceType: bk.serviceType || 'Airport Transfer',
          pickupLocation: bk.pickupLocation || '',
          dropoffLocation: bk.dropoffLocation || '',
          pickupDate: String(bk.pickupDate || ''),
          pickupTime: String(bk.pickupTime || ''),
          passengerCount: String(bk.passengerCount || '1-3'),
          luggageDetails: bk.luggageDetails || '',
          preferredVehicle: bk.preferredVehicle || '',
          specialRequests: bk.specialRequests || '',
          internalNotes: bk.internalNotes || '',
          createdAt: bk.createdAt ? new Date(bk.createdAt) : new Date(),
          updatedAt: bk.updatedAt ? new Date(bk.updatedAt) : new Date(),
        },
      });
      bookingsInserted++;
    }
  }

  // 2. Sync Enquiries
  let enquiriesInserted = 0;
  let enquiriesSkipped = 0;

  for (const enq of localEnquiries) {
    const existing = await prisma.contactEnquiry.findFirst({
      where: {
        OR: [
          { reference: enq.reference },
          { id: enq.id },
        ],
      },
    });

    if (existing) {
      enquiriesSkipped++;
    } else {
      await prisma.contactEnquiry.create({
        data: {
          id: enq.id,
          reference: enq.reference,
          status: enq.status || 'NEW',
          isArchived: enq.isArchived || false,
          name: enq.name || '',
          email: enq.email || '',
          phone: enq.phone || '',
          subject: enq.subject || '',
          message: enq.message || '',
          internalNotes: enq.internalNotes || '',
          createdAt: enq.createdAt ? new Date(enq.createdAt) : new Date(),
          updatedAt: enq.updatedAt ? new Date(enq.updatedAt) : new Date(),
        },
      });
      enquiriesInserted++;
    }
  }

  console.log(`\n🎉 Sync Completed:`);
  console.log(`   - Bookings:  ${bookingsInserted} inserted, ${bookingsSkipped} already existed in PostgreSQL.`);
  console.log(`   - Enquiries: ${enquiriesInserted} inserted, ${enquiriesSkipped} already existed in PostgreSQL.`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Sync failed:', err);
});
