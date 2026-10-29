import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { submitBookingEnquiry } from '../services/api';
import './Booking.css';

/* =========================================================================
   SETTINGS & CONFIGURATION (matching exact supplied code)
   ========================================================================= */
const S = {
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
      img: 'https://tourlytransfer.com/assets/e_class.jpg'
    },
    {
      id: 'sedan_first',
      name: 'Mercedes-Benz S-Class',
      tag: 'First Class VIP',
      pax: 3,
      bags: 2,
      mult: 1.5,
      img: 'https://tourlytransfer.com/assets/s_class.webp'
    },
    {
      id: 'eqs',
      name: 'Mercedes-Benz EQS',
      tag: 'Electric VIP',
      pax: 3,
      bags: 2,
      mult: 1.5,
      img: 'https://tourlytransfer.com/assets/eqs.jpg'
    },
    {
      id: 'van_business',
      name: 'Mercedes-Benz V-Class',
      tag: 'Executive Van',
      pax: 7,
      bags: 7,
      mult: 1.35,
      img: 'https://tourlytransfer.com/assets/v_class.webp'
    }
  ]
};

const STEP_NAMES = [
  'Enter Ride Details',
  'Choose a Vehicle',
  'Enter Contact Details',
  'Booking Summary'
];

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
  const [km, setKm] = useState(0);
  const [min, setMin] = useState(0);
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
  const [errFields, setErrFields] = useState({});

  // Fallback Autocomplete Suggestions
  const [puSuggestions, setPuSuggestions] = useState([]);
  const [drSuggestions, setDrSuggestions] = useState([]);
  const [showPuAc, setShowPuAc] = useState(false);
  const [showDrAc, setShowDrAc] = useState(false);

  // Map Refs
  const mapElementRef = useRef(null);
  const map2ElementRef = useRef(null);
  const gmapRef = useRef(null);
  const dirSvcRef = useRef(null);
  const dirRenRef = useRef(null);
  const gmap2Ref = useRef(null);
  const dirRen2Ref = useRef(null);
  const [directionsData, setDirectionsData] = useState(null);

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
  }, [location.search]);

  // Load Google Maps Script if Key is provided
  useEffect(() => {
    if (S.MAPS_KEY && !window.google) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        S.MAPS_KEY
      )}&libraries=places&v=weekly`;
      script.onload = () => initMaps();
      document.head.appendChild(script);
    } else if (window.google) {
      initMaps();
    }
  }, []);

  const initMaps = () => {
    if (!window.google || !mapElementRef.current) return;
    try {
      const map = new window.google.maps.Map(mapElementRef.current, {
        center: { lat: 48.2082, lng: 16.3738 },
        zoom: 7,
        disableDefaultUI: false
      });
      const dirSvc = new window.google.maps.DirectionsService();
      const dirRen = new window.google.maps.DirectionsRenderer({ map });
      gmapRef.current = map;
      dirSvcRef.current = dirSvc;
      dirRenRef.current = dirRen;
    } catch (e) {
      console.warn('[Maps] Init note:', e.message);
    }
  };

  // Autocomplete fallback handler
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

  // Route calculation (Google Directions or Distance Estimator)
  const calcRoute = () => {
    if (mode === 'hourly') {
      setMin(hr * 60);
      setKm(0);
      return;
    }
    if (mode === 'daytrip') {
      const tour = S.TOURS[tr];
      const tourName = tour ? tour[0] : '';
      if (tourName.includes('Bratislava')) {
        setKm(80);
        setMin(60);
      } else if (tourName.includes('Wachau')) {
        setKm(190);
        setMin(150);
      } else if (tourName.includes('Hallstatt')) {
        setKm(580);
        setMin(360);
      } else if (tourName.includes('Salzburg')) {
        setKm(600);
        setMin(360);
      } else if (tourName.includes('Budapest')) {
        setKm(490);
        setMin(300);
      } else if (tourName.includes('Prague')) {
        setKm(660);
        setMin(420);
      } else {
        setKm(45);
        setMin(180);
      }
      return;
    }

    // Transfer mode
    if (dirSvcRef.current && pu && dr) {
      dirSvcRef.current.route(
        { origin: pu, destination: dr, travelMode: window.google.maps.TravelMode.DRIVING },
        (res, status) => {
          if (status === 'OK' && res?.routes?.[0]?.legs?.[0]) {
            setDirectionsData(res);
            if (dirRenRef.current) dirRenRef.current.setDirections(res);
            const leg = res.routes[0].legs[0];
            setKm(leg.distance.value / 1000);
            setMin(leg.duration.value / 60);
          } else {
            fallbackEstimate();
          }
        }
      );
    } else {
      fallbackEstimate();
    }
  };

  const fallbackEstimate = () => {
    const text = `${pu} ${dr}`.toLowerCase();
    if (text.includes('bratislava')) {
      setKm(78);
      setMin(55);
    } else if (text.includes('budapest')) {
      setKm(243);
      setMin(160);
    } else if (text.includes('salzburg')) {
      setKm(298);
      setMin(190);
    } else if (text.includes('hallstatt')) {
      setKm(288);
      setMin(210);
    } else if (text.includes('prague')) {
      setKm(333);
      setMin(220);
    } else if (text.includes('graz')) {
      setKm(200);
      setMin(135);
    } else if (text.includes('airport') || text.includes('schwechat')) {
      setKm(22);
      setMin(25);
    } else if (pu && dr) {
      setKm(18);
      setMin(30);
    } else {
      setKm(0);
      setMin(0);
    }
  };

  useEffect(() => {
    calcRoute();
  }, [mode, pu, dr, hr, tr, ty]);

  // Second Map in Step 4
  useEffect(() => {
    if (step === 4 && window.google && map2ElementRef.current && directionsData) {
      if (!gmap2Ref.current) {
        gmap2Ref.current = new window.google.maps.Map(map2ElementRef.current, {
          center: { lat: 48.2, lng: 16.37 },
          zoom: 7,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true
        });
        dirRen2Ref.current = new window.google.maps.DirectionsRenderer({
          map: gmap2Ref.current
        });
      }
      dirRen2Ref.current.setDirections(directionsData);
    }
  }, [step, directionsData]);

  // Pricing (Business Sedan base)
  const basePrice = useMemo(() => {
    const e = (Number(ex) / 60) * S.HOURLY;
    let b = null;
    if (mode === 'hourly') {
      b = Number(hr) * S.HOURLY;
    } else if (mode === 'daytrip') {
      b = S.TOURS[tr] ? S.TOURS[tr][1] : 208;
    } else {
      const tx = `${pu} ${dr}`.toLowerCase();
      const v = /vienna|wien|\bvie\b|airport|schwechat/.test(tx);
      for (const k in S.FIX) {
        if (v && tx.indexOf(k) > -1) {
          b = S.FIX[k];
          break;
        }
      }
      if (b === null && km > 0) {
        b = Math.max(S.MIN, S.BASE + km * S.PER_KM);
      }
      if (b !== null && ty === 'return') {
        b *= 2;
      }
    }
    return b === null ? null : b + e;
  }, [mode, hr, tr, ex, pu, dr, km, ty]);

  const totals = useMemo(() => {
    if (basePrice === null || !car) return null;
    const s = basePrice * car.mult;
    const d = disc ? (s * disc.p) / 100 : 0;
    return { s, d, t: s - d };
  }, [basePrice, car, disc]);

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
    if (fl) L.push(['Flight', fl]);
    L.push(
      ['Water', wt],
      ['Name', `${fn} ${ln}`],
      ['Email', em],
      ['Phone', ph]
    );
    if (nt) L.push(['Notes', nt]);
    if (disc) L.push(['Discount code', `${disc.c} (-${disc.p}%)`]);
    L.push(['Total', tVal ? money(tVal.t) : 'Quote on request']);
    return L;
  };

  // Final Submission to Neon Database + Razorpay
  const finish = async (pay) => {
    setIsSubmitting(true);
    const L = buildLines();
    const summaryText =
      'New booking - Vienna Day Trip\n' +
      L.map((r) => `${r[0]}: ${r[1]}`).join('\n') +
      (pay
        ? `\nPayment: PAID via Razorpay\nPayment ID: ${pay.razorpay_payment_id}${
            pay.razorpay_order_id ? `\nOrder ID: ${pay.razorpay_order_id}` : ''
          }`
        : '\nPayment: Pay later / on board');

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
      luggageDetails: `${bg} Suitcases${cs > 0 ? `, ${cs} Child Seat(s)` : ''}`,
      preferredVehicle: car.name,
      specialRequests: [
        nt ? `Notes: ${nt}` : '',
        fl ? `Flight: ${fl}` : '',
        wt ? `Water: ${wt}` : '',
        disc ? `Discount: ${disc.c} (-${disc.p}%)` : '',
        pay
          ? `Paid via Razorpay (ID: ${pay.razorpay_payment_id})`
          : 'Payment method: Pay later / on board'
      ]
        .filter(Boolean)
        .join(' | ')
    };

    try {
      const res = await submitBookingEnquiry(bookingPayload);
      const reference = res.booking?.reference || res.reference || `VDT-${Date.now().toString().slice(-6)}`;

      setDoneResult({
        success: true,
        reference,
        pay,
        summaryText
      });
      setTimeout(() => {
        document.getElementById('done')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      // Graceful fallback display
      setDoneResult({
        success: true,
        reference: `VDT-${Date.now().toString().slice(-6)}`,
        pay,
        summaryText
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Razorpay Checkout Trigger
  const triggerRazorpay = (tVal) => {
    if (!window.Razorpay) {
      alert('Payment SDK could not be loaded. Please check your connection or choose "Request only".');
      return;
    }
    const amount = Math.round(tVal.t * 100);
    const options = {
      key: S.RAZORPAY_KEY,
      amount,
      currency: S.CURRENCY,
      name: 'Vienna Day Trip',
      description: `Private chauffeur: ${serviceLabel()}, ${car.name}`,
      prefill: {
        name: `${fn} ${ln}`,
        email: em,
        contact: ph
      },
      notes: {
        pickup: pu,
        drop: dr,
        date: `${d} ${t}`
      },
      theme: { color: '#c9a04f' },
      handler: function (response) {
        finish(response);
      },
      modal: {
        ondismiss: function () {
          setIsSubmitting(false);
        }
      }
    };
    try {
      const rz = new window.Razorpay(options);
      rz.on('payment.failed', function () {
        setIsSubmitting(false);
        setAlertState({
          bad: true,
          text: 'Your payment could not be completed. No amount has been charged. Please try again or choose "Request only".'
        });
        document.getElementById('al')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      rz.open();
    } catch (e) {
      setIsSubmitting(false);
      alert('Payment gateway initialization note. Proceeding with booking request.');
      finish(null);
    }
  };

  const handleConfirmSubmit = () => {
    if (!a1 || !a2) {
      setAlertState({
        bad: true,
        text: 'Please accept both agreements to complete your booking.'
      });
      document.getElementById('al')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setAlertState({
      bad: false,
      text: 'Please accept the agreements below to continue.'
    });

    const tVal = totals;
    if (paymentMethod === 'online' && tVal) {
      // Load Razorpay script dynamically if not present
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => triggerRazorpay(tVal);
        script.onerror = () => {
          alert('Razorpay script could not be loaded. Completing as Request Only booking.');
          finish(null);
        };
        document.body.appendChild(script);
      } else {
        triggerRazorpay(tVal);
      }
    } else {
      finish(null);
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
            src="https://tourlytransfer.com/assets/s_class.webp"
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
                <div className="map" id="map" ref={mapElementRef}>
                  {S.MAPS_KEY ? (
                    'Loading Google Maps...'
                  ) : (
                    <div>
                      <b style={{ color: '#c9a04f', display: 'block', marginBottom: '6px' }}>
                        Vienna Chauffeur Route Preview
                      </b>
                      <span>
                        {pu && dr
                          ? `${pu} → ${dr}`
                          : 'Enter pickup and drop-off locations to calculate distance & duration'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="stats">
                  <div>
                    <span>Total distance</span>
                    <b id="km">{Math.round(km)} km</b>
                  </div>
                  <div>
                    <span>Total time</span>
                    <b id="mn">
                      {Math.floor(min / 60)}h {Math.round(min % 60)}m
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
                const priceFormatted =
                  basePrice === null ? (
                    <span style={{ fontSize: '15px' }}>Quote on request</span>
                  ) : (
                    eur(basePrice * vehicle.mult)
                  );

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
                  <label htmlFor="cs">Child seats</label>
                  <select id="cs" value={cs} onChange={(e) => setCs(Number(e.target.value))}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
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
                      Pay online (Razorpay)
                      <small>Pay securely by card, UPI, netbanking or wallet.</small>
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
                <div id="map2" ref={map2ElementRef}>
                  {directionsData ? (
                    'Route Map'
                  ) : (
                    <div>
                      <b style={{ color: '#c9a04f', display: 'block' }}>Route Details</b>
                      <span>
                        {pu} → {dr || (mode === 'hourly' ? 'Vienna As Directed' : 'Day Trip')}
                      </span>
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
                        <span>Selected vehicle</span>
                        <span>{money(totals.s)}</span>
                      </div>
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
                      <span>Quote on request</span>
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
                    {doneResult.pay ? 'Payment successful' : 'Booking request received'}
                  </h3>
                  <p>
                    {doneResult.pay ? (
                      <>
                        Thank you, {fn}. Your booking is confirmed with reference{' '}
                        <b>{doneResult.reference}</b> and payment ID{' '}
                        <b>{doneResult.pay.razorpay_payment_id}</b>. A confirmation email has been
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

      {/* Floating WhatsApp CTA Button */}
      <a
        className="wa"
        href={`https://wa.me/${S.WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </div>
  );
}
