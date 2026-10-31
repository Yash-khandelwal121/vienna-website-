import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  submitBookingEnquiry,
  createStripeCheckoutSession,
  fetchBookingPaymentStatus,
  simulatePaymentSuccess
} from '../services/api';
import './Booking.css';

/* =========================================================================
   SETTINGS & CONFIGURATION (matching exact supplied code)
   ========================================================================= */
const ENABLE_GOOGLE_MAPS = String(import.meta.env.VITE_ENABLE_GOOGLE_MAPS || '').toLowerCase() === 'true';

const S = {
  ENABLE_MAPS: ENABLE_GOOGLE_MAPS,
  MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXX',
  CURRENCY: 'EUR',
  WHATSAPP: '436642035445',
  HOURLY: 52,
  STEP: 15,
  BASE: 35,
  PER_KM: 1.45,
  MIN: 55,
  FIX: {
    salzburg: 595,
    hallstatt: 595,
    budapest: 495,
    prague: 513,
    bratislava: 120,
    graz: 338
  },
  TOURS: [
    ['Hallstatt Day Trip', 595],
    ['Salzburg Day Trip', 595],
    ['Wachau Valley Day Trip', 416],
    ['Bratislava Day Trip', 208],
    ['Budapest Day Trip', 495],
    ['Prague Day Trip', 513],
    ['Vienna Sightseeing Tour', 208]
  ],
  CODES: { WELCOME10: 10 },
  CARS: [
    {
      id: 'sedan_business',
      name: 'Mercedes-Benz E-Class',
      tag: 'Business Class',
      pax: 3,
      bags: 2,
      mult: 1,
      img: '/cars/e-class.webp'
    },
    {
      id: 'sedan_first',
      name: 'Mercedes-Benz S-Class',
      tag: 'First Class VIP',
      pax: 3,
      bags: 2,
      mult: 1.5,
      img: '/cars/s-class.webp'
    },
    {
      id: 'eqs',
      name: 'Mercedes-Benz EQS',
      tag: 'Electric VIP',
      pax: 3,
      bags: 2,
      mult: 1.5,
      img: '/cars/s-class.webp'
    },
    {
      id: 'van_business',
      name: 'Mercedes-Benz V-Class',
      tag: 'Executive Van',
      pax: 7,
      bags: 7,
      mult: 1.35,
      img: '/cars/v-class.webp'
    }
  ]
};

const STEP_NAMES = [
  'Enter Ride Details',
  'Choose a Vehicle',
  'Enter Contact Details',
  'Booking Summary'
];

const LUXURY_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f7f4ed' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#524335' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f4ed' }] },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ae9e8c' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#ede7dc' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#82715d' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dfebd4' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#fdfbf7' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#ecdcb9' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d9be85' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#887560' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c7dcdd' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#688288' }]
  }
];

/**
 * Fallback route distance (km) and travel duration (min) estimator
 * for Vienna Day Trip when Google Maps is disabled, offline, or returns no driving route.
 */
export function estimateRouteDistance(pu = '', dr = '', mode = 'transfer', tourIdx = 0) {
  if (mode === 'hourly') {
    return { km: 0, min: 0 };
  }

  if (mode === 'daytrip') {
    const TOUR_ESTIMATES = {
      0: { km: 290, min: 200 }, // Hallstatt Day Trip
      1: { km: 300, min: 180 }, // Salzburg Day Trip
      2: { km: 90, min: 65 },   // Wachau Valley Day Trip / Melk
      3: { km: 80, min: 60 },   // Bratislava Day Trip
      4: { km: 245, min: 150 }, // Budapest Day Trip
      5: { km: 330, min: 210 }, // Prague Day Trip
      6: { km: 25, min: 45 }    // Vienna Sightseeing Tour
    };
    return TOUR_ESTIMATES[tourIdx] || { km: 200, min: 150 };
  }

  // Transfer mode — examine pickup and drop-off text
  const tx = `${pu || ''} ${dr || ''}`.toLowerCase();

  // Known Intercity & Long-Distance routes
  if (tx.includes('salzburg')) return { km: 300, min: 180 };
  if (tx.includes('hallstatt')) return { km: 290, min: 200 };
  if (tx.includes('budapest')) return { km: 245, min: 150 };
  if (tx.includes('prague')) return { km: 330, min: 210 };
  if (tx.includes('bratislava')) return { km: 80, min: 60 };
  if (tx.includes('graz')) return { km: 200, min: 130 };
  if (tx.includes('wachau') || tx.includes('melk')) return { km: 90, min: 65 };
  if (tx.includes('linz')) return { km: 185, min: 115 };
  if (tx.includes('munich') || tx.includes('münchen')) return { km: 435, min: 270 };
  if (tx.includes('innsbruck')) return { km: 480, min: 300 };
  if (tx.includes('cesky krumlov') || tx.includes('krumlov')) return { km: 205, min: 150 };
  if (tx.includes('brno')) return { km: 140, min: 95 };

  // Vienna Airport (VIE) / Schwechat routes
  if (tx.includes('airport') || tx.includes('vie') || tx.includes('schwechat')) {
    return { km: 20, min: 25 };
  }

  // City center landmarks, stations and hotels
  if (
    tx.includes('hauptbahnhof') ||
    tx.includes('westbahnhof') ||
    tx.includes('stephansplatz') ||
    tx.includes('innere stadt') ||
    tx.includes('schönbrunn') ||
    tx.includes('schoenbrunn') ||
    tx.includes('hotel')
  ) {
    return { km: 15, min: 25 };
  }

  // Local Vienna transfer when both addresses are specified
  if (pu.trim() && dr.trim()) {
    return { km: 15, min: 25 };
  }

  // Standard initial transfer baseline
  return { km: 20, min: 25 };
}

export default function Booking() {
  const location = useLocation();

  // Helper date & formatting utilities
  const p2 = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const today = `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;

  const defaultTime = useMemo(() => {
    const t0 = new Date(now);
    t0.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
    return `${p2(t0.getHours())}:${p2(t0.getMinutes())}`;
  }, []);

  // Primary Booking State
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('transfer'); // 'transfer' | 'hourly' | 'daytrip'
  const [car, setCar] = useState(S.CARS[0]);
  const [disc, setDisc] = useState(null); // { c: 'WELCOME10', p: 10 }
  const [km, setKm] = useState(20);
  const [min, setMin] = useState(25);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'later'
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState(null); // { type: 'ok'|'no', text: '' }

  // Form Fields
  const [d, setD] = useState(today);
  const [t, setT] = useState(defaultTime);
  const [pu, setPu] = useState('');
  const [dr, setDr] = useState('');
  const [ty, setTy] = useState('oneway'); // 'oneway' | 'return'
  const [hr, setHr] = useState(3);
  const [tr, setTr] = useState(0);
  const [ex, setEx] = useState(0);

  // Contact Fields (Step 3)
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [em, setEm] = useState('');
  const [ph, setPh] = useState('');
  const [px, setPx] = useState(1);
  const [bg, setBg] = useState(1);
  const [cs, setCs] = useState(0);
  const [fl, setFl] = useState('');
  const [wt, setWt] = useState('Still Water');
  const [nt, setNt] = useState('');

  // Agreements (Step 4)
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [alertState, setAlertState] = useState({
    bad: false,
    text: 'Please accept the agreements below to continue.'
  });

  // Submission & Result States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doneResult, setDoneResult] = useState(null); // { success: true, reference: '', pay: null }
  const [simulatedCheckoutData, setSimulatedCheckoutData] = useState(null);
  const [errFields, setErrFields] = useState({});

  // Fallback Autocomplete Suggestions
  const [puSuggestions, setPuSuggestions] = useState([]);
  const [drSuggestions, setDrSuggestions] = useState([]);
  const [showPuAc, setShowPuAc] = useState(false);
  const [showDrAc, setShowDrAc] = useState(false);

  // Map & Autocomplete Refs & States
  const mapElementRef = useRef(null);
  const map2ElementRef = useRef(null);
  const puInputRef = useRef(null);
  const drInputRef = useRef(null);
  const gmapRef = useRef(null);
  const dirSvcRef = useRef(null);
  const dirRenRef = useRef(null);
  const gmap2Ref = useRef(null);
  const dirRen2Ref = useRef(null);
  const puMarkerRef = useRef(null);
  const drMarkerRef = useRef(null);
  const puAcRef = useRef(null);
  const drAcRef = useRef(null);
  const [directionsData, setDirectionsData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [routeError, setRouteError] = useState(null);

  // Vienna Landmarks for quick suggestion
  const popularLocations = [
    'Vienna International Airport (VIE), Schwechat',
    'Vienna City Center (Innere Stadt / Stephansplatz)',
    'Hotel Sacher Vienna, Philharmoniker Str. 4',
    'Hotel Bristol, Kärntner Ring 1, Vienna',
    'Hotel Imperial, Kärntner Ring 16, Vienna',
    'The Ritz-Carlton, Schubertring 5-7, Vienna',
    'Palais Coburg, Coburgbastei 4, Vienna',
    'Vienna Central Station (Wien Hauptbahnhof)',
    'Vienna West Station (Westbahnhof)',
    'Schönbrunn Palace, Schloßstraße 47, Vienna',
    'Bratislava, Slovakia',
    'Budapest, Hungary',
    'Salzburg, Austria',
    'Hallstatt, Austria',
    'Prague, Czech Republic',
    'Graz, Austria'
  ];

  // Currency formatters
  const eur = (n) => `€${Math.round(n)}`;
  const money = (n) => `€${n.toFixed(2)}`;

  // Parse Query Parameters on Mount
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const service = q.get('service');
    if (service === 'hourly') setMode('hourly');
    else if (service === 'daytrip') setMode('daytrip');
    else if (service === 'transfer') setMode('transfer');

    if (q.get('pickup')) setPu(q.get('pickup'));
    if (q.get('dropoff')) setDr(q.get('dropoff'));
    if (q.get('date') && q.get('date') >= today) setD(q.get('date'));
    if (q.get('time')) setT(q.get('time'));
    if (q.get('type')) setTy(q.get('type')); // 'oneway' | 'return'
    if (q.get('hours')) setHr(Number(q.get('hours')));
    if (q.get('extra')) setEx(Number(q.get('extra')));

    const tourParam = q.get('tour') || q.get('route');
    if (tourParam) {
      const idx = S.TOURS.findIndex(([name]) =>
        name.toLowerCase().includes(tourParam.toLowerCase())
      );
      if (idx !== -1) {
        setTr(idx);
        setMode('daytrip');
      }
    }

    const qv = q.get('vehicle');
    if (qv) {
      const found = S.CARS.find((c) => c.id === qv || c.name.toLowerCase().includes(qv.toLowerCase()));
      if (found) setCar(found);
    }

    // Handle Stripe Payment Return Redirects
    const paymentStatus = q.get('payment_status');
    const bookingId = q.get('booking_id');
    const sessionId = q.get('session_id');

    if (paymentStatus === 'success' && bookingId) {
      setIsSubmitting(true);
      fetchBookingPaymentStatus(bookingId).then((res) => {
        setIsSubmitting(false);
        if (res.success && res.paymentStatus === 'PAID') {
          setDoneResult({
            success: true,
            reference: res.reference,
            pay: {
              stripeSessionId: res.stripeSessionId || sessionId,
              paymentIntentId: res.stripePaymentIntentId,
              amount: res.amount,
              currency: res.currency || 'EUR'
            },
            summaryText: `Vienna Day Trip Booking - Reference ${res.reference} (PAID via Stripe)`
          });
          setStep(4);
        } else {
          // Awaiting final webhook confirmation
          setDoneResult({
            success: true,
            reference: res.reference || `VDT-${bookingId.slice(-6)}`,
            pay: {
              stripeSessionId: sessionId,
              amount: res.amount,
              currency: res.currency || 'EUR'
            },
            summaryText: `Vienna Day Trip Booking - Reference ${res.reference} (Payment Processing)`
          });
          setStep(4);
        }
      });
    } else if (paymentStatus === 'cancelled') {
      setAlertState({
        bad: true,
        text: 'Your Stripe payment was cancelled. Your booking details and entered preferences have been preserved. You can try again with Stripe or select "Request only".'
      });
      setStep(4);
    }
  }, [location.search]);

  const VIENNA_CENTER = { lat: 48.2082, lng: 16.3738 };

  // Load Google Maps Script if Key is provided and integration is enabled
  useEffect(() => {
    if (!ENABLE_GOOGLE_MAPS) {
      setMapLoading(false);
      setMapLoaded(false);
      setMapError(null);
      return;
    }

    // Intercept Google Maps authentication failure (InvalidKeyMapError, ApiNotActivated, etc.)
    window.gm_authFailure = () => {
      console.warn('[Google Maps] Authentication failure: gm_authFailure fired');
      setMapError({
        type: 'auth_failure',
        title: 'Google Maps Authentication Notice',
        message: 'The configured Google Maps API key failed authentication (InvalidKeyMapError).',
        detail:
          'Please verify that VITE_GOOGLE_MAPS_API_KEY in .env is an active Google Cloud Maps JavaScript API key (typically beginning with AIzaSy) with active billing and required APIs enabled.'
      });
      setMapLoading(false);
    };

    if (!S.MAPS_KEY) {
      setMapError({
        type: 'missing_key',
        title: 'Google Maps API Key Not Configured',
        message: 'No Google Maps API key was found in VITE_GOOGLE_MAPS_API_KEY.',
        detail: 'Please configure your Google Cloud Maps API key in .env to activate live interactive route preview.'
      });
      setMapLoading(false);
      return;
    }

    if (window.google?.maps) {
      initMaps();
    } else {
      setMapLoading(true);
      const existingScript = document.getElementById('vdt-google-maps-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'vdt-google-maps-script';
        script.async = true;
        script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          S.MAPS_KEY
        )}&libraries=places&v=weekly`;
        script.onload = () => {
          initMaps();
        };
        script.onerror = () => {
          setMapError({
            type: 'load_error',
            title: 'Failed to Load Google Maps SDK',
            message: 'Unable to reach Google Maps servers (maps.googleapis.com).',
            detail: 'Please check your internet connection or firewall/adblocker settings.'
          });
          setMapLoading(false);
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', () => initMaps());
      }
    }
  }, []);

  const initMaps = () => {
    if (!ENABLE_GOOGLE_MAPS || !window.google?.maps || !mapElementRef.current) return;
    try {
      if (!gmapRef.current) {
        const map = new window.google.maps.Map(mapElementRef.current, {
          center: VIENNA_CENTER,
          zoom: 12,
          styles: LUXURY_MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        const dirSvc = new window.google.maps.DirectionsService();
        const dirRen = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#c9a04f',
            strokeWeight: 5,
            strokeOpacity: 0.95
          }
        });

        gmapRef.current = map;
        dirSvcRef.current = dirSvc;
        dirRenRef.current = dirRen;
        setMapLoaded(true);
        setMapLoading(false);
        setMapError(null);
      }

      attachAutocomplete();
      calcRoute();
    } catch (e) {
      console.warn('[Maps] Init note:', e.message);
      setMapError({
        type: 'init_error',
        title: 'Google Maps Initialization Error',
        message: e.message || 'Error initializing Google Maps.',
        detail: 'Please check browser console for detailed logs.'
      });
      setMapLoading(false);
    }
  };

  const attachAutocomplete = () => {
    if (!ENABLE_GOOGLE_MAPS || !window.google?.maps?.places) return;

    if (puInputRef.current && !puAcRef.current) {
      try {
        const puAc = new window.google.maps.places.Autocomplete(puInputRef.current, {
          componentRestrictions: { country: ['at', 'sk', 'cz', 'hu', 'de'] },
          fields: ['formatted_address', 'geometry', 'name']
        });
        puAc.addListener('place_changed', () => {
          const place = puAc.getPlace();
          if (place && (place.formatted_address || place.name)) {
            const val = place.formatted_address || place.name;
            setPu(val);
            setShowPuAc(false);
          }
        });
        puAcRef.current = puAc;
      } catch (err) {
        console.warn('[Places] Pickup autocomplete error:', err);
      }
    }

    if (drInputRef.current && !drAcRef.current) {
      try {
        const drAc = new window.google.maps.places.Autocomplete(drInputRef.current, {
          componentRestrictions: { country: ['at', 'sk', 'cz', 'hu', 'de'] },
          fields: ['formatted_address', 'geometry', 'name']
        });
        drAc.addListener('place_changed', () => {
          const place = drAc.getPlace();
          if (place && (place.formatted_address || place.name)) {
            const val = place.formatted_address || place.name;
            setDr(val);
            setShowDrAc(false);
          }
        });
        drAcRef.current = drAc;
      } catch (err) {
        console.warn('[Places] Dropoff autocomplete error:', err);
      }
    }
  };

  useEffect(() => {
    if (mapLoaded && ENABLE_GOOGLE_MAPS) {
      attachAutocomplete();
    }
  }, [mapLoaded, mode]);

  // Autocomplete fallback handler for popular locations
  const handleLocationSearch = (val, isPickup) => {
    if (isPickup) {
      setPu(val);
      if (val.trim().length > 1) {
        const matches = popularLocations.filter((loc) =>
          loc.toLowerCase().includes(val.toLowerCase())
        );
        setPuSuggestions(matches.slice(0, 5));
        setShowPuAc(true);
      } else {
        setShowPuAc(false);
      }
    } else {
      setDr(val);
      if (val.trim().length > 1) {
        const matches = popularLocations.filter((loc) =>
          loc.toLowerCase().includes(val.toLowerCase())
        );
        setDrSuggestions(matches.slice(0, 5));
        setShowDrAc(true);
      } else {
        setShowDrAc(false);
      }
    }
  };

  // Route calculation (Google Directions live route with reliable fallback estimation)
  const calcRoute = () => {
    if (mode === 'hourly') {
      setMin((Number(hr) || 3) * 60);
      setKm(0);
      setRouteError(null);
      if (dirRenRef.current) dirRenRef.current.set('directions', null);
      if (ENABLE_GOOGLE_MAPS && pu && window.google?.maps?.Geocoder && gmapRef.current) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: pu }, (results, status) => {
          if (status === 'OK' && results[0] && gmapRef.current) {
            const loc = results[0].geometry.location;
            if (!puMarkerRef.current) {
              puMarkerRef.current = new window.google.maps.Marker({
                map: gmapRef.current,
                title: `Pickup: ${pu}`,
                label: { text: 'P', color: '#fff', fontWeight: 'bold' }
              });
            }
            puMarkerRef.current.setPosition(loc);
            puMarkerRef.current.setMap(gmapRef.current);
            gmapRef.current.panTo(loc);
            gmapRef.current.setZoom(13);
          }
        });
      }
      return;
    }

    if (!ENABLE_GOOGLE_MAPS || !window.google?.maps) {
      const est = estimateRouteDistance(pu, dr, mode, tr);
      setKm(est.km);
      setMin(est.min);
      setRouteError(null);
      return;
    }

    if (mode === 'daytrip') {
      const tour = S.TOURS[tr];
      const TOUR_DESTINATIONS = {
        0: 'Hallstatt, 4830, Austria',
        1: 'Salzburg, Austria',
        2: 'Melk Abbey, Wachau Valley, Austria',
        3: 'Bratislava, Slovakia',
        4: 'Budapest, Hungary',
        5: 'Prague, Czech Republic',
        6: 'Schönbrunn Palace, Vienna, Austria'
      };
      const dest = TOUR_DESTINATIONS[tr] || 'Hallstatt, Austria';
      const origin = pu.trim() || 'Vienna City Center, Austria';

      if (dirSvcRef.current && window.google?.maps) {
        dirSvcRef.current.route(
          {
            origin,
            destination: dest,
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (res, status) => {
            if (status === 'OK' && res?.routes?.[0]?.legs?.[0]) {
              setDirectionsData(res);
              if (dirRenRef.current) dirRenRef.current.setDirections(res);
              const leg = res.routes[0].legs[0];
              setKm(leg.distance.value / 1000);
              setMin(leg.duration.value / 60);
              setRouteError(null);
              if (puMarkerRef.current) puMarkerRef.current.setMap(null);
              if (drMarkerRef.current) drMarkerRef.current.setMap(null);
            } else {
              const est = estimateRouteDistance(pu, dr, mode, tr);
              setKm(est.km);
              setMin(est.min);
              setRouteError(null);
            }
          }
        );
      } else {
        const est = estimateRouteDistance(pu, dr, mode, tr);
        setKm(est.km);
        setMin(est.min);
        setRouteError(null);
      }
      return;
    }

    // Transfer mode
    if (dirSvcRef.current && pu && dr && window.google?.maps) {
      dirSvcRef.current.route(
        { origin: pu, destination: dr, travelMode: window.google.maps.TravelMode.DRIVING },
        (res, status) => {
          if (status === 'OK' && res?.routes?.[0]?.legs?.[0]) {
            setDirectionsData(res);
            if (dirRenRef.current) dirRenRef.current.setDirections(res);
            const leg = res.routes[0].legs[0];
            setKm(leg.distance.value / 1000);
            setMin(leg.duration.value / 60);
            setRouteError(null);
            if (puMarkerRef.current) puMarkerRef.current.setMap(null);
            if (drMarkerRef.current) drMarkerRef.current.setMap(null);
          } else {
            const est = estimateRouteDistance(pu, dr, mode, tr);
            setKm(est.km);
            setMin(est.min);
            setRouteError(null);
          }
        }
      );
    } else {
      // Clear route line if both locations are not set
      if (dirRenRef.current) dirRenRef.current.set('directions', null);
      const est = estimateRouteDistance(pu, dr, mode, tr);
      setKm(est.km);
      setMin(est.min);

      if (pu && !dr && window.google?.maps?.Geocoder && gmapRef.current) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: pu }, (results, status) => {
          if (status === 'OK' && results[0] && gmapRef.current) {
            const loc = results[0].geometry.location;
            if (!puMarkerRef.current) {
              puMarkerRef.current = new window.google.maps.Marker({
                map: gmapRef.current,
                title: `Pickup: ${pu}`,
                label: { text: 'A', color: '#fff', fontWeight: 'bold' }
              });
            }
            puMarkerRef.current.setPosition(loc);
            puMarkerRef.current.setMap(gmapRef.current);
            gmapRef.current.panTo(loc);
            gmapRef.current.setZoom(14);
          }
        });
        if (drMarkerRef.current) drMarkerRef.current.setMap(null);
      } else if (!pu && dr && window.google?.maps?.Geocoder && gmapRef.current) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: dr }, (results, status) => {
          if (status === 'OK' && results[0] && gmapRef.current) {
            const loc = results[0].geometry.location;
            if (!drMarkerRef.current) {
              drMarkerRef.current = new window.google.maps.Marker({
                map: gmapRef.current,
                title: `Drop-off: ${dr}`,
                label: { text: 'B', color: '#fff', fontWeight: 'bold' }
              });
            }
            drMarkerRef.current.setPosition(loc);
            drMarkerRef.current.setMap(gmapRef.current);
            gmapRef.current.panTo(loc);
            gmapRef.current.setZoom(14);
          }
        });
        if (puMarkerRef.current) puMarkerRef.current.setMap(null);
      } else {
        if (puMarkerRef.current) puMarkerRef.current.setMap(null);
        if (drMarkerRef.current) drMarkerRef.current.setMap(null);
        if (gmapRef.current) {
          gmapRef.current.panTo(VIENNA_CENTER);
          gmapRef.current.setZoom(12);
        }
      }
    }
  };

  useEffect(() => {
    calcRoute();
  }, [mode, pu, dr, hr, tr, ty]);

  // Second Map in Step 4
  useEffect(() => {
    if (step === 4 && window.google?.maps && map2ElementRef.current && directionsData) {
      if (!gmap2Ref.current) {
        gmap2Ref.current = new window.google.maps.Map(map2ElementRef.current, {
          center: { lat: 48.2082, lng: 16.3738 },
          zoom: 7,
          styles: LUXURY_MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true
        });
        dirRen2Ref.current = new window.google.maps.DirectionsRenderer({
          map: gmap2Ref.current,
          polylineOptions: {
            strokeColor: '#c9a04f',
            strokeWeight: 4,
            strokeOpacity: 0.95
          }
        });
      }
      if (dirRen2Ref.current) {
        dirRen2Ref.current.setDirections(directionsData);
      }
    }
  }, [step, directionsData]);

  // Pricing (Business Sedan base in EUR)
  const basePrice = useMemo(() => {
    const e = (Number(ex) / 60) * S.HOURLY;
    let b = null;
    if (mode === 'hourly') {
      const hours = Math.max(2, Number(hr) || 2);
      b = hours * S.HOURLY;
    } else if (mode === 'daytrip') {
      b = S.TOURS[tr] ? S.TOURS[tr][1] : 208;
    } else {
      const tx = `${pu} ${dr}`.toLowerCase();
      for (const k in S.FIX) {
        if (tx.indexOf(k) > -1) {
          b = S.FIX[k];
          break;
        }
      }
      if (b === null) {
        const est = estimateRouteDistance(pu, dr, mode, tr);
        const effectiveKm = km > 0 ? km : est.km;
        if (effectiveKm > 0) {
          b = Math.max(S.MIN, S.BASE + effectiveKm * S.PER_KM);
        } else {
          b = S.MIN;
        }
      }
      if (b !== null && ty === 'return') {
        b *= 2;
      }
    }
    const calculatedBase = (b !== null && !isNaN(b)) ? b : S.MIN;
    return calculatedBase + e;
  }, [mode, hr, tr, ex, pu, dr, km, ty]);

  const CHILD_SEAT_RATE = 10; // EUR per child seat

  const totals = useMemo(() => {
    const effectiveBase = (basePrice !== null && !isNaN(basePrice)) ? basePrice : S.MIN;
    const selectedCar = car || S.CARS[0];
    const s = effectiveBase * selectedCar.mult;
    const childSeatCharge = Number(cs || 0) * CHILD_SEAT_RATE;
    const subtotalWithChildSeats = s + childSeatCharge;
    const d = disc ? (s * disc.p) / 100 : 0;
    return {
      s,                            // vehicle subtotal (before child seats & discount)
      childSeatCharge,              // €10 * number of child seats
      d,                            // discount applied to vehicle subtotal only
      t: subtotalWithChildSeats - d // final total in EUR
    };
  }, [basePrice, car, disc, cs]);

  const serviceLabel = () => {
    return { transfer: 'Transfer', hourly: 'Hourly Chauffeur', daytrip: 'Day Trip' }[mode];
  };

  // Form Validation
  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!d || d < today) errs.d = true;
      if (!t) errs.t = true;
      if (!pu.trim()) errs.pu = true;
      if (mode === 'transfer' && !dr.trim()) errs.dr = true;
    }
    if (s === 3) {
      if (!fn.trim()) errs.fn = true;
      if (!ln.trim()) errs.ln = true;
      if (!/^\S+@\S+\.\S+$/.test(em)) errs.em = true;
      if (ph.replace(/\D/g, '').length < 7) errs.ph = true;
    }
    setErrFields(errs);
    return Object.keys(errs).length === 0;
  };

  const go = (targetStep) => {
    if (targetStep > step) {
      if (step === 1 && !validateStep(1)) return;
      if (step === 2 && !car) {
        alert('Please choose a vehicle.');
        return;
      }
      if (step === 3 && !validateStep(3)) return;
    }
    setStep(targetStep);
    document.getElementById('bk')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Promo Code Application
  const applyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (S.CODES[code]) {
      setDisc({ c: code, p: S.CODES[code] });
      setPromoMessage({ type: 'ok', text: `${S.CODES[code]}% discount applied.` });
    } else {
      setDisc(null);
      setPromoMessage({
        type: 'no',
        text: 'This code is not valid. Please check it and try again.'
      });
    }
  };

  // Build Summary Lines for Submission & WhatsApp
  const buildLines = () => {
    const tVal = totals;
    const L = [
      ['Service', serviceLabel()],
      ['Date & time', `${d} at ${t}`],
      ['Pickup', pu]
    ];
    if (mode === 'transfer') {
      L.push(
        ['Transfer type', ty === 'return' ? 'Return' : 'One way'],
        ['Drop-off', dr],
        ['Distance', `${Math.round(km)} km`]
      );
    }
    if (mode === 'hourly') {
      L.push(['Duration', `${hr} hours`]);
    }
    if (mode === 'daytrip') {
      L.push(['Tour', S.TOURS[tr] ? S.TOURS[tr][0] : 'Day Trip']);
    }
    if (Number(ex)) {
      L.push(['Extra time', `${ex} min`]);
    }
    L.push(
      ['Vehicle', car ? car.name : 'Mercedes-Benz'],
      ['Passengers / bags / child seats', `${px} / ${bg} / ${cs}`]
    );
    if (cs > 0) {
      L.push(['Child seat charge', `${cs} × €${CHILD_SEAT_RATE} = €${cs * CHILD_SEAT_RATE}`]);
    }
    if (fl) L.push(['Flight', fl]);
    L.push(
      ['Water', wt],
      ['Name', `${fn} ${ln}`],
      ['Email', em],
      ['Phone', ph]
    );
    if (nt) L.push(['Notes', nt]);
    if (disc) L.push(['Discount code', `${disc.c} (-${disc.p}%)`]);
    if (tVal) {
      L.push(['Vehicle price', money(tVal.s)]);
      if (tVal.childSeatCharge > 0) L.push(['Child seats charge', money(tVal.childSeatCharge)]);
      if (tVal.d > 0) L.push(['Discount', `-${money(tVal.d)}`]);
    }
    L.push(['Total', money(tVal ? tVal.t : (S.MIN * (car?.mult || 1)))]);
    return L;
  };

  // Final Submission to Neon Database + Stripe Payment Flow
  const handleConfirmSubmit = async () => {
    // 1. Validate the required agreement checkboxes
    if (!a1 || !a2) {
      setAlertState({
        bad: true,
        text: 'Please accept both required agreements to complete your booking.'
      });
      document.getElementById('al')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 2. Validate all booking and customer details
    if (!fn.trim() || !ln.trim() || !em.trim() || !ph.trim() || !pu.trim() || !d || !t) {
      setAlertState({
        bad: true,
        text: 'Please ensure all required contact and journey fields (Name, Email, Phone, Pickup, Date, Time) are filled.'
      });
      document.getElementById('al')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setAlertState({
      bad: false,
      text: 'Processing your booking...'
    });

    setIsSubmitting(true);
    const L = buildLines();
    const isOnline = paymentMethod === 'online' && totals;

    const childSeatCount = Number(cs);
    const childSeatCharge = childSeatCount * CHILD_SEAT_RATE;

    const bookingPayload = {
      customerName: `${fn} ${ln}`.trim(),
      email: em.trim().toLowerCase(),
      phone: ph.trim(),
      serviceType:
        mode === 'hourly'
          ? 'Hourly Chauffeur Service'
          : mode === 'daytrip'
          ? S.TOURS[tr]
            ? S.TOURS[tr][0]
            : 'Private Day Trip'
          : ty === 'return'
          ? 'Return Airport / City Transfer'
          : 'One Way Transfer',
      pickupLocation: pu.trim(),
      dropoffLocation:
        mode === 'transfer'
          ? dr.trim()
          : mode === 'hourly'
          ? 'Vienna (As Directed)'
          : S.TOURS[tr]
          ? S.TOURS[tr][0]
          : 'Vienna Day Trip',
      pickupDate: d,
      pickupTime: t,
      passengerCount: `${px} Passengers`,
      luggageDetails: `${bg} Suitcases${childSeatCount > 0 ? `, ${childSeatCount} Child Seat(s)` : ''}`,
      preferredVehicle: car.name,
      childSeatCount,
      childSeatCharge,
      paymentAmount: totals?.t ? Number(totals.t.toFixed(2)) : undefined,
      promoCode: disc?.c || undefined,
      specialRequests: [
        nt ? `Notes: ${nt}` : '',
        fl ? `Flight: ${fl}` : '',
        wt ? `Water: ${wt}` : '',
        disc ? `Discount: ${disc.c} (-${disc.p}%)` : '',
        childSeatCount > 0 ? `Child seats: ${childSeatCount} × €${CHILD_SEAT_RATE} = €${childSeatCharge}` : '',
        totals ? `Vehicle Price: €${totals.s.toFixed(2)} | Total: €${totals.t.toFixed(2)}` : '',
        isOnline
          ? 'Payment method: Pay Online (Stripe)'
          : 'Payment method: Request only (Pay later / on board)'
      ]
        .filter(Boolean)
        .join(' | ')
    };

    try {
      // 3. Send booking details to backend to securely create/store booking record
      const res = await submitBookingEnquiry(bookingPayload);
      const booking = res.booking || res;
      const bookingId = booking.id || booking.reference;
      const reference = booking.reference || `VDT-${Date.now().toString().slice(-6)}`;

      if (isOnline) {
        // 4 & 5. Backend calculates EUR payable amount and creates Stripe Checkout Session
        const stripeRes = await createStripeCheckoutSession({
          bookingId,
          discountCode: disc?.c,
          childSeatCount: Number(cs)
        });

        if (!stripeRes.success || !stripeRes.url) {
          throw new Error(stripeRes.error || 'Failed to create Stripe Checkout session. Please try again or choose Request only.');
        }

        // Test mode simulation handler (if in local simulated test mode)
        if (stripeRes.isSimulation) {
          setIsSubmitting(false);
          setSimulatedCheckoutData({
            bookingId,
            sessionId: stripeRes.sessionId,
            amount: stripeRes.amount,
            bookingReference: reference
          });
          return;
        }

        // 6. Redirect the customer to Stripe's secure hosted checkout
        window.location.href = stripeRes.url;
        return;
      }

      // Request only flow
      const summaryText =
        'New booking request - Vienna Day Trip\n' +
        L.map((r) => `${r[0]}: ${r[1]}`).join('\n') +
        '\nPayment: Pay later / on board';

      setDoneResult({
        success: true,
        reference,
        pay: null,
        summaryText
      });

      setTimeout(() => {
        document.getElementById('done')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('[Booking Submit Error]:', error);
      setAlertState({
        bad: true,
        text: error.message || 'An error occurred while submitting your booking. Please try again.'
      });
      document.getElementById('al')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-vdt-root">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="hero">
        <div className="hg">
          <div>
            <div className="eb">Online booking</div>
            <h1>
              Book Your Private <em>Chauffeur</em> in Vienna
            </h1>
            <p>
              Enter your trip details, choose your Mercedes-Benz and confirm. The fixed price is
              shown before you book.
            </p>
            <ul className="ticks">
              <li>Fixed Price Upfront</li>
              <li>E-Class, S-Class, EQS &amp; V-Class</li>
              <li>Flight Monitoring Included</li>
              <li>Quick Confirmation</li>
            </ul>
            <a
              className="pill"
              href="#bk"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('bk')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Book Now
            </a>
          </div>
          <img
            src="/cars/hero-s-class-car.webp"
            alt="Mercedes-Benz S-Class private chauffeur car in Vienna"
            width="1600"
            height="900"
          />
        </div>
      </section>

      {/* =========================================================================
          CARD WIZARD SECTION
          ========================================================================= */}
      <main className="wrap">
        <div className="card" id="bk">
          {/* Steps Progress Header */}
          <div className="steps" id="steps">
            {STEP_NAMES.map((name, i) => {
              const stepNum = i + 1;
              const isOn = step === stepNum;
              const isDone = step > stepNum;
              return (
                <div
                  key={name}
                  className={`step ${isOn ? 'on' : ''} ${isDone ? 'done' : ''}`}
                  onClick={() => {
                    if (stepNum < step) setStep(stepNum);
                  }}
                >
                  <i>{isDone ? '✓' : stepNum}</i>
                  {name}
                </div>
              );
            })}
          </div>

          {/* =====================================================================
              STEP 1: RIDE DETAILS
              ===================================================================== */}
          <section className={`panel ${step === 1 ? 'on' : ''}`} data-p="1">
            <div className="g2">
              <div>
                {/* Mode Selector Tabs */}
                <div className="tabs" role="tablist">
                  <button
                    type="button"
                    className="tab"
                    data-m="transfer"
                    aria-selected={mode === 'transfer'}
                    onClick={() => setMode('transfer')}
                  >
                    Transfer
                  </button>
                  <button
                    type="button"
                    className="tab"
                    data-m="hourly"
                    aria-selected={mode === 'hourly'}
                    onClick={() => setMode('hourly')}
                  >
                    Hourly
                  </button>
                  <button
                    type="button"
                    className="tab"
                    data-m="daytrip"
                    aria-selected={mode === 'daytrip'}
                    onClick={() => setMode('daytrip')}
                  >
                    Day Trip
                  </button>
                </div>

                <div className="box">
                  <div className="sec">Ride details</div>
                  <div className="two">
                    <div className={`f ${errFields.d ? 'err' : ''}`} data-f="d">
                      <label htmlFor="d">Pickup date</label>
                      <input
                        id="d"
                        type="date"
                        min={today}
                        value={d}
                        onChange={(e) => setD(e.target.value)}
                      />
                      <small>Choose a future date</small>
                    </div>
                    <div className={`f ${errFields.t ? 'err' : ''}`} data-f="t">
                      <label htmlFor="t">Pickup time</label>
                      <input
                        id="t"
                        type="time"
                        value={t}
                        onChange={(e) => setT(e.target.value)}
                      />
                      <small>Choose a valid time</small>
                    </div>
                  </div>

                  {/* Pickup Location with Suggestions */}
                  <div className={`f ${errFields.pu ? 'err' : ''}`} data-f="pu">
                    <label htmlFor="pu">Pickup location</label>
                    <input
                      id="pu"
                      ref={ENABLE_GOOGLE_MAPS ? puInputRef : null}
                      placeholder="Enter a location (e.g. Vienna Airport VIE or Hotel Sacher)"
                      autoComplete="off"
                      value={pu}
                      onChange={(e) => handleLocationSearch(e.target.value, true)}
                      onFocus={() => {
                        if (pu.trim().length > 1) setShowPuAc(true);
                      }}
                      onBlur={() => setTimeout(() => setShowPuAc(false), 250)}
                    />
                    <small>Enter a pickup location</small>
                    {showPuAc && puSuggestions.length > 0 && (
                      <ul className="ttb-ac">
                        {puSuggestions.map((item) => (
                          <li
                            key={item}
                            onMouseDown={() => {
                              setPu(item);
                              setShowPuAc(false);
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Drop-off Location (Transfer Mode Only) */}
                  {mode === 'transfer' && (
                    <div className={`f ${errFields.dr ? 'err' : ''}`} data-f="dr" id="rd">
                      <label htmlFor="dr">Drop-off location</label>
                      <input
                        id="dr"
                        ref={ENABLE_GOOGLE_MAPS ? drInputRef : null}
                        placeholder="Enter a location (e.g. Vienna City Center or Stephansplatz)"
                        autoComplete="off"
                        value={dr}
                        onChange={(e) => handleLocationSearch(e.target.value, false)}
                        onFocus={() => {
                          if (dr.trim().length > 1) setShowDrAc(true);
                        }}
                        onBlur={() => setTimeout(() => setShowDrAc(false), 250)}
                      />
                      <small>Enter a drop-off location</small>
                      {showDrAc && drSuggestions.length > 0 && (
                        <ul className="ttb-ac">
                          {drSuggestions.map((item) => (
                            <li
                              key={item}
                              onMouseDown={() => {
                                setDr(item);
                                setShowDrAc(false);
                              }}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Transfer Type (Transfer Mode Only) */}
                  {mode === 'transfer' && (
                    <div className="f" id="rt">
                      <label htmlFor="ty">Transfer type</label>
                      <select id="ty" value={ty} onChange={(e) => setTy(e.target.value)}>
                        <option value="oneway">One Way</option>
                        <option value="return">Return</option>
                      </select>
                    </div>
                  )}

                  {/* Hours of Service (Hourly Mode Only) */}
                  {mode === 'hourly' && (
                    <div className="f" id="rh">
                      <label htmlFor="hr">Hours of service</label>
                      <select
                        id="hr"
                        value={hr}
                        onChange={(e) => setHr(Number(e.target.value))}
                      >
                        {[3, 4, 5, 6, 8, 10, 12].map((h) => (
                          <option key={h} value={h}>
                            {h} Hours ({eur(h * S.HOURLY)} Business Sedan)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Day Trip Selector (Day Trip Mode Only) */}
                  {mode === 'daytrip' && (
                    <div className="f" id="rtr">
                      <label htmlFor="tr">Day trip</label>
                      <select
                        id="tr"
                        value={tr}
                        onChange={(e) => setTr(Number(e.target.value))}
                      >
                        {S.TOURS.map((tour, i) => (
                          <option key={tour[0]} value={i}>
                            {tour[0]} (from {eur(tour[1])})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="sec">Extra options</div>
                  <div className="f">
                    <label htmlFor="ex">Extra time</label>
                    <select id="ex" value={ex} onChange={(e) => setEx(Number(e.target.value))}>
                      <option value="0">0 minute(s)</option>
                      {[15, 30, 45, 60, 75, 90, 105, 120].map((m) => (
                        <option key={m} value={m}>
                          {m} minute(s)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Map & Stats Column */}
              <div>
                <div className="map" id="map-container">
                  {ENABLE_GOOGLE_MAPS ? (
                    <>
                      <div ref={mapElementRef} className="map-canvas" id="map" />
                      {mapLoading && (
                        <div className="map-notice-overlay">
                          <div style={{ textAlign: 'center', color: '#c9a04f' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                border: '3px solid rgba(201, 160, 79, 0.25)',
                                borderTopColor: '#c9a04f',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 10px'
                              }}
                            />
                            <b style={{ display: 'block', fontSize: '13px', color: '#2b251f' }}>
                              Loading Google Maps...
                            </b>
                            <span style={{ fontSize: '11px', color: '#888' }}>
                              Initializing Vienna Route Engine
                            </span>
                          </div>
                        </div>
                      )}
                      {mapError && (
                        <div className="map-notice-overlay">
                          <div className="map-notice-card" id="map-notice">
                            <div className="map-notice-badge">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              <span>Google Maps API Notice</span>
                            </div>
                            <h4>{mapError.title || 'Google Maps Authentication Notice'}</h4>
                            <p className="map-notice-desc">
                              {mapError.message || 'Google Maps failed to initialize with the configured key.'}
                            </p>
                            <div className="map-notice-details">
                              <div className="map-notice-row">
                                <b>Configured Key:</b>{' '}
                                <code>{S.MAPS_KEY ? `${S.MAPS_KEY.substring(0, 10)}...` : 'Not Set'}</code>
                              </div>
                              <div className="map-notice-row">
                                <b>Required Google Cloud Settings:</b>
                                <ul>
                                  <li>Valid Google Cloud Maps Key (begins with <code>AIzaSy</code>)</li>
                                  <li><b>Maps JavaScript API</b> enabled</li>
                                  <li><b>Places API</b> &amp; <b>Directions API</b> enabled</li>
                                  <li>Active Google Cloud Billing Account linked</li>
                                </ul>
                              </div>
                            </div>
                            <div className="map-notice-route">
                              <small>Vienna Chauffeur Route Preview</small>
                              <span>
                                {pu || 'Pickup location'} →{' '}
                                {dr ||
                                  (mode === 'daytrip'
                                    ? S.TOURS[tr][0]
                                    : mode === 'hourly'
                                    ? `${hr} Hours Chauffeur`
                                    : 'Drop-off location')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 20px', maxWidth: '360px', margin: '0 auto' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: 'rgba(201, 160, 79, 0.14)',
                          border: '1px solid rgba(201, 160, 79, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 14px',
                          color: '#b88636'
                        }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                      </div>
                      <b
                        style={{
                          color: '#c9a04f',
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase'
                        }}
                      >
                        VIENNA CHAUFFEUR ROUTE PREVIEW
                      </b>
                      <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#635b50', lineHeight: 1.5 }}>
                        Interactive route preview temporarily unavailable.
                      </p>
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e8dec8',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#171411',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        {pu && dr
                          ? `${pu} → ${dr}`
                          : mode === 'hourly'
                          ? `${pu || 'Vienna'} → ${hr} Hours As Directed`
                          : mode === 'daytrip'
                          ? `${pu || 'Vienna'} → ${S.TOURS[tr] ? S.TOURS[tr][0] : 'Day Trip'}`
                          : pu
                          ? `${pu}`
                          : 'Vienna City Center / Airport'}
                      </div>
                    </div>
                  )}
                </div>
                <div className="stats">
                  <div>
                    <span>Total distance</span>
                    <b id="km">
                      {km > 0 ? `${Math.round(km)} km` : '—'}
                    </b>
                  </div>
                  <div>
                    <span>Total time</span>
                    <b id="mn">
                      {min > 0
                        ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`
                        : '—'}
                    </b>
                  </div>
                </div>
              </div>
            </div>

            <div className="nv">
              <span></span>
              <button type="button" className="btn" data-go="2" onClick={() => go(2)}>
                Choose a vehicle &rsaquo;
              </button>
            </div>
          </section>

          {/* =====================================================================
              STEP 2: CHOOSE A VEHICLE
              ===================================================================== */}
          <section className={`panel ${step === 2 ? 'on' : ''}`} data-p="2">
            <div id="cars">
              {S.CARS.map((vehicle) => {
                const isSelected = car && car.id === vehicle.id;
                const vehicleBase = (basePrice !== null && !isNaN(basePrice)) ? basePrice : S.MIN;
                const calculatedPrice = vehicleBase * vehicle.mult;
                const priceFormatted = eur(calculatedPrice);

                return (
                  <div
                    key={vehicle.id}
                    className="car"
                    role="button"
                    tabIndex={0}
                    data-id={vehicle.id}
                    aria-pressed={isSelected}
                    onClick={() => setCar(vehicle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setCar(vehicle);
                      }
                    }}
                  >
                    <img
                      src={vehicle.img}
                      alt={vehicle.name}
                      loading="lazy"
                      width="170"
                      height="100"
                    />
                    <div>
                      <h3>{vehicle.name}</h3>
                      <p>
                        {vehicle.tag} &middot; up to {vehicle.pax} passengers &middot;{' '}
                        {vehicle.bags} bags
                      </p>
                    </div>
                    <div className="price">
                      {priceFormatted}
                      <small>fixed, all-inclusive</small>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="nv">
              <button type="button" className="btn alt" data-go="1" onClick={() => go(1)}>
                &lsaquo; Back
              </button>
              <button type="button" className="btn" data-go="3" onClick={() => go(3)}>
                Enter contact details &rsaquo;
              </button>
            </div>
          </section>

          {/* =====================================================================
              STEP 3: CONTACT DETAILS
              ===================================================================== */}
          <section className={`panel ${step === 3 ? 'on' : ''}`} data-p="3">
            <div className="box" style={{ maxWidth: '720px' }}>
              <div className="sec">Contact details</div>
              <div className="two">
                <div className={`f ${errFields.fn ? 'err' : ''}`} data-f="fn">
                  <label htmlFor="fn">First name</label>
                  <input
                    id="fn"
                    autoComplete="given-name"
                    value={fn}
                    onChange={(e) => setFn(e.target.value)}
                  />
                  <small>Required</small>
                </div>
                <div className={`f ${errFields.ln ? 'err' : ''}`} data-f="ln">
                  <label htmlFor="ln">Last name</label>
                  <input
                    id="ln"
                    autoComplete="family-name"
                    value={ln}
                    onChange={(e) => setLn(e.target.value)}
                  />
                  <small>Required</small>
                </div>
              </div>

              <div className="two">
                <div className={`f ${errFields.em ? 'err' : ''}`} data-f="em">
                  <label htmlFor="em">Email</label>
                  <input
                    id="em"
                    type="email"
                    autoComplete="email"
                    value={em}
                    onChange={(e) => setEm(e.target.value)}
                  />
                  <small>Enter a valid email</small>
                </div>
                <div className={`f ${errFields.ph ? 'err' : ''}`} data-f="ph">
                  <label htmlFor="ph">Phone (with country code)</label>
                  <input
                    id="ph"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+43 664 ..."
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                  />
                  <small>Enter a phone number</small>
                </div>
              </div>

              <div className="two">
                <div className="f">
                  <label htmlFor="px">Passengers</label>
                  <select id="px" value={px} onChange={(e) => setPx(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="f">
                  <label htmlFor="bg">Suitcases</label>
                  <select id="bg" value={bg} onChange={(e) => setBg(Number(e.target.value))}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="two">
                <div className="f">
                  <label htmlFor="cs">Child seats <span style={{ color: '#c9a04f', fontWeight: 600, fontSize: '12px' }}>(€10 per seat)</span></label>
                  <select id="cs" value={cs} onChange={(e) => setCs(Number(e.target.value))}>
                    <option value="0">0 — No child seat</option>
                    <option value="1">1 — +€10</option>
                    <option value="2">2 — +€20</option>
                    <option value="3">3 — +€30</option>
                  </select>
                </div>
                <div className="f">
                  <label htmlFor="fl">Flight number (optional)</label>
                  <input
                    id="fl"
                    placeholder="e.g. OS 112"
                    value={fl}
                    onChange={(e) => setFl(e.target.value)}
                  />
                </div>
              </div>

              <div className="f">
                <label htmlFor="wt">Water preference</label>
                <select id="wt" value={wt} onChange={(e) => setWt(e.target.value)}>
                  <option value="Still Water">Still Water</option>
                  <option value="Sparkling Water">Sparkling Water</option>
                  <option value="No Water">No Water</option>
                </select>
              </div>

              <div className="f">
                <label htmlFor="nt">Notes (optional)</label>
                <textarea
                  id="nt"
                  rows="3"
                  placeholder="Special requests, luggage sizes, or additional pickup instructions..."
                  value={nt}
                  onChange={(e) => setNt(e.target.value)}
                />
              </div>
            </div>

            <div className="nv">
              <button type="button" className="btn alt" data-go="2" onClick={() => go(2)}>
                &lsaquo; Back
              </button>
              <button type="button" className="btn" data-go="4" onClick={() => go(4)}>
                Booking summary &rsaquo;
              </button>
            </div>
          </section>

          {/* =====================================================================
              STEP 4: BOOKING SUMMARY
              ===================================================================== */}
          <section className={`panel ${step === 4 ? 'on' : ''}`} data-p="4">
            <div className={`alert ${alertState.bad ? 'bad' : ''}`} id="al">
              {alertState.text}
            </div>

            <div className="sm">
              {/* Column 1: Contact & Payment */}
              <div className="col">
                <div className="sc">
                  <div className="sh">
                    <h3>Contact &amp; Billing Info</h3>
                    <button type="button" className="ed" data-go="3" onClick={() => go(3)}>
                      Edit
                    </button>
                  </div>
                  <div id="s1">
                    <div className="s2">
                      <div className="r">
                        <span>First name</span>
                        <b>{fn || '-'}</b>
                      </div>
                      <div className="r">
                        <span>Last name</span>
                        <b>{ln || '-'}</b>
                      </div>
                    </div>
                    <div className="r">
                      <span>E-mail address</span>
                      <b>{em || '-'}</b>
                    </div>
                    <div className="r">
                      <span>Phone number</span>
                      <b>{ph || '-'}</b>
                    </div>
                    <div className="r">
                      <span>Water preference</span>
                      <b>{wt}</b>
                    </div>
                  </div>
                </div>

                <div className="sc pm">
                  <div className="sh">
                    <h3>Payment Method</h3>
                  </div>
                  <label>
                    <input
                      type="radio"
                      name="pm"
                      value="online"
                      checked={paymentMethod === 'online'}
                      disabled={!totals}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>
                      Pay Online (Stripe)
                      <small>Pay securely with Visa, Mastercard, AMEX, Apple Pay, Klarna, EPS or iDEAL in EUR.</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="pm"
                      value="later"
                      checked={paymentMethod === 'later'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>
                      Request only
                      <small>
                        Send your request now. Our team confirms your booking and payment
                        details by email.
                      </small>
                    </span>
                  </label>
                </div>
              </div>

              {/* Column 2: Map & Ride Details */}
              <div className="col">
                <div
                  id="map2"
                  style={{
                    position: 'relative',
                    height: '200px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    background: '#fdfbf7',
                    marginBottom: '20px'
                  }}
                >
                  {ENABLE_GOOGLE_MAPS && directionsData && (
                    <div
                      ref={map2ElementRef}
                      className="map-canvas"
                      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    />
                  )}
                  {(!ENABLE_GOOGLE_MAPS || !directionsData) && (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '16px',
                        background: 'linear-gradient(135deg, var(--soft), #efe4cc)',
                        border: '1px dashed var(--gold)',
                        borderRadius: '16px'
                      }}
                    >
                      <div>
                        <b
                          style={{
                            color: '#c9a04f',
                            display: 'block',
                            marginBottom: '4px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 700
                          }}
                        >
                          VIENNA CHAUFFEUR ROUTE PREVIEW
                        </b>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#635b50' }}>
                          Interactive route preview temporarily unavailable.
                        </p>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#171411' }}>
                          {pu || 'Vienna'} →{' '}
                          {dr ||
                            (mode === 'hourly'
                              ? `${hr} Hours As Directed`
                              : S.TOURS[tr]
                              ? S.TOURS[tr][0]
                              : 'Day Trip')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sc">
                  <div className="sh">
                    <h3>Ride details</h3>
                    <button type="button" className="ed" data-go="1" onClick={() => go(1)}>
                      Edit
                    </button>
                  </div>
                  <div id="s2">
                    <div className="r">
                      <span>Service type</span>
                      <b>{serviceLabel()}</b>
                    </div>
                    {mode === 'transfer' && (
                      <div className="r">
                        <span>Transfer type</span>
                        <b>{ty === 'return' ? 'Return' : 'One way'}</b>
                      </div>
                    )}
                    <div className="r">
                      <span>Pickup location</span>
                      <b>{pu || '-'}</b>
                    </div>
                    {mode === 'transfer' && (
                      <div className="r">
                        <span>Drop-off location</span>
                        <b>{dr || '-'}</b>
                      </div>
                    )}
                    {mode === 'hourly' && (
                      <div className="r">
                        <span>Duration</span>
                        <b>{hr} hours</b>
                      </div>
                    )}
                    {mode === 'daytrip' && (
                      <div className="r">
                        <span>Tour</span>
                        <b>{S.TOURS[tr] ? S.TOURS[tr][0] : 'Day Trip'}</b>
                      </div>
                    )}
                    <div className="r">
                      <span>Pickup date, time</span>
                      <b>
                        {d}, {t}
                      </b>
                    </div>
                    {mode === 'transfer' && (
                      <div className="s2">
                        <div className="r">
                          <span>Total distance</span>
                          <b>{Math.round(km)} km</b>
                        </div>
                        <div className="r">
                          <span>Total time</span>
                          <b>
                            {Math.floor(min / 60)}h {Math.round(min % 60)}m
                          </b>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 3: Vehicle & Pricing */}
              <div className="col">
                <div className="simg" id="simg">
                  <img src={car.img} alt={car.name} />
                </div>
                <div className="sc">
                  <div className="sh">
                    <h3>Vehicle info</h3>
                    <button type="button" className="ed" data-go="2" onClick={() => go(2)}>
                      Edit
                    </button>
                  </div>
                  <div id="s3">
                    <div className="r">
                      <span>Vehicle</span>
                      <b>
                        {car.name} ({car.tag})
                      </b>
                    </div>
                  </div>
                </div>

                <div className="disc">
                  <input
                    id="cd"
                    placeholder="Do you have a discount code?"
                    aria-label="Discount code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                  />
                  <button type="button" id="ap" onClick={applyPromo}>
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <div className={`msg ${promoMessage.type}`} id="dm">
                    {promoMessage.text}
                  </div>
                )}

                <div id="pr">
                  {totals ? (
                    <>
                      <div className="pr">
                        <span>Vehicle price</span>
                        <span>{money(totals.s)}</span>
                      </div>
                      {totals.childSeatCharge > 0 && (
                        <div className="pr">
                          <span>Child seat{cs > 1 ? 's' : ''} ({cs} × €{CHILD_SEAT_RATE})</span>
                          <span>+{money(totals.childSeatCharge)}</span>
                        </div>
                      )}
                      {totals.d > 0 && (
                        <div className="pr">
                          <span>Discount ({disc.c})</span>
                          <span>-{money(totals.d)}</span>
                        </div>
                      )}
                      <div className="pr t">
                        <span>Total</span>
                        <span>{money(totals.t)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="pr t">
                      <span>Total</span>
                      <span>{money((basePrice ?? S.MIN) * (car?.mult || 1))}</span>
                    </div>
                  )}
                </div>
                <div className="fine">
                  Fixed price. Tolls, waiting time and flight monitoring included.
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div className="ag">
              <h4>Agreements</h4>
              <label>
                <input
                  type="checkbox"
                  id="a1"
                  checked={a1}
                  onChange={(e) => setA1(e.target.checked)}
                />
                <span>
                  I accept the Terms &amp; Conditions and the{' '}
                  <a
                    href="https://viennadaytrip.com/cancellation-refund-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cancellation Policy
                  </a>
                  .
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  id="a2"
                  checked={a2}
                  onChange={(e) => setA2(e.target.checked)}
                />
                <span>
                  I understand that the chauffeur will wait 15 minutes free of charge; additional
                  waiting time may be charged.
                </span>
              </label>
            </div>

            <div className="nv">
              <button type="button" className="btn alt" data-go="3" onClick={() => go(3)}>
                &lsaquo; Enter contact details
              </button>
              {!doneResult && (
                <button
                  type="button"
                  className="btn dk"
                  id="send"
                  disabled={isSubmitting}
                  onClick={handleConfirmSubmit}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : paymentMethod === 'online'
                    ? 'Pay & confirm booking \u203A'
                    : 'Send booking request \u203A'}
                </button>
              )}
            </div>

            {/* Done Success Box */}
            <div id="done">
              {doneResult && (
                <div className="ok">
                  <h3 className="serif">
                    {doneResult.pay ? 'Payment Confirmed' : 'Booking Request Received'}
                  </h3>
                  <p>
                    {doneResult.pay ? (
                      <>
                        Thank you, {fn}. Your booking is confirmed with reference{' '}
                        <b>{doneResult.reference}</b> and Stripe payment reference{' '}
                        <b>{doneResult.pay.stripeSessionId || doneResult.pay.paymentIntentId || 'STRIPE_PAID'}</b>
                        {doneResult.pay.amount ? ` (€${Number(doneResult.pay.amount).toFixed(2)} EUR)` : ''}. A confirmation email has been
                        sent to {em}.
                      </>
                    ) : (
                      <>
                        Thank you, {fn}. Your booking reference is <b>{doneResult.reference}</b>. We
                        will confirm your booking and itinerary by email shortly.
                      </>
                    )}
                  </p>
                  <a
                    className="pill"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${S.WHATSAPP}?text=${encodeURIComponent(
                      doneResult.summaryText
                    )}`}
                    style={{ marginTop: '16px' }}
                  >
                    Send details on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================================
          SEO PRICING TABLE SECTION
          ========================================================================= */}
      <section className="seo">
        <div className="sk">
          <h2>Private chauffeur prices from Vienna</h2>
          <p className="ans">
            <b>Short answer:</b> A private Mercedes-Benz chauffeur in Vienna costs from{' '}
            <b>€52 per hour</b>. City transfers start at <b>€55</b>, and day trips from Vienna start
            at <b>€208</b>. Prices below are for the E-Class; the S-Class and EQS are 1.5× and the
            V-Class is 1.35×. The fixed total is shown before you book.
          </p>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Fixed price (E-Class)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hourly chauffeur in Vienna (per hour)</td>
                  <td>€52</td>
                </tr>
                <tr>
                  <td>Vienna → Bratislava transfer</td>
                  <td>€120</td>
                </tr>
                <tr>
                  <td>Vienna → Graz transfer</td>
                  <td>€338</td>
                </tr>
                <tr>
                  <td>Vienna → Budapest transfer</td>
                  <td>€495</td>
                </tr>
                <tr>
                  <td>Vienna → Prague transfer</td>
                  <td>€513</td>
                </tr>
                <tr>
                  <td>Vienna → Salzburg transfer</td>
                  <td>€595</td>
                </tr>
                <tr>
                  <td>Vienna sightseeing tour</td>
                  <td>€208</td>
                </tr>
                <tr>
                  <td>Bratislava day trip</td>
                  <td>€208</td>
                </tr>
                <tr>
                  <td>Wachau Valley day trip</td>
                  <td>€416</td>
                </tr>
                <tr>
                  <td>Hallstatt day trip</td>
                  <td>€595</td>
                </tr>
                <tr>
                  <td>Salzburg day trip</td>
                  <td>€595</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="note">
            Prices include tolls, waiting time and flight monitoring. Last updated: October 2026.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SEO FREQUENTLY ASKED QUESTIONS SECTION
          ========================================================================= */}
      <section className="seo">
        <div className="sk">
          <h2>Frequently asked questions</h2>
          <details>
            <summary>How much does a private chauffeur in Vienna cost?</summary>
            <p>
              Hourly chauffeur hire starts at €52 per hour in a Mercedes-Benz E-Class. Transfers are
              priced by distance, with a minimum of €55, and the fixed price is shown before you
              book.
            </p>
          </details>
          <details>
            <summary>Is the price fixed?</summary>
            <p>
              Yes. The total is shown before you confirm. Tolls, waiting time and flight monitoring
              are included.
            </p>
          </details>
          <details>
            <summary>Which cars can I book?</summary>
            <p>
              You can choose the Mercedes-Benz E-Class (Business Class), S-Class (First Class), EQS
              (electric) or V-Class (up to 7 passengers).
            </p>
          </details>
          <details>
            <summary>What happens if my flight is delayed?</summary>
            <p>
              We monitor your flight. Add your flight number when booking and your chauffeur adjusts
              the pickup time at no extra cost.
            </p>
          </details>
          <details>
            <summary>Can I book child seats?</summary>
            <p>
              Yes. Infant, toddler and booster seats can be fitted in advance. Select the number of
              child seats in step 3 of the booking.
            </p>
          </details>
          <details>
            <summary>Can I cancel my booking?</summary>
            <p>Yes. Cancellation is free up to 24 hours before pickup.</p>
          </details>
          <details>
            <summary>Which day trips do you offer from Vienna?</summary>
            <p>
              Hallstatt, Salzburg, the Wachau Valley, Bratislava, Budapest, Prague and a Vienna
              sightseeing tour.
            </p>
          </details>
        </div>
      </section>

      {/* =========================================================================
          SEO REVIEWS SECTION
          ========================================================================= */}
      <section className="seo">
        <h2>Trusted by international travelers</h2>
        <div className="rev">
          <figure>
            <blockquote>
              An excellent trip with a very comfortable ride. The driver suggested several places
              that made our journey easier. Their prices were also very reasonable. Highly
              recommended
            </blockquote>
            <b>Zainab Saqer</b>
            <span>Posted on Google</span>
          </figure>
          <figure>
            <blockquote>Fantastic and smooth and punctual Harmeet was the best</blockquote>
            <b>Gurj Singh</b>
            <span>Posted on Google</span>
          </figure>
          <figure>
            <blockquote>Great service</blockquote>
            <b>Ofer Sharir</b>
            <span>Posted on Google</span>
          </figure>
        </div>
        <p className="note">
          <a
            href="https://www.google.com/maps/place/Vienna+Day+Trip"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read all Google reviews &rarr;
          </a>{' '}
          &middot; Official Partner of the Vienna Chamber of Commerce (WKO)
        </p>
      </section>

      {/* =========================================================================
          SEO POPULAR SERVICES LINKS
          ========================================================================= */}
      <section className="seo">
        <h2>Popular chauffeur services</h2>
        <div className="lk">
          <Link to="/airport-transfer-vienna/">Vienna airport pick &amp; drop-off</Link>
          <Link to="/hourly-chauffeur-service/">Hourly chauffeur service</Link>
          <Link to="/vienna-sightseeing-tour/">Vienna sightseeing tour</Link>
          <Link to="/hallstatt-day-trip-from-vienna/">Hallstatt day trip</Link>
          <Link to="/salzburg-day-trip/">Salzburg day trip</Link>
          <Link to="/wachau-valley-trip/">Wachau Valley trip</Link>
          <Link to="/budapest-day-trip/">Budapest day trip</Link>
          <Link to="/prague-day-trip/">Prague day trip</Link>
          <Link to="/bratislava-day-trip/">Bratislava day trip</Link>
          <Link to="/customized-day-trips/">Customized day trips</Link>
          <Link to="/our-fleet/">Our Mercedes fleet</Link>
          <Link to="/b2b-solutions/">B2B solutions</Link>
        </div>
      </section>

      {/* =========================================================================
          TRUST BADGES SECTION
          ========================================================================= */}
      <section className="trust">
        <div>
          <h3>Fixed Pricing</h3>
          <p>Tolls, waiting time and flight monitoring included.</p>
        </div>
        <div>
          <h3>Licensed &amp; Insured</h3>
          <p>Background-checked Vienna chauffeurs.</p>
        </div>
        <div>
          <h3>Child Seats</h3>
          <p>Pre-fitted infant, toddler and booster seats.</p>
        </div>
        <div>
          <h3>Free Wi-Fi &amp; Water</h3>
          <p>Onboard Wi-Fi, mineral water and chargers.</p>
        </div>
      </section>

      {/* =========================================================================
          STRIPE TEST MODE SIMULATION MODAL
          ========================================================================= */}
      {simulatedCheckoutData && (
        <div className="vdt-stripe-modal-overlay" onClick={() => setSimulatedCheckoutData(null)}>
          <div className="vdt-stripe-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vdt-stripe-header">
              <span className="vdt-stripe-tag">STRIPE TEST MODE CHECKOUT</span>
              <h3>Vienna Day Trip Luxury Chauffeur</h3>
              <p>Booking Reference: <b>{simulatedCheckoutData.bookingReference}</b></p>
            </div>

            <div className="vdt-stripe-body">
              <div className="vdt-stripe-row">
                <span>Journey</span>
                <b>{pu} ➔ {dr || (mode === 'hourly' ? 'Vienna (As Directed)' : 'Day Trip')}</b>
              </div>
              <div className="vdt-stripe-row">
                <span>Vehicle &amp; Date</span>
                <b>{car.name} • {d} at {t}</b>
              </div>
              <div className="vdt-stripe-row total">
                <span>Total Payable (EUR)</span>
                <em>€{Number(simulatedCheckoutData.amount).toFixed(2)}</em>
              </div>

              <div className="vdt-stripe-badge-box">
                <p>
                  🔒 <b>Secure Hosted Checkout (Test Mode)</b><br />
                  This interactive session simulates Stripe’s server-side hosted checkout and signed webhook confirmation for local test verification.
                </p>
              </div>

              <div className="vdt-stripe-actions">
                <button
                  type="button"
                  className="vdt-stripe-pay-btn"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const confirmRes = await simulatePaymentSuccess({
                        bookingId: simulatedCheckoutData.bookingId,
                        sessionId: simulatedCheckoutData.sessionId
                      });
                      setIsSubmitting(false);
                      setSimulatedCheckoutData(null);

                      if (confirmRes.success) {
                        setDoneResult({
                          success: true,
                          reference: simulatedCheckoutData.bookingReference,
                          pay: {
                            stripeSessionId: simulatedCheckoutData.sessionId,
                            paymentIntentId: confirmRes.paymentMeta?.paymentIntentId,
                            amount: simulatedCheckoutData.amount,
                            currency: 'EUR'
                          },
                          summaryText: `Vienna Day Trip Booking - ${simulatedCheckoutData.bookingReference} (PAID via Stripe)`
                        });
                        setTimeout(() => {
                          document.getElementById('done')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      } else {
                        alert(confirmRes.error || 'Payment simulation failed.');
                      }
                    } catch (err) {
                      setIsSubmitting(false);
                      alert('Could not complete simulated payment.');
                    }
                  }}
                >
                  {isSubmitting ? 'Verifying with Stripe Webhook...' : `PAY €${Number(simulatedCheckoutData.amount).toFixed(2)} WITH STRIPE`}
                </button>

                <button
                  type="button"
                  className="vdt-stripe-cancel-btn"
                  onClick={() => {
                    setSimulatedCheckoutData(null);
                    setAlertState({
                      bad: true,
                      text: 'Your Stripe payment was cancelled. Your booking details and selections have been preserved. You can try again or choose "Request only".'
                    });
                    document.getElementById('al')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  Cancel &amp; Return to Booking Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
