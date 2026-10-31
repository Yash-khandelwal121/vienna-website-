import { fleetData } from '../data/fleet';
import { allBlogPosts } from '../data/blogs';
import { toursData } from '../data/tours';
import { servicesData } from '../data/pages';
import {
  fetchSanityBlogs,
  fetchSanityBlogBySlug,
  fetchSanityFleet,
  fetchSanityServices,
  fetchSanityDayTrips,
  fetchSanityHomepage,
  fetchSanityAbout,
  fetchSanitySEO,
} from './sanityApi';

export {
  fetchSanityBlogs,
  fetchSanityBlogBySlug,
  fetchSanityFleet,
  fetchSanityServices,
  fetchSanityDayTrips,
  fetchSanityHomepage,
  fetchSanityAbout,
  fetchSanitySEO,
};

export const CANONICAL_DAY_TRIP_IMAGES = {
  'hallstatt-day-trip-from-vienna': '/images/Hallstatt.jpg',
  'salzburg-day-trip': '/images/salzburg.jpg',
  'wachau-valley-trip': '/images/wachauvalley.jpg',
  'budapest-day-trip': '/images/budapest.jpg',
  'prague-day-trip': '/images/parague.jpg',
  'bratislava-day-trip': '/images/bratislava.jpg',
  'vienna-sightseeing-tour': 'https://viennadaytrip.com/wp-content/uploads/2026/03/vienna-day-teip.jpeg',
  'customized-day-trips': '/images/customized.jpg',
  'airport-transfer-vienna': 'https://viennadaytrip.com/wp-content/uploads/2026/03/Vienna-Airport-Schwechat-Terminal-Gate-Check-in-Guide-1024x576-1.webp',
  'hourly-chauffeur-service': 'https://viennadaytrip.com/wp-content/uploads/2026/03/your-professional-chauffeur.jpg',
  'secure-transportation': 'https://viennadaytrip.com/wp-content/uploads/2026/05/Armored-Vehicle-.jpeg',
};

export const CANONICAL_FLEET_IMAGES = {
  'e-class': '/cars/e-class.png',
  's-class': '/cars/s-class.png',
  'v-class': '/cars/v-class.png',
  'sprinter': '/cars/sprinter.png',
  'armored': '/cars/armored.png',
  'sedan_business': '/cars/e-class.png',
  'sedan_first': '/cars/s-class.png',
  'van_business': '/cars/v-class.png',
  'mercedes-benz-e-class': '/cars/e-class.png',
  'mercedes-benz-s-class': '/cars/s-class.png',
  'mercedes-benz-v-class': '/cars/v-class.png',
  'mercedes-benz-sprinter': '/cars/sprinter.png',
  'mercedes-benz-sprinter-vip': '/cars/sprinter.png',
  'armored-luxury-vehicle': '/cars/armored.png'
};

export const CANONICAL_SERVICE_IMAGES = {
  // Local bundled assets — Git-tracked, served via Vercel CDN, no external dependency
  'airport-transfers':       '/images/airport-transfer.webp',
  'airport-transfer-vienna': '/images/airport-transfer.webp',
  'hourly-chauffeur':        '/images/hourly-chauffeur.webp',
  'hourly-chauffeur-service':'/images/hourly-chauffeur.webp',
  'private-day-trips':       '/images/private-day-trips.webp',
  'day-trips':               '/images/private-day-trips.webp',
  'secure-transportation':   '/images/secure-transportation.webp',
};

export function sanitizeImageUrl(url, fallbackUrl = '') {
  if (!url || typeof url !== 'string') return fallbackUrl;
  const trimmed = url.trim();
  if (!trimmed) return fallbackUrl;
  if (trimmed.includes('drive.google.com')) return fallbackUrl;
  if (trimmed.includes('photo-1506744038136-46273834b3fb')) return fallbackUrl;
  if (trimmed === '[object Object]') return fallbackUrl;
  return trimmed;
}

// Global in-memory request deduplication and caching to prevent redundant requests and re-render loops
const requestCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL_MS = 30000; // 30 seconds

function dedupeRequest(key, fetcher) {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  const promise = fetcher()
    .then((result) => {
      requestCache.set(key, { data: result, time: Date.now() });
      inFlightRequests.delete(key);
      return result;
    })
    .catch((err) => {
      inFlightRequests.delete(key);
      throw err;
    });
  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Fetch published fleet vehicles with model-specific image mapping and deduplication
 */
export async function fetchPublicVehicles() {
  return dedupeRequest('public_vehicles', async () => {
    // 1. Try Node.js Backend API (PostgreSQL / store.json)
    try {
      const res = await fetch('/api/v1/public/vehicles');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.vehicles) && data.vehicles.length > 0) {
          return data.vehicles.map((v) => {
            const key = (v.model || v.name || v.id || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
            const fallback = CANONICAL_FLEET_IMAGES[key] || CANONICAL_FLEET_IMAGES[v.id] || '/cars/s-class.png';
            return {
              ...v,
              image: sanitizeImageUrl(v.image, fallback)
            };
          });
        }
      }
    } catch {}

    // 2. Bundled static dataset fallback
    return fleetData;
  });
}

/**
 * Fetch published services with stable IDs and deduplication
 */
export async function fetchPublicServices() {
  return dedupeRequest('public_services', async () => {
    // 1. Try Node.js Backend API (PostgreSQL / store.json)
    try {
      const res = await fetch('/api/v1/public/services');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          return data.services.map((s) => {
            // Prefer the canonical image (stable, bundled/external) over a DB-stored
            // /uploads/ path, which is ephemeral on Vercel serverless and may 404.
            const canonical = CANONICAL_SERVICE_IMAGES[s.slug];
            const fallback = canonical || '/images/vienna-palace-backdrop.webp';
            return {
              ...s,
              image: canonical || sanitizeImageUrl(s.image, fallback)
            };
          });
        }
      }
    } catch {}

    // 2. Bundled static dataset fallback
    return (servicesData.pillars || []).map((p, idx) => ({
      id: `srv_${p.id}`,
      slug: p.link?.replace(/^\/|\/$/g, '') || p.id,
      name: p.title,
      shortDesc: p.desc,
      fullDesc: p.desc,
      features: p.bullets || [],
      image: sanitizeImageUrl(p.image, CANONICAL_SERVICE_IMAGES[p.id] || '/images/vienna-palace-backdrop.webp'),
      ctaLabel: 'LEARN MORE & BOOK',
      ctaUrl: p.link,
      displayOrder: idx + 1,
      isPublished: true,
    }));
  });
}

/**
 * Fetch published day trips with canonical image mapping, robust deduplication, and zero cross-card pollution
 */
export async function fetchPublicDayTrips() {
  return dedupeRequest('public_day_trips', async () => {
    let backendTrips = [];
    try {
      const res = await fetch('/api/v1/public/day-trips');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.dayTrips)) {
          backendTrips = data.dayTrips;
        }
      }
    } catch {}

    const map = new Map();

    // 1. Seed with Bundled static tours (Guaranteed pristine canonical baseline)
    Object.values(toursData).forEach((t) => {
      if (t.slug && !t.slug.includes('airport') && !t.slug.includes('hourly') && !t.slug.includes('secure')) {
        const canonicalImg = CANONICAL_DAY_TRIP_IMAGES[t.slug] || t.heroImage;
        map.set(t.slug, {
          id: `tour_${t.slug}`,
          slug: t.slug,
          name: t.title?.replace(' from Vienna', '').replace(' Day Trip', '') || t.title,
          title: t.title,
          eyebrow: t.eyebrow || 'PRIVATE LUXURY CHAUFFEUR',
          shortDesc: t.overview?.[0] || '',
          fullDesc: t.overview?.join('\n\n') || '',
          duration: t.stats?.find((s) => s.label === 'Duration')?.value || '10-12h',
          image: canonicalImg,
          price: 'From €550',
          highlights: t.highlights || [],
          inclusions: t.included || [],
          exclusions: t.notIncluded || [],
          itinerary: t.itinerary || [],
          isPublished: true,
          displayOrder: 1
        });
      }
    });

    // 2. Merge Backend / Neon PostgreSQL day trips (Preserving valid admin uploads while replacing broken/generic placeholders)
    backendTrips.forEach((bt) => {
      if (bt.slug) {
        const prev = map.get(bt.slug) || {};
        const canonical = CANONICAL_DAY_TRIP_IMAGES[bt.slug];
        const fallback = canonical || prev.image || '/images/vienna-palace-backdrop.webp';
        const resolvedImg = canonical || sanitizeImageUrl(bt.image, fallback);
        map.set(bt.slug, {
          ...prev,
          ...bt,
          title: bt.title || prev.title,
          image: resolvedImg
        });
      }
    });

    return Array.from(map.values()).filter((t) => t.isPublished !== false);
  });
}

/**
 * Fetch single day trip by slug (Backend API -> Bundled dataset)
 */
export async function fetchPublicDayTripBySlug(slug) {
  const clean = (slug || '').trim().replace(/\/+$/, '');
  if (!clean) return null;

  try {
    const res = await fetch(`/api/v1/public/day-trips/${clean}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.tour) {
        const tour = data.tour;
        if (CANONICAL_DAY_TRIP_IMAGES[clean]) {
          tour.image = CANONICAL_DAY_TRIP_IMAGES[clean];
        }
        return tour;
      }
    }
  } catch (err) {}

  return toursData[clean] || null;
}

/**
 * Fetch published blog articles with pagination, category filter & search
 * Backed authoritatively by Node.js Backend API (PostgreSQL / local store)
 */
/**
 * Stable in-memory cache for all published blog posts.
 * Fetched once per session (or after CACHE_TTL_MS), then filtered/paginated in memory.
 * Using a single stable cache key avoids race conditions where parallel
 * category/search requests return different intermediate states.
 */
const ALL_BLOGS_CACHE_KEY = 'all_blogs_v1';

export async function fetchPublicBlogs({ page = 1, limit = 9, category = 'All', search = '' } = {}) {
  // Always fetch the full unfiltered list under a single stable key.
  // Filtering and pagination are applied in-memory so the cache is shared across
  // all category/search combinations — eliminating image flicker between navigations.
  return dedupeRequest(ALL_BLOGS_CACHE_KEY, async () => {
    let backendBlogs = [];

    // 1. Fetch ALL published blogs from Node.js Backend API (Neon PostgreSQL / store.json)
    //    Use a large limit so we get everything in one round-trip.
    try {
      const res = await fetch('/api/v1/public/blogs?limit=1000');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
          backendBlogs = data.blogs;
        }
      }
    } catch (err) {}

    // 2. If backend is unreachable, fall back to the bundled static dataset.
    //    We never merge both sources together — this prevents duplicate entries
    //    and ensures the authoritative Neon image field is never overridden by
    //    stale local data.
    let combined = backendBlogs.length > 0
      ? backendBlogs.filter((b) => b.isPublished !== false)
      : allBlogPosts.filter((b) => b.isPublished !== false);

    combined.sort((a, b) => new Date(b.rawDate || b.publishedAt || b.createdAt || 0) - new Date(a.rawDate || a.publishedAt || a.createdAt || 0));

    return combined;
  }).then((combined) => {
    // Apply category and search filters in memory after the cached fetch.
    let filtered = combined;

    if (category && category !== 'All') {
      filtered = filtered.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((b) =>
        b.title?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.content?.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      blogs: paginated,
    };
  });
}

/**
 * Fetch single blog article by slug with deduplication
 */
export async function fetchPublicBlogBySlug(slug) {
  const clean = (slug || '').trim().replace(/\/+$/, '');
  if (!clean) return { blog: null, source: 'none' };

  return dedupeRequest(`blog_${clean}`, async () => {
    // 1. Try Node.js Backend API first (PostgreSQL / store.json)
    try {
      const res = await fetch(`/api/v1/public/blogs/${clean}`);
      if (res.ok) {
        const data = await res.json();
        const blogData = data.blog || data.post;
        if (data.success && blogData) {
          return { blog: blogData, related: data.related || [], source: 'backend' };
        }
      }
    } catch (err) {}

    // 2. Fallback to local dataset
    const blog = allBlogPosts.find((b) => b.slug === clean);
    const related = allBlogPosts.filter((b) => b.slug !== clean && b.category === blog?.category).slice(0, 3);
    return { blog: blog || null, related, source: 'local' };
  });
}

/**
 * Submit booking enquiry to PostgreSQL and return generated reference
 */
export async function submitBookingEnquiry(formData) {
  try {
    const res = await fetch('/api/v1/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: 'Backend currently offline. You can proceed directly through WhatsApp.',
    };
  }
}

/**
 * Submit contact message enquiry to PostgreSQL and return reference
 */
export async function submitContactEnquiry(contactData) {
  try {
    const res = await fetch('/api/v1/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: 'Backend currently offline. You can proceed directly through WhatsApp.',
    };
  }
}

/**
 * Initiate server-side Stripe Checkout Session
 */
export async function createStripeCheckoutSession({ bookingId, discountCode, childSeatCount }) {
  try {
    const res = await fetch('/api/v1/public/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, discountCode, childSeatCount }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: 'Failed to connect to Stripe payment service. Please try again.',
    };
  }
}

/**
 * Fetch verified database payment status for a booking
 */
export async function fetchBookingPaymentStatus(bookingId) {
  try {
    const res = await fetch(`/api/v1/public/payments/status/${bookingId}`);
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: 'Could not retrieve payment status.' };
  }
}

/**
 * Simulate payment confirmation in local test mode
 */
export async function simulatePaymentSuccess({ bookingId, sessionId }) {
  try {
    const res = await fetch('/api/v1/public/payments/simulate-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, sessionId }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: 'Failed to simulate payment.' };
  }
}

