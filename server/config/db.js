import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { hashPassword } from '../utils/password.js';

// Resolve PostgreSQL connection string across Neon / Vercel integration variants
export const resolvedDatabaseUrl =
  process.env.DATABASE_URL ||
  process.env.Database_POSTGRES_URL ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (resolvedDatabaseUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolvedDatabaseUrl;
}

export const resolvedDirectUrl =
  process.env.DIRECT_URL ||
  process.env.Database_POSTGRES_URL_NON_POOLING ||
  process.env.Database_POSTGRES_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_NON_POOLING ||
  resolvedDatabaseUrl;

if (resolvedDirectUrl && !process.env.DIRECT_URL) {
  process.env.DIRECT_URL = resolvedDirectUrl;
}

// Safely mask credentials in logs
export function maskDatabaseUrl(url) {
  if (!url) return 'NOT_CONFIGURED';
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '********';
    return parsed.toString();
  } catch {
    return url.replace(/:([^@/]+)@/, ':********@');
  }
}

let prisma = null;
let isPostgresConnected = false;

// Attempt Prisma PostgreSQL connection
try {
  prisma = new PrismaClient({
    datasources: resolvedDatabaseUrl
      ? {
          db: {
            url: resolvedDatabaseUrl
          }
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
} catch (e) {
  console.warn('[DB] Prisma client instantiation note:', e.message);
}

const dataDir = path.resolve('server/data');
const storeFile = path.join(dataDir, 'store.json');

// Ensure server/data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-Memory & File Store for Guaranteed 100% Zero-Crash Availability
let memoryStore = {
  users: [],
  sessions: [],
  auditLogs: [],
  bookings: [],
  enquiries: [],
  vehicles: [],
  services: [],
  dayTrips: [],
  blogs: [],
  pageSections: [],
  media: [],
  translations: [],
  seo: [],
  reviews: {
    id: 'singleton',
    googleMapsUrl: 'https://maps.app.goo.gl/vienna-day-trip',
    isVisible: true,
    maxReviews: 6,
    minRating: 4.5,
    reviewCount: 240,
    averageRating: 4.9,
    updatedAt: new Date().toISOString()
  },
  settings: {
    id: 'singleton',
    businessName: 'Vienna Day Trip',
    contactEmail: 'info@viennadaytrip.com',
    phone: '+43 664 203 5445',
    whatsappNumber: '+43 664 203 5445',
    address: 'Vienna, Austria',
    logo: '/images/logo2.png',
    favicon: '/favicon.png',
    mapsUrl: 'https://maps.google.com/?q=Vienna+Day+Trip',
    defaultLanguage: 'en',
    updatedAt: new Date().toISOString()
  }
};

const isVercel = process.env.VERCEL === '1';

// Save memory store to JSON file (with Vercel /tmp fallback)
export function persistStore() {
  try {
    const payload = JSON.stringify(memoryStore, null, 2);
    // Always persist to local storeFile if writeable
    try {
      fs.writeFileSync(storeFile, payload, 'utf8');
    } catch {}
    // Also write to /tmp/store.json if on Vercel
    if (isVercel) {
      try {
        fs.writeFileSync(path.join('/tmp', 'store.json'), payload, 'utf8');
      } catch {}
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DB] Persistent store note:', err.message);
    }
  }
}

// Load seed data from existing project files
async function loadSeedData() {
  const fileToRead = isVercel && fs.existsSync(path.join('/tmp', 'store.json'))
    ? path.join('/tmp', 'store.json')
    : storeFile;

  if (fs.existsSync(fileToRead)) {
    try {
      const data = JSON.parse(fs.readFileSync(fileToRead, 'utf8'));
      memoryStore = { ...memoryStore, ...data };
      console.log(`[DB] Loaded persistent data store (${memoryStore.blogs?.length || 0} blogs, ${memoryStore.vehicles?.length || 0} vehicles, ${memoryStore.bookings?.length || 0} bookings).`);
      return;
    } catch (e) {
      console.warn('[DB] Could not parse existing store.json, re-seeding...');
    }
  }

  // 1. Initial Admin User
  const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ViennaChauffeur2026!Secure';
  const hashedPassword = await hashPassword(defaultPassword);
  memoryStore.users = [
    {
      id: 'usr_super_admin_vdt',
      email: (process.env.INITIAL_ADMIN_EMAIL || 'admin@viennadaytrip.com').toLowerCase(),
      passwordHash: hashedPassword,
      name: process.env.INITIAL_ADMIN_NAME || 'Vienna Day Trip Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // 2. Load 129 Migrated Blogs
  try {
    const blogPostsPath = path.resolve('src/data/blogPosts.json');
    if (fs.existsSync(blogPostsPath)) {
      const blogData = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));
      memoryStore.blogs = blogData.map((b) => ({
        id: `blog_${b.slug}`,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || '',
        content: b.content || '',
        featuredImage: b.featuredImage || '/images/vienna-palace-backdrop.webp',
        category: b.category || b.primaryCategory || 'Travel Guides',
        categories: b.categories || [b.category || 'Travel Guides'],
        author: b.author || 'Vienna Day Trip Concierge',
        date: b.date || 'October 2026',
        rawDate: b.rawDate || new Date().toISOString(),
        isPublished: true,
        seo: b.seo || { metaTitle: b.title, metaDescription: b.excerpt },
        createdAt: b.rawDate || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      console.log(`[DB] Successfully loaded ${memoryStore.blogs.length} migrated blogs.`);
    }
  } catch (err) {
    console.warn('[DB] Note loading blogs:', err.message);
  }

  // 3. Load Fleet Vehicles
  try {
    memoryStore.vehicles = [
      {
        id: 'veh_s_class',
        vehicleId: 's-class',
        name: 'Mercedes-Benz S-Class',
        category: 'First Class Limousine',
        badge: 'First Class Sedan',
        tagline: 'The Pinnacle of Automotive Luxury',
        shortDescription: 'The pinnacle of luxury travel. Features AIRMATIC suspension, Burmester sound, executive rear seating.',
        fullDescription: 'The Mercedes-Benz S-Class represents the highest level of luxury in our fleet. Every detail is designed to provide a first-class travel experience—from its ultra-quiet acoustic cabin to its cutting-edge safety technology.',
        passengers: '3 Guests',
        luggage: '2 Large Bags',
        ride: 'AIRMATIC Suspension',
        features: [
          'Whisper-quiet acoustic insulation',
          'Rear reclining executive seats with massage',
          'Burmester® 3D surround sound',
          'Chilled refreshment compartment & evian water'
        ],
        mainImage: '/cars/s-class.webp',
        transparentImage: '/cars/s-class.png',
        gallery: ['/cars/s-class.webp', '/images/about-vclass-chauffeur.webp'],
        availability: 'AVAILABLE',
        displayOrder: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'veh_e_class',
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
        features: [
          'Ergonomic leather seating',
          'Dual-zone THERMATIC climate control',
          'High-speed Wi-Fi & USB-C fast charging',
          'Complimentary Austrian spring water'
        ],
        mainImage: '/cars/e-class.webp',
        transparentImage: '/cars/e-class.png',
        gallery: ['/cars/e-class.webp'],
        availability: 'AVAILABLE',
        displayOrder: 2,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'veh_v_class',
        vehicleId: 'v-class',
        name: 'Mercedes-Benz V-Class',
        category: 'VIP Business Van',
        badge: 'VIP Business Van',
        tagline: 'First-Class Group & Family Mobility',
        shortDescription: 'Spacious luxury for families and corporate groups. Face-to-face conference seating, panoramic glass roof.',
        fullDescription: 'The Mercedes-Benz V-Class offers unmatched comfort for up to 6 passengers with spacious luggage capacity. Perfect for long-distance day trips to Hallstatt, Salzburg, and Budapest.',
        passengers: '6 Guests',
        luggage: '6 Large Bags',
        ride: 'Dynamic Air Comfort',
        features: [
          'Face-to-face executive conference seating',
          'Tri-zone automatic climate control',
          'Foldable conference table',
          'Generous luggage volume'
        ],
        mainImage: '/cars/v-class.webp',
        transparentImage: '/cars/v-class.png',
        gallery: ['/cars/v-class.webp', '/images/about-vclass-chauffeur.webp'],
        availability: 'AVAILABLE',
        displayOrder: 3,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'veh_sprinter',
        vehicleId: 'sprinter',
        name: 'Mercedes-Benz Sprinter',
        category: 'VIP Group Minibus',
        badge: 'VIP Group Minibus',
        tagline: 'Grand Luxury for Delegations & Large Groups',
        shortDescription: 'Grand touring minibus for delegations and private events. Standing room cabin, executive club seating.',
        fullDescription: 'Custom-tailored VIP Mercedes-Benz Sprinter accommodating up to 8-16 passengers in leather club seating with generous headroom and luggage capacity.',
        passengers: '8-16 Guests',
        luggage: '12 Large Bags',
        ride: 'Heavy-Duty Comfort Suspension',
        features: [
          'Full-height standing cabin with LED mood lighting',
          'Reclining leather captain chairs',
          'Central HDMI display & PA system',
          'Individual reading lights and USB ports'
        ],
        mainImage: '/cars/sprinter.webp',
        transparentImage: '/cars/sprinter.png',
        gallery: ['/cars/sprinter.webp'],
        availability: 'ON_REQUEST',
        displayOrder: 4,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'veh_armored',
        vehicleId: 'armored',
        name: 'Armored Luxury Vehicle',
        category: 'Security & Diplomatic Escort',
        badge: 'Ballistic Protection VR6/VR7',
        tagline: 'Certified Ballistic & Blast Security Protection',
        shortDescription: 'Certified ballistic and blast-protected transportation for VIPs, diplomats, and high-profile executives.',
        fullDescription: 'VR6/VR7 certified armored luxury limousine with run-flat tire systems, emergency oxygen supply, intercom communications, and specialized close-protection certified chauffeurs.',
        passengers: '3 Guests',
        luggage: '2 Large Bags',
        ride: 'Reinforced Security Suspension',
        features: [
          'Certified VR6 / VR7 ballistic steel armor plating',
          'Multi-layer polycarbonate bullet-resistant glass',
          'Run-flat tire inserts & reinforced braking system',
          'Discreet civilian appearance & police-vetted chauffeurs'
        ],
        mainImage: '/cars/armored.webp',
        transparentImage: '/cars/armored.png',
        gallery: ['/cars/armored.webp'],
        availability: 'ON_REQUEST',
        displayOrder: 5,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  } catch (err) {
    console.warn('[DB] Note loading fleet:', err.message);
  }

  // 4. Load Services
  memoryStore.services = [
    {
      id: 'srv_airport',
      slug: 'airport-transfers',
      name: 'Airport Transfers',
      shortDesc: 'Vienna International Airport (VIE) & Bratislava Airport (BTS) meet & greet service with 60 minutes complimentary waiting time.',
      fullDesc: 'Flight-tracked meet & greet chauffeur service from Vienna Schwechat or Bratislava Airport directly to your residence, hotel, or office.',
      features: ['Flight tracking included', '60 mins complimentary wait', 'Meet & Greet with nameboard', 'Fixed all-inclusive rates'],
      image: '/images/vienna-palace-backdrop.webp',
      ctaLabel: 'Book Airport Transfer',
      ctaUrl: '/airport-transfer-vienna/',
      displayOrder: 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'srv_hourly',
      slug: 'hourly-chauffeur',
      name: 'Hourly Chauffeur Service',
      shortDesc: 'Flexible by-the-hour private Mercedes chauffeur at your complete disposal for business meetings, shopping, or dinners.',
      fullDesc: 'Your dedicated chauffeur remains on standby wherever your schedule takes you throughout Vienna and Lower Austria.',
      features: ['Continuous chauffeur standby', 'Unlimited stops within itinerary', 'Complimentary bottled water & Wi-Fi', 'Minimum 2 hours hire'],
      image: '/images/about-vclass-chauffeur.webp',
      ctaLabel: 'Hire Hourly Chauffeur',
      ctaUrl: '/hourly-chauffeur-service/',
      displayOrder: 2,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'srv_daytrips',
      slug: 'private-day-trips',
      name: 'Private Day Trips',
      shortDesc: 'Custom day tours to Hallstatt, Salzburg, Budapest, Prague, Bratislava, and Wachau Valley in luxury Mercedes vehicles.',
      fullDesc: 'Experience Central Europe at your own relaxed pace with door-to-door hotel pickup and scenic scenic routes.',
      features: ['Door-to-door hotel pickup', 'Flexible departure times', 'Panoramic scenic stops', 'Multi-country experienced drivers'],
      image: '/images/vienna-palace-backdrop.webp',
      ctaLabel: 'Explore Destinations',
      ctaUrl: '/customized-day-trips/',
      displayOrder: 3,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'srv_secure',
      slug: 'secure-transportation',
      name: 'Secure & Diplomatic Transportation',
      shortDesc: 'Discreet, high-security transfers and multi-vehicle convoys for government delegations, VIPs, and corporate executives.',
      fullDesc: 'Specialized close-protection transport, route reconnaissance, and discrete armored vehicle logistics in Vienna.',
      features: ['Background-checked close protection drivers', 'Armored vehicle availability (VR6/VR7)', 'Advance route security reconnaissance', 'Strict non-disclosure agreements'],
      image: '/images/secure-transportation.webp',
      ctaLabel: 'Request Security Protocol',
      ctaUrl: '/secure-transportation/',
      displayOrder: 4,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // 5. Load Day Trips
  memoryStore.dayTrips = [
    {
      id: 'tour_hallstatt',
      slug: 'hallstatt-day-trip-from-vienna',
      name: 'Hallstatt Day Trip',
      title: 'Hallstatt Day Trip from Vienna — Private Chauffeur Tour',
      eyebrow: 'UNESCO WORLD HERITAGE REGION',
      shortDesc: 'Discover the fairytale Alpine village of Hallstatt, Lake Hallstatt, and Salzkammergut mountain panoramas.',
      fullDesc: 'Journey through the Salzkammergut Lake District to Austria’s most picturesque lakeside village. Enjoy a private boat ride, the ancient salt mine, and breathtaking views from the Skywalk.',
      duration: '11–12 Hours',
      image: '/images/Hallstatt.jpg',
      price: 'From €650',
      isPublished: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tour_salzburg',
      slug: 'salzburg-day-trip',
      name: 'Salzburg Day Trip',
      title: 'Salzburg Private Day Trip from Vienna',
      eyebrow: 'BIRTHPLACE OF MOZART',
      shortDesc: 'Explore Mozart’s birthplace, Mirabell Gardens, Hohensalzburg Fortress, and Sound of Music filming locations.',
      fullDesc: 'Travel through the Austrian countryside to the Baroque jewel of Salzburg. Walk through the Getreidegasse and visit the iconic fortress.',
      duration: '12 Hours',
      image: 'https://viennadaytrip.com/wp-content/uploads/2026/03/St.-Gilgen-–-Coffee-Stop-by-the-Lake.jpg',
      price: 'From €680',
      isPublished: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tour_budapest',
      slug: 'budapest-day-trip',
      name: 'Budapest Day Trip',
      title: 'Budapest Private Chauffeur Day Trip from Vienna',
      eyebrow: 'PEARL OF THE DANUBE',
      shortDesc: 'Cross the border to Hungary’s majestic capital. Marvel at Buda Castle, the Parliament Building, and Fisherman’s Bastion.',
      fullDesc: 'Experience the grandeur of Budapest with private door-to-door transfer across Hungary.',
      duration: '11–12 Hours',
      image: '/images/gallery-budapest.webp',
      price: 'From €640',
      isPublished: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tour_prague',
      slug: 'prague-day-trip',
      name: 'Prague Day Trip',
      title: 'Prague Private Day Trip from Vienna',
      eyebrow: 'CITY OF A HUNDRED SPIRES',
      shortDesc: 'Immerse yourself in historic Prague: Charles Bridge, Prague Castle, and the Astronomical Clock.',
      fullDesc: 'A comfortable full-day private journey from Vienna to the historic heart of Bohemia.',
      duration: '13–14 Hours',
      image: 'https://viennadaytrip.com/wp-content/uploads/2026/03/extra.webp',
      price: 'From €750',
      isPublished: true,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tour_bratislava',
      slug: 'bratislava-day-trip',
      name: 'Bratislava Day Trip',
      title: 'Bratislava Day Trip from Vienna',
      eyebrow: 'SLOVAKIA’S CROWN CITY',
      shortDesc: 'A rapid 50-minute private transfer to Slovakia’s charming capital on the Danube.',
      fullDesc: 'Visit Bratislava Castle, the medieval Old Town, and St. Martin’s Cathedral in a relaxed half-day or full-day tour.',
      duration: '6–8 Hours',
      image: '/images/gallery-bratislava.webp',
      price: 'From €320',
      isPublished: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tour_wachau',
      slug: 'wachau-valley-trip',
      name: 'Wachau Valley Day Trip',
      title: 'Wachau Wine Valley & Melk Abbey Tour',
      eyebrow: 'DANUBE VALLEY & VINEYARDS',
      shortDesc: 'Terraced vineyards, Dürnstein Castle ruins, and the breathtaking Baroque Melk Abbey.',
      fullDesc: 'Follow the scenic Danube River through Austria’s most celebrated wine-growing region with wine tasting opportunities.',
      duration: '8–9 Hours',
      image: '/images/gallery-wachau.webp',
      price: 'From €490',
      isPublished: true,
      displayOrder: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  persistStore();
  console.log('[DB] Store initialized and persisted to server/data/store.json.');
}

// Hydrate newly created and published articles from Sanity Cloud CMS (Safely Disabled)
export async function hydrateFromSanity() {
  // Sanity background synchronization disabled: Express operates authoritatively on PostgreSQL & persistent store
  return;
  const sanityToken = process.env.SANITY_API_TOKEN;
  const projectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm';
  const dataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';

  try {
    const { createClient } = await import('@sanity/client');
    const sanity = createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      token: sanityToken || undefined,
      useCdn: false
    });

    const sanityBlogs = await sanity.fetch(`*[_type == "blogPost"] {
      _id,
      title,
      slug,
      excerpt,
      content,
      categoryName,
      author,
      publishedAt,
      modifiedAt,
      isPublished,
      coverImage,
      seo
    }`);

    if (Array.isArray(sanityBlogs) && sanityBlogs.length > 0) {
      let hydratedCount = 0;
      for (const sb of sanityBlogs) {
        const slug = typeof sb.slug === 'string' ? sb.slug : sb.slug?.current;
        if (!slug) continue;
        const formatted = {
          id: sb._id,
          slug,
          title: sb.title || 'Untitled',
          excerpt: sb.excerpt || '',
          content: sb.content || '',
          featuredImage: sb.coverImage?.imageUrl || '/images/vienna-palace-backdrop.webp',
          featuredImageAlt: sb.coverImage?.alt || sb.title || '',
          featuredImageTitle: sb.coverImage?.title || '',
          featuredImageCaption: '',
          category: sb.categoryName || 'Travel Guides',
          categories: [sb.categoryName || 'Travel Guides'],
          author: sb.author || 'Vienna Day Trip Concierge',
          date: sb.publishedAt
            ? new Date(sb.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'October 2026',
          rawDate: sb.publishedAt || new Date().toISOString(),
          modified: sb.modifiedAt || new Date().toISOString(),
          isPublished: sb.isPublished !== false,
          seo: sb.seo || { metaTitle: sb.title, metaDescription: sb.excerpt },
          createdAt: sb.publishedAt || new Date().toISOString(),
          updatedAt: sb.modifiedAt || new Date().toISOString()
        };

        const existingIdx = memoryStore.blogs.findIndex((b) => b.slug === slug);
        if (existingIdx !== -1) {
          memoryStore.blogs[existingIdx] = { ...memoryStore.blogs[existingIdx], ...formatted };
        } else {
          memoryStore.blogs.unshift(formatted);
          hydratedCount++;
        }
      }
      if (hydratedCount > 0) {
        console.log(`[Sanity CMS] Successfully hydrated ${hydratedCount} persistent article(s) into database store.`);
        persistStore();
      }
    }
  } catch (err) {
    console.warn('[Sanity CMS] Hydration note:', err.message);
  }
}

// Helper to resolve Neon database URL with fallback DNS when local ISP/router returns RCODE_REFUSED
export async function getResilientDatabaseUrl(rawUrl, forceResolve = false) {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname;
    if (!host.includes('neon.tech')) return rawUrl;

    const dns = await import('dns');
    if (!forceResolve) {
      try {
        await dns.promises.lookup(host);
        return rawUrl; // Native lookup succeeds
      } catch (e) {
        // Local DNS failed (e.g. JioFiber / router RCODE_REFUSED)
      }
    }

    const resolver = new dns.promises.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    const ips = await resolver.resolve4(host);
    if (!ips || ips.length === 0) return rawUrl;

    const resolvedIp = ips[0];
    const endpointMatch = host.match(/^(ep-[a-z0-9-]+?)(-pooler)?\./);
    const endpointId = endpointMatch ? endpointMatch[1] : '';

    parsed.hostname = resolvedIp;
    if (endpointId) {
      parsed.searchParams.set('options', `endpoint=${endpointId}`);
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

// Check real PostgreSQL connection on startup
export async function initDatabase() {
  if (prisma) {
    try {
      await prisma.$connect();
      isPostgresConnected = true;
      console.log(`✅ [PostgreSQL] Connected successfully via Prisma ORM (${maskDatabaseUrl(resolvedDatabaseUrl)}).`);
    } catch (err) {
      // Try resilient DNS fallback for local environments where router DNS refuses Neon host
      try {
        const resilientUrl = await getResilientDatabaseUrl(resolvedDatabaseUrl, true);
        if (resilientUrl && resilientUrl !== resolvedDatabaseUrl) {
          prisma = new PrismaClient({
            datasources: { db: { url: resilientUrl } },
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
          });
          await prisma.$connect();
          isPostgresConnected = true;
          console.log(`✅ [PostgreSQL] Connected successfully to Neon via resilient cloud DNS (${maskDatabaseUrl(resolvedDatabaseUrl)}).`);
        } else {
          throw err;
        }
      } catch (retryErr) {
        isPostgresConnected = false;
        console.warn(`⚠️ [PostgreSQL] Database not reachable at ${maskDatabaseUrl(resolvedDatabaseUrl)}. Running in resilient persistent storage mode.`);
      }
    }
  }
  await loadSeedData();
  await hydrateFromSanity();
}

let initPromise = null;
export async function ensureDbInitialized() {
  if (!initPromise) {
    initPromise = initDatabase();
  }
  return initPromise;
}

// Database Abstraction Object (Provides unified API whether PostgreSQL is active or local store is active)
export const db = {
  get isConnectedToPostgres() {
    return isPostgresConnected;
  },

  // USERS
  users: {
    async findUnique({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.adminUser.findUnique({ where }); } catch (e) {}
      }
      if (where.email) return memoryStore.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      if (where.id) return memoryStore.users.find((u) => u.id === where.id) || null;
      return null;
    },
    async findMany() {
      if (isPostgresConnected) {
        try { return await prisma.adminUser.findMany(); } catch (e) {}
      }
      return memoryStore.users.map(({ passwordHash, ...rest }) => rest);
    },
    async create({ data }) {
      if (isPostgresConnected) {
        try { return await prisma.adminUser.create({ data }); } catch (e) {}
      }
      const newUser = {
        id: `usr_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.users.push(newUser);
      persistStore();
      const { passwordHash, ...rest } = newUser;
      return rest;
    },
    async update({ where, data }) {
      if (isPostgresConnected) {
        try { return await prisma.adminUser.update({ where, data }); } catch (e) {}
      }
      const idx = memoryStore.users.findIndex((u) => u.id === where.id || u.email === where.email);
      if (idx !== -1) {
        memoryStore.users[idx] = { ...memoryStore.users[idx], ...data, updatedAt: new Date().toISOString() };
        persistStore();
        const { passwordHash, ...rest } = memoryStore.users[idx];
        return rest;
      }
      return null;
    },
    async delete({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.adminUser.delete({ where }); } catch (e) {}
      }
      memoryStore.users = memoryStore.users.filter((u) => u.id !== where.id);
      persistStore();
      return { success: true };
    }
  },

  // BOOKINGS
  bookings: {
    _hydrateBooking(b) {
      if (!b) return b;
      const notes = b.internalNotes || '';
      const match = notes.match(/\[PAYMENT_META\]([\s\S]*?)\[\/PAYMENT_META\]/);
      let meta = null;
      if (match) {
        try { meta = JSON.parse(match[1]); } catch {}
      }
      return {
        ...b,
        paymentStatus: b.paymentStatus || meta?.status || (notes.includes('PAID via') ? 'PAID' : 'UNPAID'),
        paymentAmount: b.paymentAmount !== undefined ? b.paymentAmount : (meta?.amount ?? 0),
        currency: b.currency || meta?.currency || 'EUR',
        stripeSessionId: b.stripeSessionId || meta?.sessionId || null,
        stripePaymentIntentId: b.stripePaymentIntentId || meta?.paymentIntentId || null,
        paymentTimestamp: b.paymentTimestamp || meta?.timestamp || null
      };
    },

    async findMany({ where, orderBy, take, skip } = {}) {
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required to query bookings.');
      }
      const pgBookings = await prisma.booking.findMany({ where, orderBy, take, skip });
      return Array.isArray(pgBookings) ? pgBookings.map((b) => this._hydrateBooking(b)) : [];
    },

    async count({ where } = {}) {
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required to count bookings.');
      }
      return await prisma.booking.count({ where });
    },

    async findUnique({ where }) {
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required to find booking.');
      }
      const found = await prisma.booking.findUnique({ where });
      return found ? this._hydrateBooking(found) : null;
    },

    async create({ data }) {
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required to persist bookings.');
      }

      const validPrismaKeys = new Set([
        'reference', 'customerName', 'email', 'phone', 'serviceType',
        'pickupLocation', 'dropoffLocation', 'pickupDate', 'pickupTime',
        'passengerCount', 'luggageDetails', 'preferredVehicle', 'specialRequests',
        'status', 'internalNotes', 'source',
        // Payment fields — native columns on Booking
        'paymentStatus', 'paymentAmount', 'currency',
        'stripeSessionId', 'stripePaymentIntentId', 'paymentTimestamp',
        'promoCode', 'childSeatCount'
      ]);

      const prismaData = {};
      for (const [k, v] of Object.entries(data)) {
        if (validPrismaKeys.has(k)) prismaData[k] = v;
      }

      // Ensure Prisma-compatible types
      if (prismaData.passengerCount !== undefined) {
        prismaData.passengerCount = String(prismaData.passengerCount);
      }
      if (!prismaData.phone) {
        prismaData.phone = '+43 664 000 0000';
      }
      if (prismaData.paymentStatus === undefined) {
        prismaData.paymentStatus = 'UNPAID';
      }
      if (prismaData.currency === undefined) {
        prismaData.currency = 'EUR';
      }

      // Embed payment metadata into internalNotes for audit trail
      if (data.paymentStatus || data.paymentAmount !== undefined || data.stripeSessionId) {
        const paymentMeta = {
          status: data.paymentStatus || 'UNPAID',
          amount: data.paymentAmount !== undefined ? data.paymentAmount : 0,
          currency: data.currency || 'EUR',
          sessionId: data.stripeSessionId || null,
          paymentIntentId: data.stripePaymentIntentId || null,
          timestamp: data.paymentTimestamp || new Date().toISOString()
        };
        const metaTag = `[PAYMENT_META]${JSON.stringify(paymentMeta)}[/PAYMENT_META]`;
        const currentNotes = (prismaData.internalNotes || '').replace(/\[PAYMENT_META\][\s\S]*?\[\/PAYMENT_META\]/, '').trim();
        prismaData.internalNotes = currentNotes ? `${currentNotes}\n${metaTag}` : metaTag;
      }

      const created = await prisma.booking.create({ data: prismaData });
      return this._hydrateBooking(created);
    },

    async update({ where, data }) {
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required to update bookings.');
      }

      const validPrismaKeys = new Set([
        'reference', 'customerName', 'email', 'phone', 'serviceType',
        'pickupLocation', 'dropoffLocation', 'pickupDate', 'pickupTime',
        'passengerCount', 'luggageDetails', 'preferredVehicle', 'specialRequests',
        'status', 'internalNotes', 'source',
        // Payment fields — native columns on Booking
        'paymentStatus', 'paymentAmount', 'currency',
        'stripeSessionId', 'stripePaymentIntentId', 'paymentTimestamp',
        'promoCode', 'childSeatCount'
      ]);

      const prismaData = {};
      for (const [k, v] of Object.entries(data)) {
        if (validPrismaKeys.has(k)) prismaData[k] = v;
      }

      if (prismaData.passengerCount !== undefined) {
        prismaData.passengerCount = String(prismaData.passengerCount);
      }

      // Embed payment metadata into internalNotes so payment status persists in PostgreSQL audit
      if (data.paymentStatus || data.paymentAmount !== undefined || data.stripeSessionId) {
        const paymentMeta = {
          status: data.paymentStatus || 'UNPAID',
          amount: data.paymentAmount !== undefined ? data.paymentAmount : 0,
          currency: data.currency || 'EUR',
          sessionId: data.stripeSessionId || null,
          paymentIntentId: data.stripePaymentIntentId || null,
          timestamp: data.paymentTimestamp || new Date().toISOString()
        };
        const metaTag = `[PAYMENT_META]${JSON.stringify(paymentMeta)}[/PAYMENT_META]`;
        const currentNotes = (data.internalNotes || prismaData.internalNotes || '').replace(/\[PAYMENT_META\][\s\S]*?\[\/PAYMENT_META\]/, '').trim();
        prismaData.internalNotes = currentNotes ? `${currentNotes}\n${metaTag}` : metaTag;
      }

      const updated = await prisma.booking.update({ where, data: prismaData });
      return this._hydrateBooking(updated);
    },

    async delete({ where }) {
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required to delete bookings.');
      }
      return await prisma.booking.delete({ where });
    }
  },

  // WEBHOOK EVENT IDEMPOTENCY — database-backed to survive Vercel cold starts
  // Database-backed idempotency table: ProcessedWebhookEvent
  webhookEvents: {
    _memCache: new Set(),

    async hasProcessed(eventId) {
      if (!eventId) return false;
      // Fast path: Check in-memory cache for events already processed in current process
      if (this._memCache.has(eventId)) return true;
      // Database verification: PostgreSQL connection strictly required
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required for webhook idempotency check.');
      }
      const existing = await prisma.processedWebhookEvent.findUnique({ where: { eventId } });
      if (existing) {
        this._memCache.add(eventId); // Warm the cache
        return true;
      }
      return false;
    },

    async markProcessed(eventId, eventType, bookingRef) {
      if (!eventId) return;
      if (!isPostgresConnected || !prisma) {
        throw new Error('[DB] Database unavailable: PostgreSQL connection required to record processed webhook event.');
      }
      await prisma.processedWebhookEvent.upsert({
        where: { eventId },
        update: { eventType, bookingRef: bookingRef || null },
        create: { eventId, eventType, bookingRef: bookingRef || null }
      });
      this._memCache.add(eventId);
      // Prune in-memory cache if too large
      if (this._memCache.size > 2000) {
        const oldest = Array.from(this._memCache).slice(0, 500);
        oldest.forEach((id) => this._memCache.delete(id));
      }
    }
  },

  // CONTACT ENQUIRIES
  enquiries: {
    async findMany({ where, orderBy, take, skip } = {}) {
      if (isPostgresConnected) {
        try { return await prisma.contactEnquiry.findMany({ where, orderBy, take, skip }); } catch (e) {}
      }
      let result = [...memoryStore.enquiries];
      if (where?.status) result = result.filter((e) => e.status === where.status);
      if (where?.isArchived !== undefined) result = result.filter((e) => e.isArchived === where.isArchived);
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (skip) result = result.slice(skip);
      if (take) result = result.slice(0, take);
      return result;
    },
    async count({ where } = {}) {
      if (isPostgresConnected) {
        try { return await prisma.contactEnquiry.count({ where }); } catch (e) {}
      }
      let result = memoryStore.enquiries;
      if (where?.status) result = result.filter((e) => e.status === where.status);
      if (where?.isArchived !== undefined) result = result.filter((e) => e.isArchived === where.isArchived);
      return result.length;
    },
    async findUnique({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.contactEnquiry.findUnique({ where }); } catch (e) {}
      }
      return memoryStore.enquiries.find((e) => e.id === where.id || e.reference === where.reference) || null;
    },
    async create({ data }) {
      if (isPostgresConnected) {
        try { return await prisma.contactEnquiry.create({ data }); } catch (e) {}
      }
      const newEnq = {
        id: `enq_${Date.now()}`,
        status: 'NEW',
        isArchived: false,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.enquiries.unshift(newEnq);
      persistStore();
      return newEnq;
    },
    async update({ where, data }) {
      if (isPostgresConnected) {
        try { return await prisma.contactEnquiry.update({ where, data }); } catch (e) {}
      }
      const idx = memoryStore.enquiries.findIndex((e) => e.id === where.id || e.reference === where.reference);
      if (idx !== -1) {
        memoryStore.enquiries[idx] = { ...memoryStore.enquiries[idx], ...data, updatedAt: new Date().toISOString() };
        persistStore();
        return memoryStore.enquiries[idx];
      }
      return null;
    }
  },

  // VEHICLES (FLEET)
  vehicles: {
    async findMany({ where, orderBy } = {}) {
      if (isPostgresConnected) {
        try { return await prisma.vehicle.findMany({ where, orderBy }); } catch (e) {}
      }
      let list = [...memoryStore.vehicles];
      if (where?.isPublished !== undefined) list = list.filter((v) => v.isPublished === where.isPublished);
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return list;
    },
    async findUnique({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.vehicle.findUnique({ where }); } catch (e) {}
      }
      return memoryStore.vehicles.find((v) => v.id === where.id || v.vehicleId === where.vehicleId) || null;
    },
    async create({ data }) {
      if (isPostgresConnected) {
        try { return await prisma.vehicle.create({ data }); } catch (e) {}
      }
      const item = {
        id: `veh_${Date.now()}`,
        isPublished: true,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.vehicles.push(item);
      persistStore();
      return item;
    },
    async update({ where, data }) {
      if (isPostgresConnected) {
        try { return await prisma.vehicle.update({ where, data }); } catch (e) {}
      }
      const idx = memoryStore.vehicles.findIndex((v) => v.id === where.id || v.vehicleId === where.vehicleId);
      if (idx !== -1) {
        memoryStore.vehicles[idx] = { ...memoryStore.vehicles[idx], ...data, updatedAt: new Date().toISOString() };
        persistStore();
        return memoryStore.vehicles[idx];
      }
      return null;
    },
    async delete({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.vehicle.delete({ where }); } catch (e) {}
      }
      memoryStore.vehicles = memoryStore.vehicles.filter((v) => v.id !== where.id && v.vehicleId !== where.vehicleId);
      persistStore();
      return { success: true };
    }
  },

  // BLOGS
  blogs: {
    async findMany({ where, orderBy, take, skip } = {}) {
      if (isPostgresConnected) {
        try {
          const pgList = await prisma.blogPost.findMany({ where, orderBy, take, skip });
          if (Array.isArray(pgList) && pgList.length > 0) return pgList;
        } catch (e) {
          console.warn('[DB] Prisma findMany blogs note:', e.message);
        }
      }
      let list = [...memoryStore.blogs];
      if (where?.isPublished !== undefined) list = list.filter((b) => b.isPublished === where.isPublished);
      if (where?.category && where.category !== 'All') {
        list = list.filter((b) => b.category?.toLowerCase() === where.category.toLowerCase());
      }
      list.sort((a, b) => new Date(b.createdAt || b.rawDate || 0) - new Date(a.createdAt || a.rawDate || 0));
      if (skip) list = list.slice(skip);
      if (take) list = list.slice(0, take);
      return list;
    },
    async count({ where } = {}) {
      if (isPostgresConnected) {
        try {
          const c = await prisma.blogPost.count({ where });
          if (c > 0) return c;
        } catch (e) {}
      }
      let list = memoryStore.blogs;
      if (where?.isPublished !== undefined) list = list.filter((b) => b.isPublished === where.isPublished);
      return list.length;
    },
    async findUnique({ where }) {
      if (isPostgresConnected) {
        try {
          const item = await prisma.blogPost.findUnique({ where });
          if (item) return item;
        } catch (e) {}
      }
      return memoryStore.blogs.find((b) => (where.id && b.id === where.id) || (where.slug && b.slug === where.slug)) || null;
    },
    async create({ data }) {
      const isPub = data.isPublished !== false;
      const cleanSlug = (data.slug || data.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      let created = null;

      if (isPostgresConnected) {
        try {
          const prismaSafeData = {
            slug: cleanSlug,
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            featuredImage: data.featuredImage || '/images/vienna-palace-backdrop.webp',
            category: data.category || 'Travel Guides',
            categories: data.categories || [data.category || 'Travel Guides'],
            author: data.author || 'Vienna Day Trip Concierge',
            date: data.date || 'October 2026',
            rawDate: data.rawDate || new Date().toISOString(),
            isPublished: isPub,
            seo: data.seo || {}
          };
          created = await prisma.blogPost.create({ data: prismaSafeData });
        } catch (e) {
          console.error('[DB Error] Prisma create blogPost note:', e.message);
        }
      }

      const item = {
        id: created?.id || `blog_${Date.now()}`,
        ...data,
        slug: cleanSlug,
        isPublished: isPub,
        createdAt: data.rawDate || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // Prevent duplicates in memoryStore
      const existingIdx = memoryStore.blogs.findIndex((b) => b.slug === cleanSlug);
      if (existingIdx !== -1) {
        memoryStore.blogs[existingIdx] = item;
      } else {
        memoryStore.blogs.unshift(item);
      }
      persistStore();
      return created || item;
    },
    async update({ where, data }) {
      let updated = null;
      if (isPostgresConnected) {
        try {
          const prismaSafeData = { ...data };
          delete prismaSafeData.featuredImageAlt;
          delete prismaSafeData.featuredImageTitle;
          delete prismaSafeData.featuredImageCaption;
          delete prismaSafeData.modified;
          updated = await prisma.blogPost.update({ where, data: prismaSafeData });
        } catch (e) {
          console.warn('[DB Error] Prisma update blogPost note:', e.message);
        }
      }
      const idx = memoryStore.blogs.findIndex((b) => (where.id && b.id === where.id) || (where.slug && b.slug === where.slug));
      if (idx !== -1) {
        memoryStore.blogs[idx] = { ...memoryStore.blogs[idx], ...data, updatedAt: new Date().toISOString() };
        persistStore();
        return updated || memoryStore.blogs[idx];
      }
      return updated;
    },
    async delete({ where }) {
      if (isPostgresConnected) {
        try { await prisma.blogPost.delete({ where }); } catch (e) {}
      }
      memoryStore.blogs = memoryStore.blogs.filter((b) => b.id !== where.id && b.slug !== where.slug);
      persistStore();
      return { success: true };
    }
  },

  // SERVICES
  services: {
    async findMany({ where } = {}) {
      if (isPostgresConnected) {
        try {
          return await prisma.service.findMany({
            where,
            orderBy: { displayOrder: 'asc' }
          });
        } catch (e) {
          console.warn('[DB] Prisma findMany services note:', e.message);
        }
      }
      let list = [...memoryStore.services];
      if (where?.isPublished !== undefined) list = list.filter((s) => s.isPublished === where.isPublished);
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return list;
    },
    async findUnique({ where }) {
      if (isPostgresConnected) {
        try {
          return await prisma.service.findUnique({ where });
        } catch (e) {
          console.warn('[DB] Prisma findUnique service note:', e.message);
        }
      }
      return memoryStore.services.find((s) => (where.id && s.id === where.id) || (where.slug && s.slug === where.slug)) || null;
    },
    async create({ data }) {
      let created = null;
      if (isPostgresConnected) {
        try {
          created = await prisma.service.create({ data });
        } catch (e) {
          console.error('[DB Error] Prisma create service failed:', e.message);
          throw e;
        }
      }
      if (!created) {
        created = {
          id: `srv_${Date.now()}`,
          isPublished: true,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      // Ensure memoryStore and store.json are kept in sync
      memoryStore.services = memoryStore.services.filter((s) => s.id !== created.id && s.slug !== created.slug);
      memoryStore.services.push(created);
      persistStore();
      return created;
    },
    async update({ where, data }) {
      let updated = null;
      if (isPostgresConnected) {
        try {
          updated = await prisma.service.update({ where, data });
        } catch (e) {
          console.error('[DB Error] Prisma update service failed:', e.message);
          throw e;
        }
      }
      if (!updated) {
        const idx = memoryStore.services.findIndex((s) => (where.id && s.id === where.id) || (where.slug && s.slug === where.slug));
        if (idx !== -1) {
          memoryStore.services[idx] = { ...memoryStore.services[idx], ...data, updatedAt: new Date().toISOString() };
          updated = memoryStore.services[idx];
        }
      } else {
        const idx = memoryStore.services.findIndex((s) => s.id === updated.id);
        if (idx !== -1) {
          memoryStore.services[idx] = updated;
        } else {
          memoryStore.services.push(updated);
        }
      }
      persistStore();
      return updated;
    },
    async delete({ where }) {
      if (isPostgresConnected) {
        try {
          await prisma.service.delete({ where });
        } catch (e) {
          console.error('[DB Error] Prisma delete service failed:', e.message);
          throw e;
        }
      }
      memoryStore.services = memoryStore.services.filter((s) => (where.id && s.id !== where.id) && (where.slug && s.slug !== where.slug));
      persistStore();
      return { success: true };
    }
  },

  // DAY TRIPS
  dayTrips: {
    async findMany({ where } = {}) {
      if (isPostgresConnected) {
        try { return await prisma.dayTrip.findMany({ where }); } catch (e) {}
      }
      let list = [...memoryStore.dayTrips];
      if (where?.isPublished !== undefined) list = list.filter((d) => d.isPublished === where.isPublished);
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return list;
    },
    async findUnique({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.dayTrip.findUnique({ where }); } catch (e) {}
      }
      return memoryStore.dayTrips.find((d) => d.id === where.id || d.slug === where.slug) || null;
    },
    async create({ data }) {
      if (isPostgresConnected) {
        try { return await prisma.dayTrip.create({ data }); } catch (e) {}
      }
      const item = {
        id: `tour_${Date.now()}`,
        isPublished: true,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.dayTrips.push(item);
      persistStore();
      return item;
    },
    async update({ where, data }) {
      if (isPostgresConnected) {
        try { return await prisma.dayTrip.update({ where, data }); } catch (e) {}
      }
      const idx = memoryStore.dayTrips.findIndex((d) => d.id === where.id || d.slug === where.slug);
      if (idx !== -1) {
        memoryStore.dayTrips[idx] = { ...memoryStore.dayTrips[idx], ...data, updatedAt: new Date().toISOString() };
        persistStore();
        return memoryStore.dayTrips[idx];
      }
      return null;
    },
    async delete({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.dayTrip.delete({ where }); } catch (e) {}
      }
      memoryStore.dayTrips = memoryStore.dayTrips.filter((d) => d.id !== where.id && d.slug !== where.slug);
      persistStore();
      return { success: true };
    }
  },

  // MEDIA ASSETS
  media: {
    async findMany() {
      if (isPostgresConnected) {
        try { return await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) {}
      }
      return memoryStore.media;
    },
    async create({ data }) {
      if (isPostgresConnected) {
        try { return await prisma.mediaAsset.create({ data }); } catch (e) {}
      }
      const item = {
        id: `med_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString()
      };
      memoryStore.media.unshift(item);
      persistStore();
      return item;
    },
    async delete({ where }) {
      if (isPostgresConnected) {
        try { return await prisma.mediaAsset.delete({ where }); } catch (e) {}
      }
      memoryStore.media = memoryStore.media.filter((m) => m.id !== where.id);
      persistStore();
      return { success: true };
    }
  },

  // SETTINGS & REVIEWS & TRANSLATIONS
  settings: {
    async get() {
      if (isPostgresConnected) {
        try {
          const res = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
          if (res) return res;
        } catch (e) {}
      }
      return memoryStore.settings;
    },
    async update(data) {
      if (isPostgresConnected) {
        try {
          return await prisma.siteSettings.upsert({
            where: { id: 'singleton' },
            update: data,
            create: { id: 'singleton', ...data }
          });
        } catch (e) {}
      }
      memoryStore.settings = { ...memoryStore.settings, ...data, updatedAt: new Date().toISOString() };
      persistStore();
      return memoryStore.settings;
    }
  },

  reviews: {
    async get() {
      if (isPostgresConnected) {
        try {
          const res = await prisma.reviewIntegration.findUnique({ where: { id: 'singleton' } });
          if (res) return res;
        } catch (e) {}
      }
      return memoryStore.reviews;
    },
    async update(data) {
      if (isPostgresConnected) {
        try {
          return await prisma.reviewIntegration.upsert({
            where: { id: 'singleton' },
            update: data,
            create: { id: 'singleton', ...data }
          });
        } catch (e) {}
      }
      memoryStore.reviews = { ...memoryStore.reviews, ...data, updatedAt: new Date().toISOString() };
      persistStore();
      return memoryStore.reviews;
    }
  },

  // AUDIT LOGS
  audit: {
    async log({ userId, action, entity, entityId, details, ipAddress }) {
      if (isPostgresConnected) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: userId || undefined,
              action: action || 'ACTION',
              entity: entity || 'SYSTEM',
              entityId: entityId ? String(entityId) : undefined,
              details: details || undefined,
              ipAddress: ipAddress || undefined
            }
          });
        } catch (e) {
          // Fallback to local memory log
        }
      }
      const entry = {
        id: `aud_${Date.now()}`,
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        createdAt: new Date().toISOString()
      };
      memoryStore.auditLogs.unshift(entry);
      if (memoryStore.auditLogs.length > 500) memoryStore.auditLogs.pop();
      persistStore();
    },
    async getRecent(limit = 20) {
      if (isPostgresConnected) {
        try {
          const logs = await prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' }
          });
          if (logs && logs.length > 0) return logs;
        } catch (e) {}
      }
      return memoryStore.auditLogs.slice(0, limit);
    }
  }
};
