/**
 * =============================================================
 * Vienna Day Trip — Automated Pricing Tests (A through M)
 * =============================================================
 * Run with:  node tests/pricingTests.mjs
 * =============================================================
 */

import {
  VEHICLES,
  DAY_TRIPS,
  calculateOneWayPrice,
  calculateHourlyPrice,
  calculateDayTripPrice,
  calculateBookingTotal,
  getVehicleById,
  getVehicleByName,
  internationalSurcharge,
  isAirport,
  isViennaCity,
  isAustriaOther
} from '../src/utils/pricingEngine.js';

let passed = 0;
let failed = 0;

function assert(label, actual, expected, tolerance = 0) {
  const ok = tolerance > 0
    ? Math.abs(actual - expected) <= tolerance
    : actual === expected;
  if (ok) {
    console.log(`  PASS  ${label}  (got ${actual})`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}  (expected ${expected}, got ${actual})`);
    failed++;
  }
}

const eClass = getVehicleById('sedan_business');
const eqe    = getVehicleById('eqe');
const vClass = getVehicleById('van_business');
const sClass = getVehicleById('sedan_first');
const eqs    = getVehicleById('eqs');

console.log('\n=== Test A: Vehicle Configuration ===');
assert('E-Class kmRate', eClass.kmRate, 1.90);
assert('EQE kmRate',     eqe.kmRate,    1.90);
assert('V-Class kmRate', vClass.kmRate, 2.03);
assert('S-Class kmRate', sClass.kmRate, 2.70);
assert('EQS kmRate',     eqs.kmRate,    2.70);
assert('E-Class hourlyRate', eClass.hourlyRate, 55);
assert('EQE hourlyRate',     eqe.hourlyRate,    55);
assert('V-Class hourlyRate', vClass.hourlyRate, 65);
assert('S-Class hourlyRate', sClass.hourlyRate, 85);
assert('EQS hourlyRate',     eqs.hourlyRate,    85);
assert('5 vehicles total', VEHICLES.length, 5);

console.log('\n=== Test B: Fixed Airport -> Vienna City Fares ===');
const airportPickup = 'Vienna International Airport (VIE), Schwechat';
const viennaDropoff = 'Hotel Sacher Vienna, Stephansplatz, Vienna 1010';
assert('E-Class Airport->City', calculateOneWayPrice(airportPickup, viennaDropoff, 20, eClass), 65);
assert('EQE Airport->City',     calculateOneWayPrice(airportPickup, viennaDropoff, 20, eqe),    65);
assert('V-Class Airport->City', calculateOneWayPrice(airportPickup, viennaDropoff, 20, vClass), 79);
assert('S-Class Airport->City', calculateOneWayPrice(airportPickup, viennaDropoff, 20, sClass), 95);
assert('EQS Airport->City',     calculateOneWayPrice(airportPickup, viennaDropoff, 20, eqs),    95);

console.log('\n=== Test C: Fixed Vienna City -> Airport Fares ===');
assert('E-Class City->Airport', calculateOneWayPrice(viennaDropoff, airportPickup, 20, eClass), 60);
assert('EQE City->Airport',     calculateOneWayPrice(viennaDropoff, airportPickup, 20, eqe),    60);
assert('V-Class City->Airport', calculateOneWayPrice(viennaDropoff, airportPickup, 20, vClass), 74);
assert('S-Class City->Airport', calculateOneWayPrice(viennaDropoff, airportPickup, 20, sClass), 90);
assert('EQS City->Airport',     calculateOneWayPrice(viennaDropoff, airportPickup, 20, eqs),    90);

console.log('\n=== Test D: Vienna -> Vienna Fixed Fares ===');
const vienna1 = 'Schoenbrunn Palace, Vienna 1130';
const vienna2 = 'Wien Hauptbahnhof, Vienna 1100';
assert('E-Class V->V', calculateOneWayPrice(vienna1, vienna2, 10, eClass), 55);
assert('EQE V->V',     calculateOneWayPrice(vienna1, vienna2, 10, eqe),    55);
assert('V-Class V->V', calculateOneWayPrice(vienna1, vienna2, 10, vClass), 60);
assert('S-Class V->V', calculateOneWayPrice(vienna1, vienna2, 10, sClass), 75);
assert('EQS V->V',     calculateOneWayPrice(vienna1, vienna2, 10, eqs),    75);

console.log('\n=== Test E: Airport Distance Zone Pricing (Austria non-Vienna) ===');
const airportPU = 'Vienna International Airport (VIE), Schwechat';
// Zone A (< 20km) — should use fixed [65, 79, 95]
assert('E-Class Zone A (15km)', calculateOneWayPrice(airportPU, 'Fischamend, Austria', 15, eClass), 65);
assert('V-Class Zone A (15km)', calculateOneWayPrice(airportPU, 'Fischamend, Austria', 15, vClass), 79);
assert('S-Class Zone A (15km)', calculateOneWayPrice(airportPU, 'Fischamend, Austria', 15, sClass), 95);
// Zone B (21-35km) — should use [80, 84, 110]
assert('E-Class Zone B (30km)', calculateOneWayPrice(airportPU, 'Moedling, Austria', 30, eClass), 80);
assert('V-Class Zone B (30km)', calculateOneWayPrice(airportPU, 'Moedling, Austria', 30, vClass), 84);
assert('S-Class Zone B (30km)', calculateOneWayPrice(airportPU, 'Moedling, Austria', 30, sClass), 110);
// Zone C (36-50km)
assert('E-Class Zone C (45km)', calculateOneWayPrice(airportPU, 'Bruck an der Leitha, Austria', 45, eClass), 95);
assert('V-Class Zone C (45km)', calculateOneWayPrice(airportPU, 'Bruck an der Leitha, Austria', 45, vClass), 99);
assert('S-Class Zone C (45km)', calculateOneWayPrice(airportPU, 'Bruck an der Leitha, Austria', 45, sClass), 125);
// Zone D (51-65km)
assert('E-Class Zone D (60km)', calculateOneWayPrice(airportPU, 'Neunkirchen, Austria', 60, eClass), 125);
assert('V-Class Zone D (60km)', calculateOneWayPrice(airportPU, 'Neunkirchen, Austria', 60, vClass), 160);
assert('S-Class Zone D (60km)', calculateOneWayPrice(airportPU, 'Neunkirchen, Austria', 60, sClass), 199);
// Above 65km -> per-km rates
const expect_eClass_80km = 80 * 1.90;
assert('E-Class >65km (80km)', calculateOneWayPrice(airportPU, 'Baden, Austria', 80, eClass), expect_eClass_80km, 0.01);

console.log('\n=== Test F: Return Journey (Independent Legs) ===');
// Airport -> Vienna return = €65 outbound + €60 inbound (NOT 2x €65)
const returnResult = calculateBookingTotal({
  mode: 'transfer',
  pickup: airportPickup,
  dropoff: viennaDropoff,
  distKm: 20,
  vehicle: eClass,
  tripType: 'return',
  childSeats: 0,
  promoCode: ''
});
assert('E-Class Return Airport<->City', returnResult.total, 65 + 60);

// Vienna -> Vienna return = €55 + €55 = €110
const vvReturn = calculateBookingTotal({
  mode: 'transfer',
  pickup: vienna1,
  dropoff: vienna2,
  distKm: 10,
  vehicle: eClass,
  tripType: 'return',
  childSeats: 0,
  promoCode: ''
});
assert('E-Class Return V<->V', vvReturn.total, 55 + 55);

console.log('\n=== Test G: Hourly Chauffeur Override ===');
assert('E-Class 3h hourly', calculateHourlyPrice(3, eClass, 0), 165);
assert('EQE 3h hourly',     calculateHourlyPrice(3, eqe,    0), 165);
assert('V-Class 3h hourly', calculateHourlyPrice(3, vClass, 0), 195);
assert('S-Class 3h hourly', calculateHourlyPrice(3, sClass, 0), 255);
assert('EQS 3h hourly',     calculateHourlyPrice(3, eqs,    0), 255);
// Minimum 2 hours enforced
assert('E-Class min 2h', calculateHourlyPrice(1, eClass, 0), 110);

console.log('\n=== Test H: International Surcharge ===');
assert('Budapest surcharge',   internationalSurcharge('Vienna', 'Budapest, Hungary'), 80);
assert('Prague surcharge',     internationalSurcharge('Vienna', 'Prague, Czech Republic'), 15);
assert('Bratislava surcharge', internationalSurcharge('Vienna', 'Bratislava, Slovakia'), 15);
assert('No surcharge (Austria)', internationalSurcharge('Vienna', 'Salzburg, Austria'), 0);

// Budapest booking total includes surcharge
const budapestResult = calculateBookingTotal({
  mode: 'transfer',
  pickup: 'Vienna City Center, Wien 1010',
  dropoff: 'Budapest, Hungary',
  distKm: 245,
  vehicle: eClass,
  tripType: 'oneway',
  childSeats: 0,
  promoCode: ''
});
assert('Budapest booking includes 80 surcharge',
  budapestResult.internationalSurcharge, 80);
assert('Budapest booking total = 245*1.90 + 80',
  budapestResult.total, Math.round((245 * 1.90 + 80) * 100) / 100, 0.01);

console.log('\n=== Test I: Day Trip Pricing (per-km) ===');
const hallstattTrip = calculateDayTripPrice(0, eClass, false, null);
assert('E-Class Hallstatt oneway', hallstattTrip, 290 * 1.90, 0.01);
const hallstattReturn = calculateDayTripPrice(0, eClass, true, null);
assert('E-Class Hallstatt return', hallstattReturn, 290 * 1.90 * 2, 0.01);
const sClassHallstatt = calculateDayTripPrice(0, sClass, false, null);
assert('S-Class Hallstatt oneway', sClassHallstatt, 290 * 2.70, 0.01);

console.log('\n=== Test J: Child Seat Charges ===');
const csResult = calculateBookingTotal({
  mode: 'transfer',
  pickup: airportPickup,
  dropoff: viennaDropoff,
  distKm: 20,
  vehicle: eClass,
  tripType: 'oneway',
  childSeats: 2,
  promoCode: ''
});
assert('Child seats: 2 x €10 = €20', csResult.childSeatCharge, 20);
assert('Total includes child seats', csResult.total, 65 + 20);

console.log('\n=== Test K: Promo Code (WELCOME10) ===');
const promoResult = calculateBookingTotal({
  mode: 'transfer',
  pickup: airportPickup,
  dropoff: viennaDropoff,
  distKm: 20,
  vehicle: eClass,
  tripType: 'oneway',
  childSeats: 0,
  promoCode: 'WELCOME10'
});
assert('WELCOME10: 10% off vehicle subtotal', promoResult.discountPercent, 10);
// 10% of €65 = €6.50 discount; total = 65 - 6.50 = €58.50
assert('WELCOME10 total', promoResult.total, 58.50);

console.log('\n=== Test L: Vehicle Lookup ===');
assert('getVehicleById eqe',  getVehicleById('eqe').id,  'eqe');
assert('getVehicleById eqs',  getVehicleById('eqs').id,  'eqs');
assert('getVehicleByName EQE (string)', getVehicleByName('Mercedes-Benz EQE').id, 'eqe');
assert('getVehicleByName S-Class', getVehicleByName('Mercedes-Benz S-Class').id, 'sedan_first');
assert('getVehicleByName V-Class', getVehicleByName('Mercedes-Benz V-Class').id, 'van_business');

console.log('\n=== Test M: Location Classification ===');
assert('Airport detection (airport keyword)', isAirport('Vienna International Airport (VIE), Schwechat'), true);
assert('Vienna city detection (1010 postal)', isViennaCity('Hotel Sacher, Philharmoniker Str. 4, 1010 Vienna'), true);
assert('Vienna city detection (wien keyword)', isViennaCity('Stephansplatz, Wien'), true);
assert('Austria other (Salzburg)', isAustriaOther('Salzburg, Austria'), true);
assert('Austria other (Hallstatt)', isAustriaOther('Hallstatt, Austria'), true);

console.log('\n=== RESULTS ===');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
if (failed === 0) {
  console.log('  ALL TESTS PASSED');
} else {
  console.log(`  ${failed} TEST(S) FAILED`);
  process.exit(1);
}
