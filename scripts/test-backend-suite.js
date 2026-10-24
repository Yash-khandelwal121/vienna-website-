import dotenv from 'dotenv';
dotenv.config();

console.log('====================================================');
console.log('  VIENNA DAY TRIP — VERIFYING ALL BACKEND APIS');
console.log('====================================================');

const baseUrl = 'http://localhost:5000';

async function runTests() {
  let passed = 0;
  let failed = 0;

  // 1. Health
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    if (data.status === 'healthy') {
      console.log('✅ [1/7] Health Endpoint: Healthy');
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (e) {
    console.error('❌ [1/7] Health Endpoint failed:', e.message);
    failed++;
  }

  // 2. Public Blogs
  try {
    const res = await fetch(`${baseUrl}/api/v1/public/blogs?limit=2`);
    const data = await res.json();
    if (data.success && data.blogs.length > 0) {
      console.log(`✅ [2/7] Public Blogs: ${data.total} total articles found.`);
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (e) {
    console.error('❌ [2/7] Public Blogs failed:', e.message);
    failed++;
  }

  // 3. Public Vehicles
  try {
    const res = await fetch(`${baseUrl}/api/v1/public/vehicles`);
    const data = await res.json();
    if (data.success && data.vehicles.length > 0) {
      console.log(`✅ [3/7] Public Vehicles: ${data.vehicles.length} vehicles active in fleet.`);
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (e) {
    console.error('❌ [3/7] Public Vehicles failed:', e.message);
    failed++;
  }

  // 4. Booking Submission
  let bookingRef = null;
  try {
    const res = await fetch(`${baseUrl}/api/v1/public/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Baron von Rothschild',
        email: 'rothschild@vienna-estate.at',
        phone: '+43 664 1234567',
        serviceType: 'Private Day Trip',
        pickupLocation: 'The Ritz-Carlton, Vienna',
        dropoffLocation: 'Hallstatt Lake Promenade',
        pickupDate: '2026-11-20',
        pickupTime: '08:30',
        passengerCount: 2,
        preferredVehicle: 'Mercedes-Benz S-Class',
        specialRequests: 'English-speaking chauffeur requested',
      }),
    });
    const data = await res.json();
    if (data.success && data.booking?.reference) {
      bookingRef = data.booking.reference;
      console.log(`✅ [4/7] Booking API: Submitted successfully! Ref: ${bookingRef}`);
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (e) {
    console.error('❌ [4/7] Booking API failed:', e.message);
    failed++;
  }

  // 5. Contact Enquiry
  let enquiryRef = null;
  try {
    const res = await fetch(`${baseUrl}/api/v1/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lady Eleanor Vance',
        email: 'eleanor.vance@london-heritage.co.uk',
        phone: '+44 20 7946 0912',
        subject: 'Wachau Valley Private Wine Tour',
        message: 'Inquiring for a full-day private tour with sommelier recommendations.',
      }),
    });
    const data = await res.json();
    if (data.success && data.enquiry?.reference) {
      enquiryRef = data.enquiry.reference;
      console.log(`✅ [5/7] Enquiry API: Submitted successfully! Ref: ${enquiryRef}`);
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (e) {
    console.error('❌ [5/7] Enquiry API failed:', e.message);
    failed++;
  }

  // 6. Admin Authentication
  let adminToken = null;
  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@viennadaytrip.com',
        password: process.env.INITIAL_ADMIN_PASSWORD || 'ViennaChauffeur2026!Secure',
      }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      adminToken = data.token;
      console.log(`✅ [6/7] Admin Login: Authenticated as ${data.user.name} (${data.user.role})`);
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (e) {
    console.error('❌ [6/7] Admin Login failed:', e.message);
    failed++;
  }

  // 7. Admin Dashboard Stats
  try {
    const res = await fetch(`${baseUrl}/api/v1/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (data.success && data.stats) {
      console.log(`✅ [7/7] Admin Dashboard Stats:`, data.stats);
      passed++;
    } else throw new Error(JSON.stringify(data));
  } catch (e) {
    console.error('❌ [7/7] Admin Dashboard Stats failed:', e.message);
    failed++;
  }

  console.log(`\n====================================================`);
  console.log(`  Tests Completed: ${passed} passed, ${failed} failed.`);
  console.log(`====================================================\n`);
}

runTests();
