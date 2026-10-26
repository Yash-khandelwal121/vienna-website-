import http from 'http';
import { createClient } from '@sanity/client';
import app from '../server/index.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('============================================================');
  console.log('🧪 VIENNA DAY TRIP — COMPREHENSIVE CORS & SANITY TEST SUITE');
  console.log('============================================================');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test Express server running at: ${baseUrl}\n`);

  // -------------------------------------------------------------------------
  // SUITE 1: PRODUCTION CORS BEHAVIOR (NODE_ENV = 'production')
  // -------------------------------------------------------------------------
  console.log('--- [SUITE 1] Production Mode CORS Behavior (NODE_ENV=production) ---');
  process.env.NODE_ENV = 'production';

  // 1.1 Allowed Production Origins
  const productionAllowed = [
    'https://vienna-website-seven.vercel.app',
    'https://viennadaytrip.com',
    'https://www.viennadaytrip.com'
  ];

  for (const origin of productionAllowed) {
    // GET request
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Origin: origin }
    });
    const acao = res.headers.get('access-control-allow-origin');
    const acac = res.headers.get('access-control-allow-credentials');
    assert(
      res.status === 200 && acao === origin && acac === 'true',
      `Production origin allowed (GET): ${origin} -> Status ${res.status}, ACAO: ${acao}`
    );

    // OPTIONS preflight request
    const preflight = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    const preflightAcao = preflight.headers.get('access-control-allow-origin');
    assert(
      preflight.status === 204 && preflightAcao === origin,
      `Production origin preflight (OPTIONS): ${origin} -> Status ${preflight.status}, ACAO: ${preflightAcao}`
    );
  }

  // 1.2 Trailing slash normalization
  const trailingSlashRes = await fetch(`${baseUrl}/api/health`, {
    method: 'GET',
    headers: { Origin: 'https://vienna-website-seven.vercel.app/' }
  });
  assert(
    trailingSlashRes.status === 200 &&
      trailingSlashRes.headers.get('access-control-allow-origin') === 'https://vienna-website-seven.vercel.app/',
    `Production origin with trailing slash normalized: Status ${trailingSlashRes.status}`
  );

  // 1.3 Blocked in Production: Localhost & Loopback
  const localhostBlockedInProd = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000'
  ];

  for (const origin of localhostBlockedInProd) {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Origin: origin }
    });
    const acao = res.headers.get('access-control-allow-origin');
    assert(
      acao === null && res.status !== 200,
      `Localhost origin BLOCKED in production: ${origin} -> Status ${res.status}, ACAO: ${acao}`
    );

    const preflight = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET'
      }
    });
    const preflightAcao = preflight.headers.get('access-control-allow-origin');
    assert(
      preflightAcao === null,
      `Localhost preflight BLOCKED in production: ${origin} -> ACAO: ${preflightAcao}`
    );
  }

  // 1.4 Blocked in Production: Unrestricted *.vercel.app & Substring attacks
  const unauthorizedOrigins = [
    'https://malicious-attacker.vercel.app',
    'https://another-site.vercel.app',
    'https://evilviennadaytrip.com',
    'https://viennadaytrip.com.attacker.com',
    'https://notviennadaytrip.com',
    'https://random-unauthorized-domain.com'
  ];

  for (const origin of unauthorizedOrigins) {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Origin: origin }
    });
    const acao = res.headers.get('access-control-allow-origin');
    assert(
      acao === null && res.status !== 200,
      `Unauthorized origin BLOCKED in production: ${origin} -> Status ${res.status}, ACAO: ${acao}`
    );
  }

  // 1.5 Server-to-server / No Origin request allowed
  const noOriginRes = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
  const noOriginData = await noOriginRes.json();
  assert(
    noOriginRes.status === 200 && noOriginData.status === 'healthy',
    `Direct request without Origin header allowed: Status ${noOriginRes.status}`
  );

  // -------------------------------------------------------------------------
  // SUITE 2: DEVELOPMENT CORS BEHAVIOR (NODE_ENV = 'development')
  // -------------------------------------------------------------------------
  console.log('\n--- [SUITE 2] Development Mode CORS Behavior (NODE_ENV=development) ---');
  process.env.NODE_ENV = 'development';

  const devAllowed = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://vienna-website-seven.vercel.app',
    'https://viennadaytrip.com'
  ];

  for (const origin of devAllowed) {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Origin: origin }
    });
    const acao = res.headers.get('access-control-allow-origin');
    assert(
      res.status === 200 && acao === origin,
      `Origin allowed in development: ${origin} -> Status ${res.status}, ACAO: ${acao}`
    );
  }

  // -------------------------------------------------------------------------
  // SUITE 3: API FUNCTIONALITY & BLOGS ENDPOINT
  // -------------------------------------------------------------------------
  console.log('\n--- [SUITE 3] API Functionality Verification ---');
  const blogsRes = await fetch(`${baseUrl}/api/v1/public/blogs?limit=3`);
  const blogsData = await blogsRes.json();
  assert(
    blogsRes.status === 200 && blogsData.success === true && Array.isArray(blogsData.blogs),
    `Blogs API Endpoint functional: Status ${blogsRes.status}, Received ${blogsData.blogs?.length} items (Total: ${blogsData.total})`
  );

  // -------------------------------------------------------------------------
  // SUITE 4: SANITY CMS INTEGRATION FUNCTIONALITY
  // -------------------------------------------------------------------------
  console.log('\n--- [SUITE 4] Sanity CMS Live Integration Verification ---');
  const sanityClient = createClient({
    projectId: 'lwp5b4fm',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  });

  const [blogCount, publishedCount, fleetCount] = await Promise.all([
    sanityClient.fetch('count(*[_type == "blogPost"])'),
    sanityClient.fetch('count(*[_type == "blogPost" && isPublished == true])'),
    sanityClient.fetch('count(*[_type == "luxuryFleet"])'),
  ]);

  assert(
    blogCount === 129 && publishedCount === 129,
    `Sanity CMS live blogs: Total=${blogCount}, Published=${publishedCount} (Expected 129)`
  );
  assert(
    fleetCount >= 5,
    `Sanity CMS fleet vehicles active: Count=${fleetCount}`
  );

  // Close test server
  await new Promise((resolve) => server.close(resolve));

  console.log('\n============================================================');
  console.log(`📊 TEST RESULTS: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  if (failedTests === 0) {
    console.log('🎉 ALL SUITES PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
