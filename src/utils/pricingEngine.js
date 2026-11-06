/**
 * ============================================================
 * Vienna Day Trip -- Centralized Pricing Engine  v2.0
 * ============================================================
 * Single source of truth for all pricing logic.
 * Used by:
 *   - src/pages/Booking.jsx   (frontend display)
 *   - server/controllers/paymentController.js  (backend / Stripe)
 *
 * VEHICLE IDs:
 *   sedan_business  = Mercedes-Benz E-Class
 *   eqe             = Mercedes-Benz EQE
 *   van_business    = Mercedes-Benz V-Class
 *   sedan_first     = Mercedes-Benz S-Class
 *   eqs             = Mercedes-Benz EQS
 * ============================================================
 */

// 1. VEHICLE CATALOGUE
export const VEHICLES = [
  { id: 'sedan_business', name: 'Mercedes-Benz E-Class', tag: 'Business Class', pax: 3, bags: 2, kmRate: 1.90, hourlyRate: 55, img: '/cars/e-class.webp', _tier: 0 },
  { id: 'eqe',            name: 'Mercedes-Benz EQE',     tag: 'Electric Business', pax: 3, bags: 2, kmRate: 1.90, hourlyRate: 55, img: '/cars/eqe-black.jpg', _tier: 0 },
  { id: 'van_business',   name: 'Mercedes-Benz V-Class', tag: 'Executive Van',  pax: 7, bags: 7, kmRate: 2.03, hourlyRate: 65, img: '/cars/v-class.webp', _tier: 1 },
  { id: 'sedan_first',    name: 'Mercedes-Benz S-Class', tag: 'First Class VIP', pax: 3, bags: 2, kmRate: 2.70, hourlyRate: 85, img: '/cars/s-class-black.jpg', _tier: 2 },
  { id: 'eqs',            name: 'Mercedes-Benz EQS',     tag: 'Electric VIP',   pax: 3, bags: 2, kmRate: 2.70, hourlyRate: 85, img: '/cars/eqs-black.jpg', _tier: 2 },
];

// 2. FIXED FARE TABLES
// Index = vehicle._tier (0=E-Class/EQE, 1=V-Class, 2=S-Class/EQS)
export const AIRPORT_TO_CITY_FARES  = [65, 79, 95];
export const CITY_TO_AIRPORT_FARES  = [60, 74, 90];
export const VIENNA_TO_VIENNA_FARES = [55, 60, 75];

// Austria Airport Distance Zones (VIE <-> Austrian non-Vienna destinations)
export const AIRPORT_DISTANCE_ZONES = [
  { maxKm: 20,       fares: [65,  79,  95]  },
  { maxKm: 35,       fares: [80,  84,  110] },
  { maxKm: 50,       fares: [95,  99,  125] },
  { maxKm: 65,       fares: [125, 160, 199] },
  { maxKm: Infinity, fares: null              },
];

// 3. INTERNATIONAL SURCHARGES
export const INTERNATIONAL_SURCHARGE_COUNTRIES = [
  'slovakia','bratislava','czech republic','czechia','prague','brno','cesky krumlov',
  'germany','munich','switzerland','italy','slovenia','croatia'
];
export const INTERNATIONAL_SURCHARGE_EUR = 15;
export const HUNGARY_KEYWORDS    = ['hungary','budapest','debrecen'];
export const HUNGARY_SURCHARGE_EUR = 80;

// 4. CHILD SEAT & PROMO
export const CHILD_SEAT_RATE = 10;
export const PROMO_CODES = { WELCOME10: 10 };

// 5. VIENNA POSTAL CODES (all 23 districts)
export const VIENNA_POSTAL_CODES = [
  '1010','1020','1030','1040','1050','1060','1070','1080','1090','1100',
  '1110','1120','1130','1140','1150','1160','1170','1180','1190','1200',
  '1210','1220','1230'
];
export const VIENNA_CITY_KEYWORDS = [
  'vienna','wien','innere stadt','stephansplatz','ringstrasse','ringstrasse',
  'schonbrunn','schoenbrunn','prater','naschmarkt','hauptbahnhof','westbahnhof',
  'meidling','floridsdorf','donaustadt','simmering','favoriten','hernals',
  'waehring','doebling','brigittenau','leopoldstadt','wieden','margareten',
  'mariahilf','neubau','josefstadt','alsergrund','hietzing','penzing',
  'ottakring','liesing','landstrasse'
];
export const AIRPORT_KEYWORDS = [
  'airport','flughafen','vie airport','schwechat','vienna international airport',
  'wien flughafen'
];

// 6. LOCATION HELPERS
export function isAirport(location) {
  const s = (location || '').toLowerCase();
  return AIRPORT_KEYWORDS.some(k => s.includes(k));
}
export function isViennaCity(location) {
  const s = (location || '').toLowerCase();
  if (VIENNA_POSTAL_CODES.some(p => s.includes(p))) return true;
  if (VIENNA_CITY_KEYWORDS.some(k => s.includes(k))) return true;
  return false;
}
export function isAustriaOther(location) {
  const s = (location || '').toLowerCase();
  if (isAirport(s)) return false;
  if (isViennaCity(s)) return false;
  const austriaKeywords = [
    'austria','salzburg','graz','linz','innsbruck','klagenfurt','wels',
    'st. pölten','st pölten','krems','wachau','melk','hallstatt',
    'bad ischl','gmunden','steyr','bregenz','villach','leoben'
  ];
  return austriaKeywords.some(k => s.includes(k));
}
export function internationalSurcharge(pickup, dropoff) {
  const combined = ((pickup || '') + ' ' + (dropoff || '')).toLowerCase();
  if (HUNGARY_KEYWORDS.some(k => combined.includes(k))) return HUNGARY_SURCHARGE_EUR;
  if (INTERNATIONAL_SURCHARGE_COUNTRIES.some(k => combined.includes(k))) return INTERNATIONAL_SURCHARGE_EUR;
  return 0;
}

// 7. CORE ONE-WAY PRICE
export function calculateOneWayPrice(pickup, dropoff, distKm, vehicle) {
  const tier   = vehicle._tier   != null ? vehicle._tier   : 0;
  const kmRate = vehicle.kmRate  != null ? vehicle.kmRate  : 1.90;
  const puIsAirport = isAirport(pickup);
  const drIsAirport = isAirport(dropoff);
  const puIsVienna  = isViennaCity(pickup);
  const drIsVienna  = isViennaCity(dropoff);
  const puIsAustria = isAustriaOther(pickup);
  const drIsAustria = isAustriaOther(dropoff);

  if (puIsAirport && drIsVienna) return AIRPORT_TO_CITY_FARES[tier];
  if (puIsVienna  && drIsAirport) return CITY_TO_AIRPORT_FARES[tier];
  if (puIsVienna  && drIsVienna)  return VIENNA_TO_VIENNA_FARES[tier];
  if ((puIsAirport && drIsAustria) || (puIsAustria && drIsAirport)) {
    const km = distKm || 0;
    for (const zone of AIRPORT_DISTANCE_ZONES) {
      if (km <= zone.maxKm) {
        return zone.fares ? zone.fares[tier] : km * kmRate;
      }
    }
    return km * kmRate;
  }
  const km = distKm || 0;
  if (km > 0) return km * kmRate;
  return AIRPORT_TO_CITY_FARES[0];
}

// 8. HOURLY PRICE
export function calculateHourlyPrice(hours, vehicle, extraMinutes) {
  const effectiveHours = Math.max(2, Number(hours) || 2);
  const rate = vehicle.hourlyRate != null ? vehicle.hourlyRate : 55;
  const extraCharge = ((Number(extraMinutes) || 0) / 60) * rate;
  return effectiveHours * rate + extraCharge;
}

// 9. DAY TRIP DATA & PRICE
export const DAY_TRIPS = [
  { name: 'Hallstatt Day Trip',      km: 290, baseFare: 595 },
  { name: 'Salzburg Day Trip',       km: 300, baseFare: 595 },
  { name: 'Wachau Valley Day Trip',  km: 90,  baseFare: 416 },
  { name: 'Bratislava Day Trip',     km: 80,  baseFare: 208 },
  { name: 'Budapest Day Trip',       km: 245, baseFare: 495 },
  { name: 'Prague Day Trip',         km: 330, baseFare: 513 },
  { name: 'Vienna Sightseeing Tour', km: 25,  baseFare: 208 },
];
export function calculateDayTripPrice(tripIndex, vehicle, isReturn, actualKm) {
  const trip = DAY_TRIPS[tripIndex];
  if (!trip) return 0;
  const km = actualKm || trip.km;
  const kmRate = vehicle.kmRate != null ? vehicle.kmRate : 1.90;
  const oneWay = km * kmRate;
  return isReturn ? oneWay * 2 : oneWay;
}

// 10. FULL BOOKING TOTAL
export function calculateBookingTotal(params) {
  const {
    mode, pickup, dropoff, distKm, vehicle,
    tripType = 'oneway', hours = 3, extraMinutes = 0,
    tripIndex = 0, childSeats = 0, promoCode = '',
    returnDistKm = null
  } = params;

  let vehicleSubtotal = 0;
  const breakdownParts = [];

  if (mode === 'hourly') {
    vehicleSubtotal = calculateHourlyPrice(hours, vehicle, extraMinutes);
    breakdownParts.push(Math.max(2,hours)+'h x EUR'+vehicle.hourlyRate+'/hr = EUR'+vehicleSubtotal.toFixed(2));
  } else if (mode === 'daytrip') {
    vehicleSubtotal = calculateDayTripPrice(tripIndex, vehicle, tripType === 'return', distKm || null);
    const trip = DAY_TRIPS[tripIndex];
    const km = distKm || (trip ? trip.km : 0);
    breakdownParts.push(
      tripType === 'return'
        ? 'Day Trip Return: 2x'+km+'km x EUR'+vehicle.kmRate+'/km = EUR'+vehicleSubtotal.toFixed(2)
        : 'Day Trip: '+km+'km x EUR'+vehicle.kmRate+'/km = EUR'+vehicleSubtotal.toFixed(2)
    );
  } else {
    if (tripType === 'return') {
      const outbound = calculateOneWayPrice(pickup, dropoff, distKm, vehicle);
      const inbound  = calculateOneWayPrice(dropoff, pickup, returnDistKm != null ? returnDistKm : distKm, vehicle);
      vehicleSubtotal = outbound + inbound;
      breakdownParts.push('Outbound: EUR'+outbound.toFixed(2)+' + Inbound: EUR'+inbound.toFixed(2));
    } else {
      vehicleSubtotal = calculateOneWayPrice(pickup, dropoff, distKm, vehicle);
      breakdownParts.push('One-way: EUR'+vehicleSubtotal.toFixed(2));
    }
  }

  const intlSurcharge = mode !== 'hourly' ? internationalSurcharge(pickup, dropoff) : 0;
  if (intlSurcharge > 0) breakdownParts.push('International surcharge: +EUR'+intlSurcharge);

  const csCount  = Math.max(0, Number(childSeats) || 0);
  const csCharge = csCount * CHILD_SEAT_RATE;
  if (csCharge > 0) breakdownParts.push('Child seats: '+csCount+'xEUR'+CHILD_SEAT_RATE+' = EUR'+csCharge.toFixed(2));

  const subtotal = vehicleSubtotal + intlSurcharge + csCharge;
  const cleanCode = (promoCode || '').trim().toUpperCase();
  const discountPercent = PROMO_CODES[cleanCode] || 0;
  const discountAmount  = (vehicleSubtotal * discountPercent) / 100;
  const total = Math.max(35, subtotal - discountAmount);

  return {
    vehicleSubtotal:       r2(vehicleSubtotal),
    internationalSurcharge: r2(intlSurcharge),
    childSeatCharge:        r2(csCharge),
    subtotal:               r2(subtotal),
    discountPercent,
    discountAmount:         r2(discountAmount),
    total:                  r2(total),
    breakdown:              breakdownParts.join(' | ')
  };
}

// 11. VEHICLE LOOKUPS
export function getVehicleById(id) {
  return VEHICLES.find(v => v.id === id) || VEHICLES[0];
}
export function getVehicleByName(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('eqe'))    return VEHICLES.find(v => v.id === 'eqe');
  if (n.includes('eqs'))    return VEHICLES.find(v => v.id === 'eqs');
  if (n.includes('s-class') || n.includes('s class')) return VEHICLES.find(v => v.id === 'sedan_first');
  if (n.includes('v-class') || n.includes('v class') || n.includes('sprinter')) return VEHICLES.find(v => v.id === 'van_business');
  if (n.includes('e-class') || n.includes('e class')) return VEHICLES.find(v => v.id === 'sedan_business');
  return VEHICLES[0];
}

function r2(n) { return Math.round((n || 0) * 100) / 100; }
