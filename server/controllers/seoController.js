import { db } from '../config/db.js';

export const DEFAULT_SEO_ROUTES = [
  {
    routePath: '/',
    name: 'Homepage',
    metaTitle: 'Vienna Private Chauffeur, Transfers & Day Trips',
    metaDescription: 'Private chauffeur service in Vienna since 2019; airport transfers, hourly hire and day trips to Hallstatt, Salzburg and Budapest in Mercedes cars.',
    canonicalUrl: 'https://viennadaytrip.com/',
    schemaMarkup: null
  },
  {
    routePath: '/about-vienna-day-trip/',
    name: 'About Us',
    metaTitle: 'About Vienna Day Trip | Licensed Chauffeur Company Since 2019',
    metaDescription: 'Discover Vienna Day Trip, a premier licensed chauffeur company founded in 2019. Built on precision, elegance, and authentic Austrian hospitality.',
    canonicalUrl: 'https://viennadaytrip.com/about-vienna-day-trip/',
    schemaMarkup: null
  },
  {
    routePath: '/our-fleet/',
    name: 'Luxury Fleet',
    metaTitle: 'Mercedes-Benz Luxury Chauffeur Fleet | Vienna Day Trip',
    metaDescription: 'Explore our flagship Mercedes-Benz fleet: S-Class First Class, E-Class Business, V-Class VIP Van, Sprinter Minibus, and certified Armored VR6/VR7.',
    canonicalUrl: 'https://viennadaytrip.com/our-fleet/',
    schemaMarkup: null
  },
  {
    routePath: '/our-services/',
    name: 'Services Overview',
    metaTitle: 'Executive Chauffeur Services | Vienna Day Trip',
    metaDescription: 'Comprehensive luxury private transportation: Airport transfers, hourly chauffeur hire, private day trips, and high-security diplomatic convoys.',
    canonicalUrl: 'https://viennadaytrip.com/our-services/',
    schemaMarkup: null
  },
  {
    routePath: '/blog/',
    name: 'Travel Journal',
    metaTitle: 'The Vienna Travel Journal | Day Trip Guides & Insights',
    metaDescription: 'Discover 129 comprehensive travel guides, itineraries, and expert insights for exploring Vienna, Hallstatt, Salzburg, Budapest, Prague, and Wachau.',
    canonicalUrl: 'https://viennadaytrip.com/blog/',
    schemaMarkup: null
  },
  {
    routePath: '/contact-us-i/',
    name: 'Contact Us',
    metaTitle: 'Contact Vienna Day Trip | 24/7 VIP Chauffeur Concierge',
    metaDescription: 'Contact our 24/7 private chauffeur concierge desk for bespoke travel itineraries, airport transfers, and tailored Central European day trips.',
    canonicalUrl: 'https://viennadaytrip.com/contact-us-i/',
    schemaMarkup: null
  },
  {
    routePath: '/b2b-solution/',
    name: 'B2B Solutions',
    metaTitle: 'B2B & Corporate Chauffeur Solutions Vienna | Vienna Day Trip',
    metaDescription: 'Executive corporate chauffeur services, diplomatic delegations, VIP roadshows, and business event transportation in Vienna.',
    canonicalUrl: 'https://viennadaytrip.com/b2b-solution/',
    schemaMarkup: null
  },
  {
    routePath: '/day-trips/',
    name: 'Day Trips & Tours',
    metaTitle: 'Luxury Private Day Trips & Tours from Vienna | Vienna Day Trip',
    metaDescription: 'Bespoke private day trips from Vienna to Hallstatt, Salzburg, Budapest, Prague, and Wachau Valley in luxury Mercedes-Benz vehicles.',
    canonicalUrl: 'https://viennadaytrip.com/day-trips/',
    schemaMarkup: null
  },
  {
    routePath: '/privacy-policy/',
    name: 'Privacy Policy',
    metaTitle: 'Privacy Policy | Vienna Day Trip',
    metaDescription: 'Privacy policy and data protection terms for Vienna Day Trip chauffeur services in accordance with GDPR regulations.',
    canonicalUrl: 'https://viennadaytrip.com/privacy-policy/',
    schemaMarkup: null
  },
  {
    routePath: '/cancellation-refund-policy/',
    name: 'Cancellation & Refund Policy',
    metaTitle: 'Cancellation & Refund Policy | Vienna Day Trip',
    metaDescription: 'Transparent cancellation and refund terms for private chauffeur bookings and day trips with Vienna Day Trip.',
    canonicalUrl: 'https://viennadaytrip.com/cancellation-refund-policy/',
    schemaMarkup: null
  },
  {
    routePath: '/imprint/',
    name: 'Imprint / Impressum',
    metaTitle: 'Imprint & Legal Notice | Vienna Day Trip',
    metaDescription: 'Legal notice, licensing details, and company information for Vienna Day Trip private chauffeur services.',
    canonicalUrl: 'https://viennadaytrip.com/imprint/',
    schemaMarkup: null
  }
];

/**
 * Clean and validate JSON-LD structured data string.
 * Strips outer <script type="application/ld+json"> wrappers if present.
 */
export function cleanAndValidateJsonLd(input) {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return { valid: true, cleaned: null };
  }
  let cleaned = input.trim();
  const scriptMatch = cleaned.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    cleaned = scriptMatch[1].trim();
  }
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'JSON-LD schema must be a valid JSON object or array.' };
    }
    return { valid: true, cleaned: JSON.stringify(parsed, null, 2), parsed };
  } catch (err) {
    return { valid: false, error: `Invalid JSON syntax: ${err.message}` };
  }
}

/**
 * Normalize path with trailing slash for consistent route matching
 */
function normalizePath(p) {
  if (!p) return '/';
  const trimmed = p.trim();
  if (trimmed === '/') return '/';
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

/**
 * GET /api/v1/admin/seo
 * Retrieve all SEO records, merged with default route definitions
 */
export async function getAdminSeoRecords(req, res) {
  try {
    const dbRecords = await db.seo.findMany();
    const dbMap = new Map();
    (dbRecords || []).forEach((r) => {
      if (r && r.routePath) {
        dbMap.set(normalizePath(r.routePath), r);
      }
    });

    const merged = DEFAULT_SEO_ROUTES.map((def) => {
      const norm = normalizePath(def.routePath);
      const existing = dbMap.get(norm);
      return {
        ...def,
        ...(existing || {}),
        name: def.name,
        routePath: def.routePath,
        schemaMarkup: existing?.schemaMarkup ?? def.schemaMarkup ?? null
      };
    });

    // Also include any custom non-default routes stored in DB
    dbRecords.forEach((r) => {
      const norm = normalizePath(r.routePath);
      if (!DEFAULT_SEO_ROUTES.some((d) => normalizePath(d.routePath) === norm)) {
        merged.push(r);
      }
    });

    res.json({ success: true, count: merged.length, records: merged });
  } catch (error) {
    console.error('[seoController] Error fetching admin SEO records:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch SEO records.' });
  }
}

/**
 * GET /api/v1/public/seo/page?path=/about-vienna-day-trip/
 * Retrieve single page SEO record (with custom JSON-LD schema) for public page rendering
 */
export async function getPublicSeoRecord(req, res) {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const rawPath = req.query.path || req.params.routePath || '/';
    const norm = normalizePath(rawPath);
    const withoutSlash = norm.endsWith('/') && norm !== '/' ? norm.slice(0, -1) : norm;

    // Check DB by normalised path (with slash), rawPath, or without slash
    let record = await db.seo.findUnique({ where: { routePath: norm } });
    if (!record && norm !== rawPath) {
      record = await db.seo.findUnique({ where: { routePath: rawPath } });
    }
    if (!record && withoutSlash !== norm) {
      record = await db.seo.findUnique({ where: { routePath: withoutSlash } });
    }

    if (!record) {
      const fallback = DEFAULT_SEO_ROUTES.find(
        (d) => normalizePath(d.routePath) === norm ||
               d.routePath === rawPath ||
               d.routePath === withoutSlash ||
               normalizePath(d.routePath) === normalizePath(rawPath)
      );
      if (fallback) {
        record = {
          routePath: fallback.routePath,
          metaTitle: fallback.metaTitle,
          metaDescription: fallback.metaDescription,
          canonicalUrl: fallback.canonicalUrl,
          schemaMarkup: fallback.schemaMarkup || null
        };
      }
    }

    // If still no record, check if route matches a published day trip destination
    if (!record) {
      const cleanSlug = norm.replace(/^\/+|\/+$/g, '');
      if (cleanSlug) {
        try {
          const dayTrip = await db.dayTrips.findUnique({ where: { slug: cleanSlug } });
          if (dayTrip && dayTrip.isPublished !== false) {
            record = {
              routePath: norm,
              metaTitle: dayTrip.seoTitle || dayTrip.title || `${dayTrip.name} from Vienna`,
              metaDescription: dayTrip.seoDesc || dayTrip.shortDesc || '',
              canonicalUrl: `https://viennadaytrip.com/${dayTrip.slug}/`,
              schemaMarkup: dayTrip.schemaMarkup || null
            };
          }
        } catch (_dtErr) {}
      }
    }

    // If still no record, check if route matches a published service
    if (!record) {
      const cleanSlug = norm.replace(/^\/+|\/+$/g, '');
      if (cleanSlug) {
        try {
          const service = await db.services.findUnique({ where: { slug: cleanSlug } });
          if (service && service.isPublished !== false) {
            record = {
              routePath: norm,
              metaTitle: service.seoTitle || service.name || 'Executive Chauffeur Service',
              metaDescription: service.seoDesc || service.shortDesc || '',
              canonicalUrl: service.canonicalUrl || `https://viennadaytrip.com/${service.slug}/`,
              schemaMarkup: service.schemaMarkup || null
            };
          }
        } catch (_srvErr) {}
      }
    }

    res.json({ success: true, record: record || null });
  } catch (error) {
    console.error('[seoController] Error fetching public SEO record:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch SEO record.' });
  }
}

/**
 * GET /api/v1/public/seo
 * Retrieve all public SEO records
 */
export async function getPublicAllSeoRecords(req, res) {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const dbRecords = await db.seo.findMany();
    const dbMap = new Map();
    (dbRecords || []).forEach((r) => {
      if (r && r.routePath) dbMap.set(normalizePath(r.routePath), r);
    });

    const merged = DEFAULT_SEO_ROUTES.map((def) => {
      const norm = normalizePath(def.routePath);
      const existing = dbMap.get(norm);
      return {
        routePath: def.routePath,
        metaTitle: existing?.metaTitle || def.metaTitle,
        metaDescription: existing?.metaDescription || def.metaDescription,
        canonicalUrl: existing?.canonicalUrl || def.canonicalUrl,
        schemaMarkup: existing?.schemaMarkup || null
      };
    });

    res.json({ success: true, records: merged });
  } catch (error) {
    console.error('[seoController] Error fetching public all SEO records:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch SEO records.' });
  }
}

/**
 * PUT or POST /api/v1/admin/seo
 * Update or insert SEO record with custom JSON-LD schema validation and preservation
 */
export async function updateSeoRecord(req, res) {
  try {
    const { routePath, metaTitle, metaDescription, canonicalUrl, schemaMarkup } = req.body || {};

    if (!routePath || !routePath.trim()) {
      return res.status(400).json({ success: false, error: 'Route path is required.' });
    }

    const normPath = normalizePath(routePath);
    const existing = await db.seo.findUnique({ where: { routePath: normPath } });

    // Validate JSON-LD if provided
    let finalSchemaMarkup = null;
    if (schemaMarkup !== undefined) {
      if (!schemaMarkup || !schemaMarkup.trim()) {
        // Requirement: "Preserve existing schema when the new field is empty; do not erase it automatically."
        finalSchemaMarkup = existing?.schemaMarkup || null;
      } else {
        const valResult = cleanAndValidateJsonLd(schemaMarkup);
        if (!valResult.valid) {
          return res.status(400).json({
            success: false,
            error: valResult.error
          });
        }
        finalSchemaMarkup = valResult.cleaned;
      }
    } else {
      finalSchemaMarkup = existing?.schemaMarkup || null;
    }

    const defaultMatch = DEFAULT_SEO_ROUTES.find((d) => normalizePath(d.routePath) === normPath);

    const titleToSave = metaTitle !== undefined && metaTitle !== null && metaTitle.trim() !== ''
      ? metaTitle.trim()
      : (existing?.metaTitle || defaultMatch?.metaTitle || '');

    const descToSave = metaDescription !== undefined && metaDescription !== null && metaDescription.trim() !== ''
      ? metaDescription.trim()
      : (existing?.metaDescription || defaultMatch?.metaDescription || '');

    const canonicalToSave = canonicalUrl !== undefined && canonicalUrl !== null && canonicalUrl.trim() !== ''
      ? canonicalUrl.trim()
      : (existing?.canonicalUrl || defaultMatch?.canonicalUrl || `https://viennadaytrip.com${normPath}`);

    const updated = await db.seo.upsert({
      where: { routePath: normPath },
      update: {
        metaTitle: titleToSave,
        metaDescription: descToSave,
        canonicalUrl: canonicalToSave,
        schemaMarkup: finalSchemaMarkup,
        isIndexed: true
      },
      create: {
        routePath: normPath,
        metaTitle: titleToSave,
        metaDescription: descToSave,
        canonicalUrl: canonicalToSave,
        schemaMarkup: finalSchemaMarkup,
        isIndexed: true
      }
    });

    res.json({
      success: true,
      record: updated,
      message: `SEO settings for "${normPath}" saved successfully.`
    });
  } catch (error) {
    console.error('[seoController] Error updating SEO record:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update SEO record.' });
  }
}
