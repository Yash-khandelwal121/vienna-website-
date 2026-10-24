import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@sanity/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const storePath = path.join(rootDir, 'server', 'data', 'store.json');
const ndjsonOutputPath = path.join(rootDir, 'sanity-import.ndjson');

console.log('====================================================');
console.log(' VIENNA DAY TRIP — SANITY CMS CONTENT IMPORTER');
console.log('====================================================');

if (!fs.existsSync(storePath)) {
  console.error(`❌ Error: Source store not found at ${storePath}`);
  process.exit(1);
}

const rawStore = fs.readFileSync(storePath, 'utf8');
const store = JSON.parse(rawStore);

const projectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm';
const dataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

console.log(`📌 Project ID: ${projectId}`);
console.log(`📌 Dataset:    ${dataset}`);
console.log(`📌 Token:      ${token ? 'Found (API Write Enabled)' : 'Not Set (Will generate NDJSON only)'}`);

// Prepare documents array
const sanityDocuments = [];

// 1. Process Categories
const categoryMap = new Map();
const blogs = store.blogs || [];

blogs.forEach((b) => {
  const cat = b.category || 'Luxury Travel';
  if (!categoryMap.has(cat)) {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const catId = `category-${slug}`;
    categoryMap.set(cat, {
      _id: catId,
      _type: 'blogCategory',
      title: cat,
      slug: { _type: 'slug', current: slug },
      description: `Articles regarding ${cat} by Vienna Day Trip concierge.`,
    });
  }
});

for (const catDoc of categoryMap.values()) {
  sanityDocuments.push(catDoc);
}
console.log(`✅ Formatted ${categoryMap.size} Blog Categories`);

// 2. Process all 129 Blog Posts
blogs.forEach((b, idx) => {
  const slug = b.slug || `article-${idx + 1}`;
  const catObj = categoryMap.get(b.category || 'Luxury Travel');
  const catRef = catObj ? { _type: 'reference', _ref: catObj._id } : undefined;

  const doc = {
    _id: `blogPost-${slug}`,
    _type: 'blogPost',
    title: b.title,
    slug: { _type: 'slug', current: slug },
    excerpt: b.excerpt || '',
    category: catRef,
    categoryName: b.category || 'Our Blog',
    author: b.author || 'Vienna Day Trip Editorial Team',
    publishedAt: b.rawDate || b.createdAt || new Date().toISOString(),
    readTime: b.readTime || '5 min read',
    isPublished: b.isPublished !== false,
    content: b.content || '',
    coverImage: {
      _type: 'image',
      alt: b.title,
      imageUrl: b.featuredImage || '',
    },
    seo: {
      metaTitle: b.seo?.title || b.title,
      metaDescription: b.seo?.description || b.excerpt || '',
      keywords: b.categories || ['Vienna Day Trip', 'Luxury Chauffeur'],
    },
  };
  sanityDocuments.push(doc);
});
console.log(`✅ Formatted ${blogs.length} Blog Posts`);

// 3. Process Luxury Fleet
const vehicles = store.vehicles || [];
vehicles.forEach((v) => {
  const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  sanityDocuments.push({
    _id: `luxuryFleet-${slug}`,
    _type: 'luxuryFleet',
    name: v.name,
    model: v.model || '',
    category: v.category || 'First Class',
    tagline: v.tagline || 'Experience the pinnacle of European chauffeured travel.',
    capacityPassengers: v.passengers || 3,
    capacityLuggage: v.luggage || 2,
    features: v.features || ['Wi-Fi', 'Bottled Austrian Spring Water', 'Climate Control'],
    hourlyRate: v.hourlyRate || 120,
    dayRate: v.dayRate || 850,
    isAvailable: v.isAvailable !== false,
    sortOrder: v.sortOrder || 1,
    image: {
      _type: 'image',
      alt: v.name,
      imageUrl: v.image || '',
    },
  });
});
console.log(`✅ Formatted ${vehicles.length} Luxury Fleet Vehicles`);

// 4. Process Chauffeur Services
const services = store.services || [];
services.forEach((s) => {
  sanityDocuments.push({
    _id: `chauffeurService-${s.slug}`,
    _type: 'chauffeurService',
    title: s.title,
    slug: { _type: 'slug', current: s.slug },
    subtitle: s.subtitle || '',
    shortDescription: s.shortDescription || s.description || '',
    fullDescription: s.description || '',
    icon: s.icon || 'Plane',
    startingPrice: s.startingPrice || 85,
    priceUnit: s.priceUnit || 'per transfer',
    highlights: s.highlights || [],
    sortOrder: s.sortOrder || 1,
    isActive: s.isActive !== false,
    heroImage: {
      _type: 'image',
      alt: s.title,
      imageUrl: s.heroImage || '',
    },
  });
});
console.log(`✅ Formatted ${services.length} Chauffeur Services`);

// 5. Process Day Trips
const dayTrips = store.dayTrips || [];
dayTrips.forEach((t) => {
  sanityDocuments.push({
    _id: `dayTrip-${t.slug}`,
    _type: 'dayTrip',
    title: t.title,
    slug: { _type: 'slug', current: t.slug },
    destination: t.destination || t.title,
    duration: t.duration || '8 - 10 Hours',
    distance: t.distance || '',
    price: t.price || 690,
    shortDescription: t.shortDescription || '',
    itinerary: (t.itinerary || []).map((item) => ({
      _key: Math.random().toString(36).substring(2, 9),
      time: item.time || '',
      title: item.title || '',
      description: item.description || '',
    })),
    included: t.included || ['Private Chauffeur', 'Luxury Vehicle', 'Hotel Pickup & Dropoff'],
    sortOrder: t.sortOrder || 1,
    isActive: t.isActive !== false,
    heroImage: {
      _type: 'image',
      alt: t.title,
      imageUrl: t.heroImage || '',
    },
  });
});
console.log(`✅ Formatted ${dayTrips.length} Day Trip Destinations`);

// 6. Homepage Content
sanityDocuments.push({
  _id: 'homepageContent-singleton',
  _type: 'homepageContent',
  heroBadge: 'AUSTRIA’S PREMIER PRIVATE CHAUFFEUR',
  heroTitle: 'Bespoke Chauffeur Excellence Across Austria & Central Europe',
  heroSubtitle: 'First-class Mercedes-Benz fleet, English-speaking certified chauffeurs, and effortless door-to-door luxury travel.',
  excellenceMetrics: [
    { _key: 'm1', value: '5.0★', label: 'Google Rating' },
    { _key: 'm2', value: '100%', label: 'Discretion & Privacy' },
    { _key: 'm3', value: '15k+', label: 'VIP Transfers Completed' },
  ],
  aboutSectionTitle: 'The Vienna Day Trip Standard',
  aboutSectionDescription: 'We deliver uncompromising European chauffeur hospitality with transparent fixed pricing and 24/7 dedicated concierge assistance.',
  vipConciergeWhatsApp: '+436767707378',
  vipConciergePhone: '+43 676 770 7378',
});

// 7. About Us Content
sanityDocuments.push({
  _id: 'aboutContent-singleton',
  _type: 'aboutContent',
  pageTitle: 'Redefining Private Travel in Central Europe',
  heroSubtitle: 'Founded on discretion, punctuality, and Austrian hospitality, Vienna Day Trip delivers an unrivaled chauffeur experience.',
  storyHeadline: 'A Tradition of Imperial Hospitality, Modernized',
  storyBody: 'Vienna Day Trip was created to meet the expectations of discerning international travellers who require flawless punctuality and bespoke private travel.',
  stats: [
    { _key: 's1', value: '100%', label: 'Punctuality Rate', description: 'Real-time flight & traffic tracking' },
    { _key: 's2', value: '24/7', label: 'Concierge Dispatch', description: 'Immediate response via WhatsApp' },
    { _key: 's3', value: '5.0★', label: 'Client Satisfaction', description: 'Verified European luxury standards' },
  ],
});

// 8. SEO Settings
const seoPages = [
  { path: '/', title: 'Vienna Day Trip | Ultra-Luxury Chauffeur & Private Tours', desc: 'Vienna’s premier luxury chauffeur service. First-class Mercedes-Benz fleet, airport transfers, and private day trips across Austria.' },
  { path: '/about-vienna-day-trip', title: 'About Us | Vienna Day Trip Luxury Chauffeur', desc: 'Learn about Vienna Day Trip, the leading Austrian chauffeur service offering executive transport and bespoke European tours.' },
  { path: '/our-services', title: 'Our Luxury Services | Airport, Hourly & Secure Chauffeur', desc: 'Explore bespoke chauffeur services in Vienna including airport transfers, hourly chauffeur, sightseeing tours, and diplomatic transport.' },
  { path: '/luxury-fleet', title: 'Luxury Fleet | Mercedes-Benz S-Class, E-Class & V-Class', desc: 'Immaculately maintained Mercedes-Benz S-Class, E-Class, and V-Class chauffeur vehicles in Vienna, Austria.' },
  { path: '/day-trips', title: 'Private Day Trips From Vienna | Hallstatt, Salzburg & Wachau', desc: 'Exclusive private day trips from Vienna to Hallstatt, Salzburg, Wachau Valley, Budapest, and Prague with dedicated chauffeur.' },
  { path: '/blog', title: 'Luxury Travel Journal & Vienna Guides | Vienna Day Trip', desc: 'Insider travel guides, scenic day trip itineraries, and luxury lifestyle tips for Vienna and Central Europe.' },
];

seoPages.forEach((seo, idx) => {
  const slug = seo.path === '/' ? 'home' : seo.path.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  sanityDocuments.push({
    _id: `seoSettings-${slug}`,
    _type: 'seoSettings',
    pageRoute: seo.path,
    metaTitle: seo.title,
    metaDescription: seo.desc,
    canonicalUrl: `https://viennadaytrip.com${seo.path}`,
    noIndex: false,
  });
});

console.log(`\n📦 Total Sanity Documents Prepared: ${sanityDocuments.length}`);

// Write NDJSON file (compatible with `sanity dataset import`)
const ndjsonContent = sanityDocuments.map((doc) => JSON.stringify(doc)).join('\n');
fs.writeFileSync(ndjsonOutputPath, ndjsonContent, 'utf8');
console.log(`💾 Exported NDJSON file to: ${ndjsonOutputPath}`);

// If token is provided, upload directly via Sanity API
async function uploadToSanity() {
  if (!token) {
    console.log('\n💡 Note: No SANITY_API_TOKEN found in .env.');
    console.log('To push these documents directly to your Sanity Cloud:');
    console.log('  1. Go to https://www.sanity.io/manage/project/' + projectId + '/api');
    console.log('  2. Click "Add API token", name it "Migration Write Token", select "Editor" or "Contributor" permissions.');
    console.log('  3. Paste it in your .env: SANITY_API_TOKEN="your_token_here"');
    console.log('  4. Re-run: npm run sanity:import');
    console.log('\nAlternatively, import using the official Sanity CLI:');
    console.log(`  npx sanity dataset import sanity-import.ndjson ${dataset} --replace\n`);
    return;
  }

  console.log('\n🚀 Starting direct Sanity API upload...');
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  });

  const batchSize = 10;
  let importedCount = 0;

  for (let i = 0; i < sanityDocuments.length; i += batchSize) {
    const batch = sanityDocuments.slice(i, i + batchSize);
    const tx = client.transaction();
    batch.forEach((doc) => {
      tx.createOrReplace(doc);
    });

    try {
      await tx.commit();
      importedCount += batch.length;
      process.stdout.write(`\r⏳ Uploaded ${importedCount}/${sanityDocuments.length} documents...`);
    } catch (err) {
      console.error(`\n❌ Error committing batch starting at index ${i}:`, err.message);
    }
  }

  console.log(`\n🎉 Success! Successfully imported ${importedCount} documents into Sanity dataset "${dataset}"!`);
}

uploadToSanity().catch((err) => {
  console.error('❌ Upload process failed:', err);
});
