import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const resolvedDatabaseUrl =
  process.env.DATABASE_URL ||
  process.env.Database_POSTGRES_URL ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (resolvedDatabaseUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolvedDatabaseUrl;
}

const prisma = new PrismaClient({
  datasources: resolvedDatabaseUrl
    ? { db: { url: resolvedDatabaseUrl } }
    : undefined,
});

async function main() {
  console.log('🌱 Starting Vienna Day Trip PostgreSQL Database Seeding...');

  // 1. Super Admin
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@viennadaytrip.com').toLowerCase();
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ViennaChauffeur2026!Secure';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(rawPassword, salt);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, isActive: true },
    create: {
      email: adminEmail,
      name: process.env.INITIAL_ADMIN_NAME || 'Vienna Day Trip Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });
  console.log(`✅ Super Admin configured: ${admin.email}`);

  // 2. Fleet Vehicles
  const vehicles = [
    {
      vehicleId: 's-class',
      name: 'Mercedes-Benz S-Class',
      category: 'First Class Limousine',
      badge: 'First Class Sedan',
      tagline: 'The Pinnacle of Automotive Luxury',
      shortDescription: 'The pinnacle of luxury travel. Features AIRMATIC suspension, Burmester sound, executive rear seating.',
      fullDescription: 'The Mercedes-Benz S-Class represents the highest level of luxury in our fleet. Every detail is designed to provide a first-class travel experience.',
      passengers: '3 Guests',
      luggage: '2 Large Bags',
      ride: 'AIRMATIC Suspension',
      mainImage: '/cars/s-class.webp',
      transparentImage: '/cars/s-class.png',
      availability: 'AVAILABLE',
      displayOrder: 1,
      isPublished: true
    },
    {
      vehicleId: 'e-class',
      name: 'Mercedes-Benz E-Class',
      category: 'Business Class Sedan',
      badge: 'Business Class Sedan',
      tagline: 'Executive Refinement & Quiet Efficiency',
      shortDescription: 'Sophisticated executive transportation. Premium leather interior, ambient lighting, dual-zone climate.',
      fullDescription: 'The Mercedes-Benz E-Class is the executive standard for business transfers, airport pickups, and comfortable city travel in Vienna.',
      passengers: '3 Guests',
      luggage: '2 Large Bags',
      ride: 'Agility Control Suspension',
      mainImage: '/cars/e-class.webp',
      transparentImage: '/cars/e-class.png',
      availability: 'AVAILABLE',
      displayOrder: 2,
      isPublished: true
    },
    {
      vehicleId: 'v-class',
      name: 'Mercedes-Benz V-Class',
      category: 'VIP Business Van',
      badge: 'VIP Business Van',
      tagline: 'First-Class Group & Family Mobility',
      shortDescription: 'Spacious luxury for families and corporate groups. Face-to-face conference seating, panoramic glass roof.',
      fullDescription: 'The Mercedes-Benz V-Class offers unmatched comfort for up to 6 passengers with spacious luggage capacity.',
      passengers: '6 Guests',
      luggage: '6 Large Bags',
      ride: 'Dynamic Air Comfort',
      mainImage: '/cars/v-class.webp',
      transparentImage: '/cars/v-class.png',
      availability: 'AVAILABLE',
      displayOrder: 3,
      isPublished: true
    },
    {
      vehicleId: 'sprinter',
      name: 'Mercedes-Benz Sprinter',
      category: 'VIP Group Minibus',
      badge: 'VIP Group Minibus',
      tagline: 'Grand Luxury for Delegations & Large Groups',
      shortDescription: 'Grand touring minibus for delegations and private events. Standing room cabin, executive club seating.',
      fullDescription: 'Custom-tailored VIP Mercedes-Benz Sprinter accommodating up to 8-16 passengers in leather club seating.',
      passengers: '8-16 Guests',
      luggage: '12 Large Bags',
      ride: 'Heavy-Duty Comfort Suspension',
      mainImage: '/cars/sprinter.webp',
      transparentImage: '/cars/sprinter.png',
      availability: 'ON_REQUEST',
      displayOrder: 4,
      isPublished: true
    },
    {
      vehicleId: 'armored',
      name: 'Armored Luxury Vehicle',
      category: 'Security & Diplomatic Escort',
      badge: 'Ballistic Protection VR6/VR7',
      tagline: 'Certified Ballistic & Blast Security Protection',
      shortDescription: 'Certified ballistic and blast-protected transportation for VIPs, diplomats, and high-profile executives.',
      fullDescription: 'VR6/VR7 certified armored luxury limousine with run-flat tire systems, emergency oxygen supply, and police-vetted chauffeurs.',
      passengers: '3 Guests',
      luggage: '2 Large Bags',
      ride: 'Reinforced Security Suspension',
      mainImage: '/cars/armored.webp',
      transparentImage: '/cars/armored.png',
      availability: 'ON_REQUEST',
      displayOrder: 5,
      isPublished: true
    }
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { vehicleId: v.vehicleId },
      update: v,
      create: v
    });
  }
  console.log(`✅ Seeded ${vehicles.length} fleet vehicles.`);

  // 3. Import All 129 Migrated Blogs
  const blogPostsPath = path.resolve('src/data/blogPosts.json');
  if (fs.existsSync(blogPostsPath)) {
    const rawBlogs = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));
    let blogCount = 0;
    for (const b of rawBlogs) {
      await prisma.blogPost.upsert({
        where: { slug: b.slug },
        update: {
          title: b.title,
          excerpt: b.excerpt || '',
          content: b.content || '',
          featuredImage: b.featuredImage || '/images/vienna-palace-backdrop.webp',
          category: b.category || b.primaryCategory || 'Travel Guides',
          categories: b.categories || [b.category || 'Travel Guides'],
          author: b.author || 'Vienna Day Trip Concierge',
          date: b.date || 'October 2026',
          isPublished: true
        },
        create: {
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt || '',
          content: b.content || '',
          featuredImage: b.featuredImage || '/images/vienna-palace-backdrop.webp',
          category: b.category || b.primaryCategory || 'Travel Guides',
          categories: b.categories || [b.category || 'Travel Guides'],
          author: b.author || 'Vienna Day Trip Concierge',
          date: b.date || 'October 2026',
          isPublished: true
        }
      });
      blogCount++;
    }
    console.log(`✅ Seeded ${blogCount} migrated blog articles into PostgreSQL.`);
  }

  // 4. Operational Services & Day Trips
  const storePath = path.resolve('server/data/store.json');
  if (fs.existsSync(storePath)) {
    const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));

    if (Array.isArray(storeData.services)) {
      for (const s of storeData.services) {
        await prisma.service.upsert({
          where: { slug: s.slug },
          update: {
            name: s.name,
            shortDesc: s.shortDesc || '',
            fullDesc: s.fullDesc || '',
            features: s.features || [],
            image: s.image || '/images/vienna-palace-backdrop.webp',
            ctaLabel: s.ctaLabel || 'Book Service',
            ctaUrl: s.ctaUrl || '',
            displayOrder: s.displayOrder || 0,
            isPublished: s.isPublished !== undefined ? s.isPublished : true,
          },
          create: {
            id: s.id || undefined,
            slug: s.slug,
            name: s.name,
            shortDesc: s.shortDesc || '',
            fullDesc: s.fullDesc || '',
            features: s.features || [],
            image: s.image || '/images/vienna-palace-backdrop.webp',
            ctaLabel: s.ctaLabel || 'Book Service',
            ctaUrl: s.ctaUrl || '',
            displayOrder: s.displayOrder || 0,
            isPublished: s.isPublished !== undefined ? s.isPublished : true,
          },
        });
      }
      console.log(`✅ Seeded ${storeData.services.length} operational services.`);
    }

    if (Array.isArray(storeData.dayTrips)) {
      for (const d of storeData.dayTrips) {
        await prisma.dayTrip.upsert({
          where: { slug: d.slug },
          update: {
            name: d.name,
            title: d.title || d.name,
            eyebrow: d.eyebrow || '',
            shortDesc: d.shortDesc || '',
            fullDesc: d.fullDesc || '',
            duration: d.duration || 'Full Day',
            image: d.image || '',
            price: d.price || '',
            displayOrder: d.displayOrder || 0,
            isPublished: d.isPublished !== undefined ? d.isPublished : true,
          },
          create: {
            id: d.id || undefined,
            slug: d.slug,
            name: d.name,
            title: d.title || d.name,
            eyebrow: d.eyebrow || '',
            shortDesc: d.shortDesc || '',
            fullDesc: d.fullDesc || '',
            duration: d.duration || 'Full Day',
            image: d.image || '',
            price: d.price || '',
            displayOrder: d.displayOrder || 0,
            isPublished: d.isPublished !== undefined ? d.isPublished : true,
          },
        });
      }
      console.log(`✅ Seeded ${storeData.dayTrips.length} operational day trips.`);
    }
  }

  // 5. Default Settings & Reviews
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      businessName: 'Vienna Day Trip',
      contactEmail: 'info@viennadaytrip.com',
      phone: '+43 664 203 5445',
      whatsappNumber: '+43 664 203 5445',
      address: 'Vienna, Austria'
    }
  });

  await prisma.reviewIntegration.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      googleMapsUrl: 'https://maps.app.goo.gl/vienna-day-trip',
      isVisible: true,
      maxReviews: 6,
      minRating: 4.5,
      reviewCount: 240,
      averageRating: 4.9
    }
  });

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
