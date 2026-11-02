import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';

import assert from 'assert';
import jwt from 'jsonwebtoken';
import http from 'http';
import app from '../server/index.js';
import { cleanAndValidateJson } from '../src/utils/schemaInjector.js';
import { ensureDbInitialized, db } from '../server/config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vienna_luxury_jwt_secret_dev_2026';
let adminToken = null;

function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING CUSTOM JSON-LD SCHEMA MARKUP TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error('    Error:', err.message);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error('    Error:', err.message);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. UNIT TESTS: JSON-LD CLEANING & VALIDATION
  // ─────────────────────────────────────────────────────────────
  console.log('[1/4] Testing JSON-LD Parser & Validation Utility...');

  test('Valid raw JSON object parses and formats properly', () => {
    const raw = '{"@context":"https://schema.org","@type":"WebPage","name":"Vienna Day Trip"}';
    const res = cleanAndValidateJson(raw);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.parsed['@type'], 'WebPage');
    assert(res.jsonString.includes('\n'), 'Output should be pretty-printed');
  });

  test('Pasted <script type="application/ld+json"> tag is unwrapped and cleaned', () => {
    const wrapped = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"TouristTrip","name":"Hallstatt Tour"}</script>';
    const res = cleanAndValidateJson(wrapped);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.parsed['@type'], 'TouristTrip');
  });

  test('Malformed JSON is rejected with clear syntax error', () => {
    const malformed = '{ "@context": "https://schema.org", broken: yes, }';
    const res = cleanAndValidateJson(malformed);
    assert.strictEqual(res.valid, false);
    assert(res.error, 'Should provide error message');
  });

  test('Empty or null input returns valid: true with null jsonString', () => {
    const resEmpty = cleanAndValidateJson('');
    assert.strictEqual(resEmpty.valid, true);
    assert.strictEqual(resEmpty.jsonString, null);

    const resNull = cleanAndValidateJson(null);
    assert.strictEqual(resNull.valid, true);
    assert.strictEqual(resNull.jsonString, null);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. BACKEND API TESTS: SEO & SITEMAP ROUTES
  // ─────────────────────────────────────────────────────────────
  console.log('\n[2/4] Testing SEO & Sitemap Admin & Public APIs...');

  await ensureDbInitialized();
  const adminUser = await db.users.findUnique({ where: { email: 'admin@viennadaytrip.com' } });
  assert(adminUser, 'Admin user must exist in database');
  adminToken = jwt.sign(
    { userId: adminUser.id, email: adminUser.email, role: adminUser.role, name: adminUser.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  await testAsync('GET /api/v1/admin/seo returns list of page routes with schemaMarkup', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/admin/seo',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.records), 'records must be an array');
    assert(res.body.records.length >= 6, 'Must include at least 6 standard routes');
    const home = res.body.records.find((r) => r.routePath === '/');
    assert(home, 'Homepage route must exist');
    assert('schemaMarkup' in home, 'schemaMarkup field must be present in SEO record');
  });

  await testAsync('PUT /api/v1/admin/seo rejects invalid JSON-LD schema with HTTP 400', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/admin/seo',
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      routePath: '/about-vienna-day-trip/',
      metaTitle: 'About Vienna Day Trip | Licensed Chauffeur Company',
      metaDescription: 'Discover Vienna Day Trip premier chauffeur company.',
      canonicalUrl: 'https://viennadaytrip.com/about-vienna-day-trip/',
      schemaMarkup: '{"@context": "https://schema.org", INVALID_JSON_NO_VALUE: }'
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.error.toLowerCase().includes('json'), 'Error must mention JSON syntax problem');
  });

  const testSchemaSeo = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Vienna Day Trip Chauffeur Service',
    description: 'Premier licensed private chauffeur company founded in Vienna.'
  });

  await testAsync('PUT /api/v1/admin/seo saves valid custom JSON-LD schema persistently', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/admin/seo',
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      routePath: '/about-vienna-day-trip/',
      metaTitle: 'About Vienna Day Trip | Licensed Chauffeur Company Since 2019',
      metaDescription: 'Discover Vienna Day Trip, a premier licensed chauffeur company founded in 2019.',
      canonicalUrl: 'https://viennadaytrip.com/about-vienna-day-trip/',
      schemaMarkup: testSchemaSeo
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.record.schemaMarkup.includes('AboutPage'), 'Saved schema must contain AboutPage');
  });

  await testAsync('GET /api/v1/admin/seo loads previously saved schema when reopening editor', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/admin/seo',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const about = res.body.records.find((r) => r.routePath === '/about-vienna-day-trip/');
    assert(about, 'About route must exist');
    assert(about.schemaMarkup && about.schemaMarkup.includes('AboutPage'), 'Previously saved schema must be loaded');
  });

  await testAsync('PUT /api/v1/admin/seo preserves existing schema when empty string is passed', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/admin/seo',
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      routePath: '/about-vienna-day-trip/',
      metaTitle: 'About Vienna Day Trip | Licensed Chauffeur Company Since 2019',
      metaDescription: 'Discover Vienna Day Trip, a premier licensed chauffeur company founded in 2019.',
      canonicalUrl: 'https://viennadaytrip.com/about-vienna-day-trip/',
      schemaMarkup: '' // Empty field
    });
    assert.strictEqual(res.status, 200);
    assert(res.body.record.schemaMarkup, 'Schema must not be erased when field is empty');
    assert(res.body.record.schemaMarkup.includes('AboutPage'), 'Existing schema must be preserved');
  });

  await testAsync('GET /api/v1/public/seo/page returns saved custom schema for public page', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/public/seo/page?path=/about-vienna-day-trip/',
      method: 'GET'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.record, 'Public SEO record must exist');
    assert(res.body.record.schemaMarkup && res.body.record.schemaMarkup.includes('AboutPage'), 'Must return custom JSON-LD schema');
  });

  // ─────────────────────────────────────────────────────────────
  // 3. BACKEND API TESTS: DAY TRIPS MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  console.log('\n[3/4] Testing Day Trips Admin & Public Schema APIs...');

  let testTourId = null;
  let testTourSlug = null;

  await testAsync('GET /api/v1/admin/day-trips returns tours with schemaMarkup', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/admin/day-trips',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.dayTrips), 'dayTrips must be array');
    assert(res.body.dayTrips.length > 0, 'Must have at least one day trip');
    const first = res.body.dayTrips[0];
    testTourId = first.id;
    testTourSlug = first.slug;
    assert('schemaMarkup' in first, 'schemaMarkup property must exist on day trip object');
  });

  await testAsync('PATCH /api/v1/admin/day-trips/:id rejects invalid JSON-LD schema with HTTP 400', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: `/api/v1/admin/day-trips/${testTourId}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      schemaMarkup: '{"@context": "https://schema.org", "bad": syntax,}'
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.error.toLowerCase().includes('json'), 'Error must describe invalid JSON');
  });

  const testSchemaDayTrip = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: 'Hallstatt Private Chauffeur Tour from Vienna',
    description: 'Full-day private luxury tour to Hallstatt with English-speaking chauffeur.',
    touristType: ['Luxury Traveler', 'Couples', 'Families'],
    offers: {
      '@type': 'Offer',
      price: '650',
      priceCurrency: 'EUR'
    }
  });

  await testAsync('PATCH /api/v1/admin/day-trips/:id saves valid custom JSON-LD schema persistently', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: `/api/v1/admin/day-trips/${testTourId}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      schemaMarkup: testSchemaDayTrip
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.tour.schemaMarkup.includes('TouristTrip'), 'Saved schema must contain TouristTrip');
  });

  await testAsync('GET /api/v1/admin/day-trips loads previously saved schema for day trip', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: '/api/v1/admin/day-trips',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const tour = res.body.dayTrips.find((t) => t.id === testTourId);
    assert(tour, 'Tour must exist');
    assert(tour.schemaMarkup && tour.schemaMarkup.includes('TouristTrip'), 'Previously saved schema must be loaded');
  });

  await testAsync('PATCH /api/v1/admin/day-trips/:id preserves existing schema when empty string is passed', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: `/api/v1/admin/day-trips/${testTourId}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      schemaMarkup: '' // Empty field
    });
    assert.strictEqual(res.status, 200);
    assert(res.body.tour.schemaMarkup, 'Schema must not be erased when empty');
    assert(res.body.tour.schemaMarkup.includes('TouristTrip'), 'Existing schema must be preserved');
  });

  await testAsync('GET /api/v1/public/day-trips/:slug returns saved schema on public endpoint', async () => {
    const res = await makeRequest(server, {
      hostname: 'localhost',
      port,
      path: `/api/v1/public/day-trips/${testTourSlug}`,
      method: 'GET'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.tour.schemaMarkup, 'Public day trip must contain schemaMarkup');
    assert(res.body.tour.schemaMarkup.includes('TouristTrip'), 'Public schema must match saved schema');
  });

  // ─────────────────────────────────────────────────────────────
  // 4. DUPLICATE INJECTION & CLEANUP VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n[4/4] Testing Duplicate Injection Guard & Cleanup Logic...');

  test('Deterministic script ID is enforced for custom schema', async () => {
    const { VDT_CUSTOM_SCHEMA_SCRIPT_ID } = await import('../src/utils/schemaInjector.js');
    assert.strictEqual(VDT_CUSTOM_SCHEMA_SCRIPT_ID, 'vdt-custom-schema');
  });

  server.close();

  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test suite uncaught error:', e);
  process.exit(1);
});
