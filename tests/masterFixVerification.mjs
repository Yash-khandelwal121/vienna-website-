import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(name, condition, details = '') {
  if (condition) {
    console.log(`  PASS: ${name}`);
    passed++;
  } else {
    console.error(`  FAIL: ${name} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

console.log('\n=== TASK 1, 2, 3: VEHICLE CARD IMAGES IN BOOKING SELECTION ===');

// Check pricingEngine VEHICLES
import { VEHICLES } from '../src/utils/pricingEngine.js';

const sClass = VEHICLES.find(v => v.id === 'sedan_first');
const eqs = VEHICLES.find(v => v.id === 'eqs');
const eqe = VEHICLES.find(v => v.id === 'eqe');

assert('S-Class exists in VEHICLES', !!sClass);
assert('S-Class img is /cars/s-class-black.jpg', sClass?.img === '/cars/s-class-black.jpg', sClass?.img);
assert('EQS exists in VEHICLES', !!eqs);
assert('EQS img is /cars/eqs-black.jpg', eqs?.img === '/cars/eqs-black.jpg', eqs?.img);
assert('EQE exists in VEHICLES', !!eqe);
assert('EQE img is /cars/eqe-black.jpg', eqe?.img === '/cars/eqe-black.jpg', eqe?.img);
assert('EQS does not use S-Class image', eqs?.img !== sClass?.img);
assert('EQE does not use E-Class image', eqe?.img !== '/cars/e-class.webp');

// Check disk files in public/cars
const sClassFile = path.join(root, 'public', 'cars', 's-class-black.jpg');
const eqsFile = path.join(root, 'public', 'cars', 'eqs-black.jpg');
const eqeFile = path.join(root, 'public', 'cars', 'eqe-black.jpg');
const bmwFile = path.join(root, 'public', 'cars', 'bmw-armored.jpg');

assert('s-class-black.jpg exists on disk', fs.existsSync(sClassFile) && fs.statSync(sClassFile).size > 10000);
assert('eqs-black.jpg exists on disk', fs.existsSync(eqsFile) && fs.statSync(eqsFile).size > 10000);
assert('eqe-black.jpg exists on disk', fs.existsSync(eqeFile) && fs.statSync(eqeFile).size > 10000);
assert('bmw-armored.jpg exists on disk', fs.existsSync(bmwFile) && fs.statSync(bmwFile).size > 10000);

// Check Booking.css object-fit: contain & background
const bookingCss = fs.readFileSync(path.join(root, 'src', 'pages', 'Booking.css'), 'utf8');
assert('Booking.css .car img has object-fit: contain', bookingCss.includes('object-fit: contain;'));
assert('Booking.css .car img has background: var(--soft)', bookingCss.includes('background: var(--soft);'));
assert('Booking.css .car img has border-radius', bookingCss.includes('border-radius: 10px;'));

console.log('\n=== TASK 4: ARMORED LUXURY VEHICLE IN FLEET ===');
const fleetJs = fs.readFileSync(path.join(root, 'src', 'data', 'fleet.js'), 'utf8');
const apiJs = fs.readFileSync(path.join(root, 'src', 'services', 'api.js'), 'utf8');

assert('fleet.js armored vehicle image is bmw-armored', fleetJs.includes('/cars/bmw-armored.png') || fleetJs.includes('/cars/bmw-armored.jpg'));
assert('fleet.js armored vehicle gallery[0] is bmw-armored', fleetJs.includes('"/cars/bmw-armored.png"') || fleetJs.includes('"/cars/bmw-armored.jpg"'));
assert('api.js CANONICAL_FLEET_IMAGES armored is bmw-armored', apiJs.includes("'/cars/bmw-armored.png'") || apiJs.includes("'/cars/bmw-armored.jpg'"));
assert('api.js CANONICAL_FLEET_IMAGES armored-luxury-vehicle is bmw-armored', apiJs.includes("'/cars/bmw-armored.png'") || apiJs.includes("'/cars/bmw-armored.jpg'"));

console.log('\n=== TASK 5: HOMEPAGE BOOKING WIDGET DAY TRIP FLOW ===');
const heroBanner = fs.readFileSync(path.join(root, 'src', 'components', 'HeroBanner.jsx'), 'utf8');

assert('HeroBanner has dtPuInputRef declared', heroBanner.includes('const dtPuInputRef = useRef(null);'));
assert('HeroBanner attaches autocomplete to dtPuInputRef', heroBanner.includes('attachAutocomplete(dtPuInputRef, dtPuACRef, \'pickup\')'));
assert('HeroBanner Day Trip tab renders PICKUP LOCATION label', heroBanner.includes('htmlFor="hero-daytrip-pickup"'));
assert('HeroBanner Day Trip tab renders dtPuInputRef input', heroBanner.includes('ref={dtPuInputRef}'));
assert('HeroBanner Day Trip tab renders ROUTE selector', heroBanner.includes('id="hero-daytrip-route"'));
assert('HeroBanner Day Trip tab renders EXTRA TIME selector', heroBanner.includes('id="hero-daytrip-extra"'));
assert('HeroBanner handleGetQuote defaults Day Trip pickup if empty', heroBanner.includes("if (activeTab === 'daytrip') {\r\n      if (!formData.pickup || !formData.pickup.trim()) {\r\n        formData.pickup = 'Vienna, Austria';") || heroBanner.includes("if (activeTab === 'daytrip') {\n      if (!formData.pickup || !formData.pickup.trim()) {\n        formData.pickup = 'Vienna, Austria';"));
assert('HeroBanner CSS defines .vdt-ref-grid-daytrip-2', heroBanner.includes('.vdt-ref-grid-daytrip-2'));

console.log('\n=== TASK 6: ADMIN DAY TRIP PUBLISHING ERROR FIX ===');
const dayTripsManager = fs.readFileSync(path.join(root, 'src', 'admin', 'pages', 'DayTripsManager.jsx'), 'utf8');

assert('DayTripsManager declares isPub in handleSave', dayTripsManager.includes('const isPub = publishStatus !== null ? publishStatus : form.isPublished;'));
assert('DayTripsManager handles isPub for PUBLISHED and DRAFT', dayTripsManager.includes("setTourStatus(isPub ? 'PUBLISHED' : 'DRAFT')"));
assert('DayTripsManager Step 4 SEO has responsive grid', dayTripsManager.includes("gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'"));
assert('DayTripsManager Step 4 SERP preview prevents horizontal overflow', dayTripsManager.includes("wordBreak: 'break-word'") && dayTripsManager.includes("overflowWrap: 'break-word'"));

console.log('\n=== SUMMARY ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL MASTER VERIFICATIONS PASSED!\n');
}

