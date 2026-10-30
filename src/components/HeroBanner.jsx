import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Car,
  Plane,
  ArrowRight,
  ShieldCheck,
  Gem,
  Compass,
  Lock,
  ChevronDown,
  HelpCircle,
  Check
} from 'lucide-react';
import VehicleModal from './VehicleModal';
import { useLanguage } from '../context/LanguageContext';
import { submitBookingEnquiry } from '../services/api';

/* 
  MERCEDES-BENZ FLEET DATA FOR HERO CAROUSEL
  Calibrated scale, bottom offset, and ground shadow geometry for each vehicle
  to eliminate floating and ensure each vehicle is realistically grounded on the cobblestones.
*/
const HERO_VEHICLES = [
  {
    id: 's-class',
    fleetId: 's-class',
    bookingValue: 'Mercedes S-Class',
    name: 'Mercedes-Benz S-Class',
    badge: 'First Class Limousine',
    image: '/cars/hero-s-class-car.webp',
    fallback: '/cars/hero-s-class-car.png',
    alt: 'Mercedes-Benz S-Class luxury sedan with professional chauffeur in Vienna',
    scale: 1.05,
    offsetY: '0px',
    offsetX: '15px',
    chauffeurHeight: '74%',
    chauffeurRight: '27.5%',
    chauffeurBottom: '0px',
    shadowWidth: '92%',
    shadowLeft: '4%',
    passengers: '3 Guests',
    luggage: '2 Large Bags',
    ride: 'AIRMATIC Suspension',
    description: 'The Mercedes S-Class represents the highest level of luxury in our fleet. Every detail is designed to provide a first-class travel experience—from its ultra-quiet cabin to its cutting-edge technology.',
    features: [
      'Whisper-quiet acoustic insulation & double glazing',
      'Rear reclining executive seats with massage function',
      'Burmester® 3D surround sound system',
      'Chilled refreshment compartment & evian water'
    ]
  },
  {
    id: 'e-class',
    fleetId: 'e-class',
    bookingValue: 'Mercedes E-Class',
    name: 'Mercedes-Benz E-Class',
    badge: 'Business Class Sedan',
    image: '/cars/hero-e-class-car.webp',
    fallback: '/cars/hero-e-class-car.png',
    alt: 'Mercedes-Benz E-Class executive sedan with professional chauffeur in Vienna',
    scale: 1.05,
    offsetY: '0px',
    offsetX: '15px',
    chauffeurHeight: '72%',
    chauffeurRight: '29.5%',
    chauffeurBottom: '0px',
    shadowWidth: '92%',
    shadowLeft: '4%',
    passengers: '3 Guests',
    luggage: '2 Large Bags',
    ride: '9G-TRONIC Transmission',
    description: 'The Mercedes E-Class is where sophistication meets everyday practicality. Designed for comfort and efficiency, it offers a smooth and quiet ride, suited to both business and private transfers.',
    features: [
      'Refined acoustic glass and ultra-quiet cabin',
      'Executive leather seating with heating',
      'Complimentary high-speed onboard Wi-Fi',
      'Dual-zone climate control & mineral water'
    ]
  },
  {
    id: 'v-class',
    fleetId: 'v-class',
    bookingValue: 'Mercedes V-Class',
    name: 'Mercedes-Benz V-Class',
    badge: 'VIP Business Van',
    image: '/cars/hero-v-class-car.webp',
    fallback: '/cars/hero-v-class-car.png',
    alt: 'Mercedes-Benz V-Class VIP luxury van with professional chauffeur in Vienna',
    scale: 1.02,
    offsetY: '0px',
    offsetX: '10px',
    chauffeurHeight: '66%',
    chauffeurRight: '27.5%',
    chauffeurBottom: '0px',
    shadowWidth: '92%',
    shadowLeft: '4%',
    passengers: '7 Guests',
    luggage: '7 Large Bags',
    ride: 'Agility Control Suspension',
    description: 'The Mercedes V-Class defines executive MPV travel. Accommodating up to 7 passengers with generous luggage capacity, its face-to-face conference seating creates a mobile executive suite.',
    features: [
      'Conference face-to-face seating arrangement',
      'Individual reading lights & USB-C fast charging',
      'Dual electric sliding doors for easy entry',
      'Deep tinted rear privacy glass'
    ]
  },
  {
    id: 'sprinter',
    fleetId: 'sprinter',
    bookingValue: 'Mercedes Sprinter VIP',
    name: 'Mercedes-Benz Sprinter VIP',
    badge: 'VIP Executive Minibus',
    image: '/cars/hero-sprinter-car.webp',
    fallback: '/cars/hero-sprinter-car.png',
    alt: 'Mercedes-Benz Sprinter VIP luxury minibus with professional chauffeur in Vienna',
    scale: 1.0,
    offsetY: '0px',
    offsetX: '5px',
    chauffeurHeight: '62%',
    chauffeurRight: '25.5%',
    chauffeurBottom: '0px',
    shadowWidth: '94%',
    shadowLeft: '3%',
    passengers: '8+ Guests',
    luggage: '12+ Large Bags',
    ride: 'Heavy Duty Air Suspension',
    description: 'For corporate delegations, VIP delegations, and extended family travel, the Sprinter VIP offers unmatched headroom, bespoke leather captains chairs, and expansive storage capacity.',
    features: [
      'Standing headroom with wide central aisle',
      'Custom handcrafted diamond-quilted leather seats',
      'Overhead ambient LED starlight ceiling illumination',
      'High-capacity separate rear luggage compartment'
    ]
  }
];

export default function HeroBanner() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Helper date & formatting utilities
  const p2 = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;

  const defaultTimeStr = useMemo(() => {
    const t0 = new Date(now);
    t0.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
    return `${p2(t0.getHours())}:${p2(t0.getMinutes())}`;
  }, []);

  // Carousel State
  const [currentCarIdx, setCurrentCarIdx] = useState(0);
  const [prevCarIdx, setPrevCarIdx] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isHovered, setIsHovered] = useState(false);
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  // Reference-Matched Booking Form State: TRANSFER | HOURLY | DAY TRIP
  const [activeTab, setActiveTab] = useState('transfer'); // 'transfer' | 'hourly' | 'daytrip'
  const [formData, setFormData] = useState({
    date: todayStr,
    time: defaultTimeStr,
    pickup: '',
    dropoff: '',
    transferType: 'One Way',
    extraTime: '0 minute(s)',
    duration: '2 hours',
    route: 'Vienna Sightseeing Tour',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // Modal showcase state (for vehicle inspection if clicked)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCarIdx, setModalCarIdx] = useState(0);

  // Preload all 4 vehicle images immediately
  useEffect(() => {
    HERO_VEHICLES.forEach((v) => {
      const img = new Image();
      img.src = v.image;
    });
  }, []);

  // Monitor tab visibility
  useEffect(() => {
    const handleVisibility = () => setIsTabActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 5-Second Automatic Carousel
  useEffect(() => {
    if (isHovered || isModalOpen || !isTabActive) return;

    const interval = setInterval(() => {
      setSlideDirection('next');
      setPrevCarIdx(currentCarIdx);
      setCurrentCarIdx((prev) => (prev + 1) % HERO_VEHICLES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentCarIdx, isHovered, isModalOpen, isTabActive, timerResetKey]);

  // Clean up previous vehicle after transition (550ms)
  useEffect(() => {
    if (prevCarIdx !== null) {
      const timer = setTimeout(() => setPrevCarIdx(null), 550);
      return () => clearTimeout(timer);
    }
  }, [prevCarIdx]);

  const handleNextCar = () => {
    setSlideDirection('next');
    setPrevCarIdx(currentCarIdx);
    setCurrentCarIdx((prev) => (prev + 1) % HERO_VEHICLES.length);
    setTimerResetKey((k) => k + 1);
  };

  const handlePrevCar = () => {
    setSlideDirection('prev');
    setPrevCarIdx(currentCarIdx);
    setCurrentCarIdx((prev) => (prev - 1 + HERO_VEHICLES.length) % HERO_VEHICLES.length);
    setTimerResetKey((k) => k + 1);
  };

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errorMsg) setErrorMsg('');
  };

  // Popular locations for quick suggestion
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

  /**
   * REQUIREMENT 3: GET A QUOTE REDIRECT
   * Validates required fields, builds query parameters, and redirects to /booking.
   */
  const handleGetQuote = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!formData.date) {
      setErrorMsg('Please select a pickup date.');
      return;
    }
    if (!formData.time) {
      setErrorMsg('Please select a pickup time.');
      return;
    }
    if (!formData.pickup || !formData.pickup.trim()) {
      setErrorMsg('Please enter a pickup location.');
      return;
    }
    if (activeTab === 'transfer' && (!formData.dropoff || !formData.dropoff.trim())) {
      setErrorMsg('Please enter a drop-off location.');
      return;
    }

    const params = new URLSearchParams();
    params.set('service', activeTab);
    params.set('date', formData.date);
    params.set('time', formData.time);
    params.set('pickup', formData.pickup.trim());

    if (activeTab === 'transfer') {
      params.set('dropoff', formData.dropoff.trim());
      params.set('type', formData.transferType === 'Return' ? 'return' : 'oneway');
      const extraNum = parseInt(formData.extraTime, 10) || 0;
      if (extraNum > 0) params.set('extra', extraNum);
    } else if (activeTab === 'hourly') {
      const hoursNum = parseInt(formData.duration, 10) || 2;
      params.set('hours', hoursNum);
      if (formData.dropoff && formData.dropoff.trim()) {
        params.set('dropoff', formData.dropoff.trim());
      }
    } else if (activeTab === 'daytrip') {
      params.set('tour', formData.route);
      const extraNum = parseInt(formData.extraTime, 10) || 0;
      if (extraNum > 0) params.set('extra', extraNum);
    }

    // Pass preferred vehicle
    params.set('vehicle', HERO_VEHICLES[currentCarIdx].id);

    // Asynchronously log inquiry in background
    submitBookingEnquiry({
      customerName: 'Website Guest',
      email: 'quote-lead@viennadaytrip.com',
      serviceType: activeTab === 'transfer' ? 'Transfer' : activeTab === 'hourly' ? 'Hourly Chauffeur' : 'Day Trip',
      pickupLocation: formData.pickup,
      dropoffLocation: formData.dropoff || formData.route,
      pickupDate: formData.date,
      pickupTime: formData.time,
      passengerCount: '1-3 Passengers',
      preferredVehicle: HERO_VEHICLES[currentCarIdx].name
    }).catch(() => {});

    // Redirect to /booking with prefilled values
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div className="hero-master-wrapper">
      {/* =============================================================
          1. HERO ROUNDED LUXURY BANNER
          - Fixed background positioning (showcases chauffeur + Mercedes on right)
          - Left text constrained to 600px with subtle cream gradient backdrop
          ============================================================= */}
      <div
        className="hero-rounded-banner"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const touchEnd = e.changedTouches[0].clientX;
          const diff = touchStart - touchEnd;
          if (diff > 40) handleNextCar();
          if (diff < -40) handlePrevCar();
          setTouchStart(null);
        }}
      >
        {/* Layer 1: Static Vienna Palace Backdrop */}
        <div className="hero-palace-stage" aria-hidden="true">
          <picture>
            <source srcSet="/images/backimage.webp" type="image/webp" />
            <img
              src="/images/backimage.png"
              alt="Vienna Chauffeur Service Mercedes-Benz S-Class at Hofburg Palace"
              className="hero-palace-img"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </picture>
          <div className="hero-palace-sheen" />
          <div className="hero-palace-gradient" />
        </div>

        {/* Layer 2: Main Hero Content (Left Side Text with Cream Gradient Card) */}
        <div className="hero-content-stage">
          <div className="hero-left-col">
            <div className="hero-text-cream-backdrop">
              {/* Small Top Label */}
              <div className="hero-eyebrow-container">
                <span className="hero-eyebrow-text">{t('hero_small_label')}</span>
                <span className="hero-eyebrow-line" />
              </div>

              {/* Playfair Display Main Heading (H1) */}
              <h1 className="hero-heading">
                Your Private Chauffeur in{' '}
                <span className="hero-heading-gold-italic">
                  Vienna &amp; Beyond
                </span>
              </h1>

              {/* Semantic Subtitle (H2) */}
              <h2 className="hero-subtitle">
                Luxury Transfers &amp; Private Day Trips
              </h2>

              {/* Description */}
              <p className="hero-description">
                {t('hero_desc')}
              </p>

              {/* 5 Service Highlights */}
              <div className="hero-highlights-wrap">
                <div className="hero-highlight-item">
                  <span className="hero-gold-checkmark">✓</span>
                  <span className="hero-highlight-label">{t('hero_hl_licensed')}</span>
                </div>
                <div className="hero-highlight-item">
                  <span className="hero-gold-checkmark">✓</span>
                  <span className="hero-highlight-label">{t('hero_hl_pricing')}</span>
                </div>
                <div className="hero-highlight-item">
                  <span className="hero-gold-checkmark">✓</span>
                  <span className="hero-highlight-label">{t('hero_hl_fleet')}</span>
                </div>
                <div className="hero-highlight-item">
                  <span className="hero-gold-checkmark">✓</span>
                  <span className="hero-highlight-label">{t('hero_hl_flight')}</span>
                </div>
                <div className="hero-highlight-item">
                  <span className="hero-gold-checkmark">✓</span>
                  <span className="hero-highlight-label">{t('hero_hl_child_seats')}</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="hero-cta-wrapper">
                <Link to="/our-fleet/" className="hero-cta-btn">
                  <span>{t('hero_cta_fleet')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3: Grounded Mercedes Fleet Carousel Stage (Bottom-Right of Hero) */}
        <div
          className="hero-vehicle-carousel-stage"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="hero-vehicle-viewport">
            {HERO_VEHICLES.map((vehicle, index) => {
              const isCurrent = index === currentCarIdx;
              const isPrev = index === prevCarIdx;
              if (!isCurrent && !isPrev) return null;

              return (
                <div
                  key={vehicle.id}
                  className={`hero-vehicle-slide ${isCurrent ? 'active' : 'exiting'} slide-dir-${slideDirection}`}
                  style={{
                    '--car-scale': vehicle.scale || 1.0,
                    '--car-offset-y': vehicle.offsetY || '0px',
                    '--car-offset-x': vehicle.offsetX || '0px',
                    '--chauffeur-h': vehicle.chauffeurHeight || '74%',
                    '--chauffeur-r': vehicle.chauffeurRight || '27.5%',
                    '--chauffeur-b': vehicle.chauffeurBottom || '0px'
                  }}
                >
                  <picture className="hero-car-picture">
                    <source srcSet={vehicle.image} type="image/webp" />
                    <img
                      src={vehicle.fallback}
                      alt={vehicle.alt}
                      className="hero-car-image"
                      loading="eager"
                      decoding="async"
                    />
                  </picture>

                  <div className="hero-chauffeur-wrapper">
                    <picture className="hero-chauffeur-picture">
                      <source srcSet="/images/hero-chauffeur-cutout.webp" type="image/webp" />
                      <img
                        src="/images/hero-chauffeur-cutout.png"
                        alt="Professional Vienna Chauffeur"
                        className="hero-chauffeur-img"
                        loading="eager"
                        decoding="async"
                      />
                    </picture>
                    <div className="hero-chauffeur-shadow" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =============================================================
          2. REFERENCE-MATCHED LUXURY BOOKING PANEL
          - Three Tabs: TRANSFER | HOURLY | DAY TRIP
          - Exact 2-row clean white segmented box
          - Upper Row: Pickup Date, Pickup Time, Pickup Location
          - Lower Row: Drop-off Location, Transfer Type, Extra Time
          - GET A QUOTE button (redirects with auto-prefilled params)
          ============================================================= */}
      <div className="hero-booking-panel-container">
        <div id="hero-booking-card" className="vdt-ref-booking-wrapper">
          {/* Tabs on Top of Form */}
          <div className="vdt-ref-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'transfer'}
              onClick={() => { setActiveTab('transfer'); setErrorMsg(''); }}
              className={`vdt-ref-tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
            >
              TRANSFER
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'hourly'}
              onClick={() => { setActiveTab('hourly'); setErrorMsg(''); }}
              className={`vdt-ref-tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
            >
              HOURLY
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'daytrip'}
              onClick={() => { setActiveTab('daytrip'); setErrorMsg(''); }}
              className={`vdt-ref-tab-btn ${activeTab === 'daytrip' ? 'active' : ''}`}
            >
              DAY TRIP
            </button>
          </div>

          {/* Form Box */}
          <form onSubmit={handleGetQuote} className="vdt-ref-form-card">
            {activeTab === 'transfer' && (
              <>
                {/* Row 1: Pickup Date, Pickup Time, Pickup Location */}
                <div className="vdt-ref-grid-row vdt-ref-grid-3">
                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-pickup-date">
                      <span>PICKUP DATE</span>
                      <span className="vdt-ref-help" title="Departure date">?</span>
                    </label>
                    <input
                      id="hero-pickup-date"
                      type="date"
                      min={todayStr}
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="vdt-ref-cell-input"
                    />
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-pickup-time">
                      <span>PICKUP TIME</span>
                      <span className="vdt-ref-help" title="Desired pickup time">?</span>
                    </label>
                    <input
                      id="hero-pickup-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="vdt-ref-cell-input"
                    />
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-pickup-loc">
                      <span>PICKUP LOCATION</span>
                      <span className="vdt-ref-help" title="Pickup airport, hotel or address">?</span>
                    </label>
                    <input
                      id="hero-pickup-loc"
                      type="text"
                      placeholder="Enter a location"
                      value={formData.pickup}
                      onChange={(e) => handleInputChange('pickup', e.target.value)}
                      onFocus={() => setFocusedField('pickup')}
                      onBlur={() => setTimeout(() => setFocusedField(null), 250)}
                      className="vdt-ref-cell-input"
                      autoComplete="off"
                    />
                    {focusedField === 'pickup' && (
                      <div className="vdt-ref-suggestions-menu">
                        {popularLocations.filter(loc => !formData.pickup || loc.toLowerCase().includes(formData.pickup.toLowerCase())).slice(0, 5).map((loc, i) => (
                          <div
                            key={i}
                            className="vdt-ref-suggestion-item"
                            onMouseDown={() => handleInputChange('pickup', loc)}
                          >
                            <MapPin size={12} className="vdt-ref-suggestion-icon" />
                            <span>{loc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Drop-off Location, Transfer Type, Extra Time */}
                <div className="vdt-ref-grid-row vdt-ref-grid-3">
                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-dropoff-loc">
                      <span>DROP-OFF LOCATION</span>
                      <span className="vdt-ref-help" title="Destination address or city">?</span>
                    </label>
                    <input
                      id="hero-dropoff-loc"
                      type="text"
                      placeholder="Enter a location"
                      value={formData.dropoff}
                      onChange={(e) => handleInputChange('dropoff', e.target.value)}
                      onFocus={() => setFocusedField('dropoff')}
                      onBlur={() => setTimeout(() => setFocusedField(null), 250)}
                      className="vdt-ref-cell-input"
                      autoComplete="off"
                    />
                    {focusedField === 'dropoff' && (
                      <div className="vdt-ref-suggestions-menu">
                        {popularLocations.filter(loc => !formData.dropoff || loc.toLowerCase().includes(formData.dropoff.toLowerCase())).slice(0, 5).map((loc, i) => (
                          <div
                            key={i}
                            className="vdt-ref-suggestion-item"
                            onMouseDown={() => handleInputChange('dropoff', loc)}
                          >
                            <MapPin size={12} className="vdt-ref-suggestion-icon" />
                            <span>{loc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-transfer-type">
                      <span>TRANSFER TYPE</span>
                      <span className="vdt-ref-help" title="Single journey or round trip">?</span>
                    </label>
                    <div className="vdt-ref-select-wrap">
                      <select
                        id="hero-transfer-type"
                        value={formData.transferType}
                        onChange={(e) => handleInputChange('transferType', e.target.value)}
                        className="vdt-ref-cell-select"
                      >
                        <option value="One Way">One Way</option>
                        <option value="Return">Return</option>
                      </select>
                      <ChevronDown size={16} className="vdt-ref-chevron" />
                    </div>
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-extra-time">
                      <span>EXTRA TIME</span>
                      <span className="vdt-ref-help" title="Complimentary or extra waiting time">?</span>
                    </label>
                    <div className="vdt-ref-select-wrap">
                      <select
                        id="hero-extra-time"
                        value={formData.extraTime}
                        onChange={(e) => handleInputChange('extraTime', e.target.value)}
                        className="vdt-ref-cell-select"
                      >
                        <option value="0 minute(s)">0 minute(s)</option>
                        <option value="15 minute(s)">15 minute(s)</option>
                        <option value="30 minute(s)">30 minute(s)</option>
                        <option value="45 minute(s)">45 minute(s)</option>
                        <option value="60 minute(s)">60 minute(s)</option>
                        <option value="90 minute(s)">90 minute(s)</option>
                        <option value="120 minute(s)">120 minute(s)</option>
                      </select>
                      <ChevronDown size={16} className="vdt-ref-chevron" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'hourly' && (
              <>
                {/* Row 1: Pickup Date, Pickup Time, Pickup Location */}
                <div className="vdt-ref-grid-row vdt-ref-grid-3">
                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-hourly-date">
                      <span>PICKUP DATE</span>
                      <span className="vdt-ref-help" title="Service date">?</span>
                    </label>
                    <input
                      id="hero-hourly-date"
                      type="date"
                      min={todayStr}
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="vdt-ref-cell-input"
                    />
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-hourly-time">
                      <span>PICKUP TIME</span>
                      <span className="vdt-ref-help" title="Service start time">?</span>
                    </label>
                    <input
                      id="hero-hourly-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="vdt-ref-cell-input"
                    />
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-hourly-pickup">
                      <span>PICKUP LOCATION</span>
                      <span className="vdt-ref-help" title="Pickup hotel or address">?</span>
                    </label>
                    <input
                      id="hero-hourly-pickup"
                      type="text"
                      placeholder="Enter a location"
                      value={formData.pickup}
                      onChange={(e) => handleInputChange('pickup', e.target.value)}
                      onFocus={() => setFocusedField('pickup')}
                      onBlur={() => setTimeout(() => setFocusedField(null), 250)}
                      className="vdt-ref-cell-input"
                      autoComplete="off"
                    />
                    {focusedField === 'pickup' && (
                      <div className="vdt-ref-suggestions-menu">
                        {popularLocations.filter(loc => !formData.pickup || loc.toLowerCase().includes(formData.pickup.toLowerCase())).slice(0, 5).map((loc, i) => (
                          <div
                            key={i}
                            className="vdt-ref-suggestion-item"
                            onMouseDown={() => handleInputChange('pickup', loc)}
                          >
                            <MapPin size={12} className="vdt-ref-suggestion-icon" />
                            <span>{loc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Duration, Drop-off Location */}
                <div className="vdt-ref-grid-row vdt-ref-grid-hourly-2">
                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-hourly-duration">
                      <span>DURATION (IN HOURS)</span>
                      <span className="vdt-ref-help" title="Total hours of chauffeur disposal">?</span>
                    </label>
                    <div className="vdt-ref-select-wrap">
                      <select
                        id="hero-hourly-duration"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="vdt-ref-cell-select"
                      >
                        <option value="2 hours">2 hours</option>
                        <option value="3 hours">3 hours</option>
                        <option value="4 hours">4 hours</option>
                        <option value="5 hours">5 hours</option>
                        <option value="6 hours">6 hours</option>
                        <option value="8 hours">8 hours</option>
                        <option value="10 hours">10 hours</option>
                        <option value="12 hours">12 hours</option>
                      </select>
                      <ChevronDown size={16} className="vdt-ref-chevron" />
                    </div>
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-hourly-dropoff">
                      <span>DROP-OFF LOCATION</span>
                      <span className="vdt-ref-help" title="Optional final destination">?</span>
                    </label>
                    <input
                      id="hero-hourly-dropoff"
                      type="text"
                      placeholder="Enter a location"
                      value={formData.dropoff}
                      onChange={(e) => handleInputChange('dropoff', e.target.value)}
                      className="vdt-ref-cell-input"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'daytrip' && (
              <>
                {/* Row 1: Pickup Date, Pickup Time, Route, Extra Time */}
                <div className="vdt-ref-grid-row vdt-ref-grid-4">
                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-daytrip-date">
                      <span>PICKUP DATE</span>
                      <span className="vdt-ref-help" title="Departure date">?</span>
                    </label>
                    <input
                      id="hero-daytrip-date"
                      type="date"
                      min={todayStr}
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="vdt-ref-cell-input"
                    />
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-daytrip-time">
                      <span>PICKUP TIME</span>
                      <span className="vdt-ref-help" title="Departure time">?</span>
                    </label>
                    <input
                      id="hero-daytrip-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="vdt-ref-cell-input"
                    />
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-daytrip-route">
                      <span>ROUTE</span>
                      <span className="vdt-ref-help" title="Chosen private day tour">?</span>
                    </label>
                    <div className="vdt-ref-select-wrap">
                      <select
                        id="hero-daytrip-route"
                        value={formData.route}
                        onChange={(e) => handleInputChange('route', e.target.value)}
                        className="vdt-ref-cell-select"
                      >
                        <option value="Vienna Sightseeing Tour">Vienna Sightseeing Tour</option>
                        <option value="Hallstatt Day Trip">Hallstatt Day Trip</option>
                        <option value="Salzburg Day Trip">Salzburg Day Trip</option>
                        <option value="Wachau Valley Day Trip">Wachau Valley Day Trip</option>
                        <option value="Bratislava Day Trip">Bratislava Day Trip</option>
                        <option value="Budapest Day Trip">Budapest Day Trip</option>
                        <option value="Prague Day Trip">Prague Day Trip</option>
                      </select>
                      <ChevronDown size={16} className="vdt-ref-chevron" />
                    </div>
                  </div>

                  <div className="vdt-ref-cell">
                    <label className="vdt-ref-cell-label" htmlFor="hero-daytrip-extra">
                      <span>EXTRA TIME</span>
                      <span className="vdt-ref-help" title="Tour extension waiting time">?</span>
                    </label>
                    <div className="vdt-ref-select-wrap">
                      <select
                        id="hero-daytrip-extra"
                        value={formData.extraTime}
                        onChange={(e) => handleInputChange('extraTime', e.target.value)}
                        className="vdt-ref-cell-select"
                      >
                        <option value="0 minute(s)">0 minute(s)</option>
                        <option value="15 minute(s)">15 minute(s)</option>
                        <option value="30 minute(s)">30 minute(s)</option>
                        <option value="45 minute(s)">45 minute(s)</option>
                        <option value="60 minute(s)">60 minute(s)</option>
                        <option value="90 minute(s)">90 minute(s)</option>
                        <option value="120 minute(s)">120 minute(s)</option>
                      </select>
                      <ChevronDown size={16} className="vdt-ref-chevron" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>

          {/* Action Bar below Card: Error Message & "GET A QUOTE" Button */}
          <div className="vdt-ref-bottom-bar">
            {errorMsg ? (
              <div className="vdt-ref-error-message">
                <span>{errorMsg}</span>
              </div>
            ) : <div />}

            <button
              type="button"
              onClick={handleGetQuote}
              className="vdt-ref-quote-btn"
              id="hero-booking-quote-submit"
            >
              <span>GET A QUOTE</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Vehicle Details Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={HERO_VEHICLES[modalCarIdx]}
        vehicles={HERO_VEHICLES}
        currentCarIdx={modalCarIdx}
        onSelectCar={(idx) => setModalCarIdx(idx)}
        onBookVehicle={(selectedCar) => {
          setIsModalOpen(false);
          const params = new URLSearchParams();
          params.set('service', activeTab);
          params.set('vehicle', selectedCar.id || selectedCar.bookingValue);
          navigate(`/booking?${params.toString()}`);
        }}
      />

      {/* =============================================================
          3. PRESERVED LUXURY TRUST BAR
          ============================================================= */}
      <div className="hero-trust-container">
        <div className="hero-trust-inner-card">
          <div className="hero-trust-grid">
            <div className="hero-trust-item">
              <div className="hero-trust-icon-box">
                <ShieldCheck size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">{t('trust_chauffeurs_title')}</h4>
                <p className="hero-trust-sub">{t('trust_chauffeurs_sub')}</p>
              </div>
            </div>

            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Gem size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">{t('trust_fleet_title')}</h4>
                <p className="hero-trust-sub">{t('trust_fleet_sub')}</p>
              </div>
            </div>

            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Compass size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">{t('trust_pricing_title')}</h4>
                <p className="hero-trust-sub">{t('trust_pricing_sub')}</p>
              </div>
            </div>

            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Clock size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">{t('trust_support_title')}</h4>
                <p className="hero-trust-sub">{t('trust_support_sub')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================
          SCOPED STYLES
          ============================================================= */}
      <style>{`
        /* Master Container */
        .hero-master-wrapper {
          padding-top: 74px;
          position: relative;
          width: 100%;
          background-color: var(--bg-main, #FAF7F2);
          overflow-x: clip;
        }

        /* 1. Rounded Luxury Hero Banner */
        .hero-rounded-banner {
          max-width: 1820px;
          min-height: clamp(560px, 44vw, 680px);
          margin: 18px 32px 0 32px;
          border-radius: 26px;
          border: 1px solid #E6D8C3;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          isolation: isolate;
          display: flex;
          align-items: center;
        }

        @media (min-width: 1884px) {
          .hero-rounded-banner {
            margin-left: auto;
            margin-right: auto;
            width: calc(100% - 64px);
          }
        }

        /* Palace Backdrop: Positioned to showcase Chauffeur & Mercedes on the right */
        .hero-palace-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          background-image: url('/images/backimage.png');
          background-size: cover;
          background-position: 68% center;
          background-repeat: no-repeat;
        }

        .hero-palace-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 68% center;
          display: block;
        }

        .hero-palace-sheen {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            ellipse 65% 55% at 65% 45%,
            rgba(212, 175, 55, 0.08) 0%,
            transparent 70%
          );
          mix-blend-mode: soft-light;
        }

        .hero-palace-gradient {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            rgba(250, 247, 242, 0.95) 0%,
            rgba(250, 247, 242, 0.86) 28%,
            rgba(250, 247, 242, 0.42) 44%,
            rgba(250, 247, 242, 0.08) 56%,
            transparent 68%
          );
        }

        /* Hero Content Stage: Left Side Text */
        .hero-content-stage {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
          padding: 35px clamp(28px, 4vw, 55px) 90px clamp(28px, 4vw, 55px);
          position: relative;
          z-index: 10;
        }

        .hero-left-col {
          max-width: 460px;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 12;
        }

        /* Transparent Hero Text Container */
        .hero-text-cream-backdrop {
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          padding: 0;
          border-radius: 0;
          border: none;
          box-shadow: none;
        }

        .hero-eyebrow-container {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.65rem;
        }

        .hero-eyebrow-text {
          font-family: var(--font-heading);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #C69C50;
        }

        .hero-eyebrow-line {
          width: 45px;
          height: 1.5px;
          background-color: #C69C50;
          opacity: 0.8;
        }

        /* Playfair Display Heading */
        .hero-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px, 2.7vw, 44px);
          line-height: 1.15;
          font-weight: 600;
          color: #17191C;
          letter-spacing: -0.015em;
          margin: 0 0 0.85rem 0;
          max-width: 450px;
        }

        .hero-heading-gold-italic {
          color: #C69C50;
          font-style: italic;
          font-weight: 500;
        }

        .hero-subtitle {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(17px, 1.45vw, 22px);
          line-height: 1.25;
          font-weight: 600;
          color: #C69C50;
          letter-spacing: 0.01em;
          margin: -0.35rem 0 0.85rem 0;
          max-width: 440px;
        }

        .hero-description {
          font-family: var(--font-body);
          font-size: 0.94rem;
          line-height: 1.6;
          color: #525660;
          max-width: 420px;
          margin: 0 0 1.15rem 0;
        }

        /* 5 Service Highlights */
        .hero-highlights-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem 1.15rem;
          margin-bottom: 1.35rem;
          max-width: 440px;
        }

        .hero-highlight-item {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
        }

        .hero-gold-checkmark {
          color: #C69C50;
          font-weight: 800;
          font-size: 0.95rem;
          line-height: 1;
        }

        .hero-highlight-label {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 600;
          color: #17191C;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        /* CTA Button */
        .hero-cta-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background-color: #C69C50;
          color: #FFFFFF;
          border-radius: 28px;
          padding: 0.72rem 1.75rem;
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 5px 18px rgba(198, 156, 80, 0.32);
          transition: all 0.25s ease;
        }

        .hero-cta-btn:hover {
          background-color: #B58B3F;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(198, 156, 80, 0.45);
        }

        /* Grounded Mercedes Carousel Stage (Bottom-Right of Hero) */
        .hero-vehicle-carousel-stage {
          display: none;
        }

        /* =============================================================
           2. REFERENCE-MATCHED BOOKING FORM STYLES
           ============================================================= */
        .hero-booking-panel-container {
          width: 100%;
          max-width: 1420px;
          margin: -48px auto 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 30;
        }

        .vdt-ref-booking-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        /* Tabs on Top */
        .vdt-ref-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .vdt-ref-tab-btn {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 13px 30px;
          background-color: #FFFFFF;
          color: #17191C;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
          transition: all 0.22s ease;
        }

        .vdt-ref-tab-btn:hover {
          border-color: #C69C50;
          transform: translateY(-1px);
        }

        .vdt-ref-tab-btn.active {
          background-color: #000000;
          color: #FFFFFF;
          border-color: #000000;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
        }

        /* Main Form Card */
        .vdt-ref-form-card {
          background-color: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 18px;
          box-shadow: 0 16px 45px rgba(23, 25, 28, 0.08);
          overflow: visible;
        }

        .vdt-ref-grid-row {
          display: grid;
          width: 100%;
        }

        .vdt-ref-grid-row:not(:last-child) {
          border-bottom: 1px solid #ECE7DE;
        }

        .vdt-ref-grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .vdt-ref-grid-hourly-2 {
          grid-template-columns: 1fr 2fr;
        }

        .vdt-ref-grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        .vdt-ref-cell {
          padding: 18px 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 84px;
          box-sizing: border-box;
        }

        .vdt-ref-cell:not(:last-child) {
          border-right: 1px solid #ECE7DE;
        }

        .vdt-ref-cell-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-heading);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #4B4F58;
          margin-bottom: 6px;
          user-select: none;
        }

        .vdt-ref-help {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #EAE6DF;
          color: #6E727A;
          font-size: 9px;
          font-weight: 700;
          cursor: help;
          line-height: 1;
        }

        .vdt-ref-cell-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 500;
          color: #17191C;
          padding: 2px 0;
          box-sizing: border-box;
        }

        .vdt-ref-cell-input::placeholder {
          color: #8C8F96;
          font-weight: 400;
        }

        .vdt-ref-select-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .vdt-ref-cell-select {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font-heading);
          font-size: 15px;
          font-weight: 600;
          color: #17191C;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          padding: 2px 24px 2px 0;
          box-sizing: border-box;
        }

        .vdt-ref-chevron {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #555962;
        }

        /* Suggestions Dropdown */
        .vdt-ref-suggestions-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
          z-index: 50;
          max-height: 220px;
          overflow-y: auto;
          margin-top: 4px;
        }

        .vdt-ref-suggestion-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #17191C;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .vdt-ref-suggestion-item:hover {
          background: #FAF7F2;
          color: #C69C50;
        }

        .vdt-ref-suggestion-icon {
          color: #C69C50;
          flex-shrink: 0;
        }

        /* Action Bar below Card */
        .vdt-ref-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          gap: 16px;
        }

        .vdt-ref-error-message {
          color: #DC2626;
          font-size: 13.5px;
          font-weight: 500;
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          padding: 8px 16px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
        }

        .vdt-ref-quote-btn {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: #000000;
          color: #FFFFFF;
          border: none;
          border-radius: 9999px;
          padding: 15px 36px;
          font-family: var(--font-heading);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
          transition: all 0.25s ease;
        }

        .vdt-ref-quote-btn:hover {
          background-color: #C69C50;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(198, 156, 80, 0.38);
        }

        /* 3. Luxury Trust Bar */
        .hero-trust-container {
          width: 100%;
          max-width: 1420px;
          margin: 2.2rem auto 2.5rem auto;
          padding: 0 32px;
        }

        .hero-trust-inner-card {
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 1rem 1.6rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border: 1px solid #E8E1D5;
        }

        .hero-trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0 0.85rem;
        }

        .hero-trust-bordered {
          border-left: 1px solid #E8E4DC;
        }

        .hero-trust-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1.5px solid #C69C50;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C69C50;
          flex-shrink: 0;
        }

        .hero-trust-title {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          font-weight: 700;
          color: #17191C;
          margin: 0 0 0.1rem 0;
        }

        .hero-trust-sub {
          font-size: 0.75rem;
          color: #62666D;
          margin: 0;
        }

        /* =============================================================
           RESPONSIVE TUNING
           ============================================================= */

        /* Laptop (1024px - 1280px) */
        @media (max-width: 1280px) and (min-width: 1024px) {
          .hero-rounded-banner {
            margin: 16px 24px 0 24px;
            min-height: 520px;
          }
          .hero-palace-img {
            object-position: 66% center;
          }
          .hero-content-stage {
            padding: 30px 35px 85px 35px;
          }
          .hero-left-col {
            max-width: 440px;
          }
          .hero-heading {
            font-size: 36px;
          }
          .hero-booking-panel-container {
            padding: 0 24px;
            margin-top: -45px;
          }
        }

        /* Tablet (769px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .hero-rounded-banner {
            margin: 16px 20px 0 20px;
            min-height: 560px;
            border-radius: 22px;
          }
          .hero-palace-img {
            object-position: 65% center;
          }
          .hero-content-stage {
            padding: 30px 28px;
          }
          .hero-left-col {
            max-width: 430px;
          }
          .hero-heading {
            font-size: 32px;
          }
          .hero-booking-panel-container {
            margin-top: 16px;
            padding: 0 20px;
          }
          .vdt-ref-grid-3,
          .vdt-ref-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          .vdt-ref-grid-hourly-2 {
            grid-template-columns: 1fr;
          }
          .vdt-ref-cell:nth-child(2n) {
            border-right: none;
          }
          .vdt-ref-trust-container {
            padding: 0 20px;
          }
          .hero-trust-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
          .hero-trust-bordered {
            border-left: none;
          }
        }

        /* Mobile (<= 768px): Compact luxury hero and streamlined booking form */
        @media (max-width: 768px) {
          .hero-master-wrapper {
            padding-top: 64px;
          }
          .hero-rounded-banner {
            margin: 10px 12px 0 12px;
            border-radius: 18px;
            min-height: auto;
            flex-direction: column;
            justify-content: flex-start;
            align-items: stretch;
            padding: 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          .hero-palace-img {
            object-position: 72% center;
          }
          .hero-palace-gradient {
            background: linear-gradient(
              180deg,
              rgba(250, 247, 242, 0.94) 0%,
              rgba(250, 247, 242, 0.88) 55%,
              rgba(250, 247, 242, 0.65) 80%,
              rgba(250, 247, 242, 0.35) 100%
            );
          }
          .hero-content-stage {
            padding: 22px 18px 24px 18px;
          }
          .hero-left-col {
            max-width: 100%;
          }
          .hero-text-cream-backdrop {
            padding: 0;
            border-radius: 0;
            background: transparent;
            border: none;
            box-shadow: none;
          }
          .hero-eyebrow-container {
            margin-bottom: 0.45rem;
          }
          .hero-eyebrow-text {
            font-size: 0.7rem;
            letter-spacing: 0.14em;
          }
          .hero-eyebrow-line {
            width: 32px;
          }
          .hero-heading {
            font-size: clamp(23px, 6vw, 30px);
            line-height: 1.18;
            margin: 0 0 0.5rem 0;
            max-width: 100%;
          }
          .hero-subtitle {
            font-size: clamp(14px, 3.8vw, 17px);
            line-height: 1.25;
            margin: 0 0 0.55rem 0;
            max-width: 100%;
          }
          .hero-description {
            font-size: clamp(12.5px, 3.2vw, 13.5px);
            line-height: 1.5;
            margin: 0 0 0.85rem 0;
            max-width: 100%;
          }
          .hero-highlights-wrap {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.35rem 0.65rem;
            margin-bottom: 1rem;
            max-width: 100%;
          }
          .hero-highlight-item {
            gap: 0.35rem;
          }
          .hero-gold-checkmark {
            font-size: 0.82rem;
          }
          .hero-highlight-label {
            font-size: 0.74rem;
            white-space: normal;
            line-height: 1.25;
          }
          .hero-cta-btn {
            padding: 0.65rem 1.45rem;
            font-size: 0.76rem;
            letter-spacing: 0.06em;
          }

          /* Compact, aligned booking form */
          .hero-booking-panel-container {
            margin-top: 12px;
            padding: 0 12px;
          }
          .vdt-ref-tabs {
            gap: 6px;
            margin-bottom: 10px;
          }
          .vdt-ref-tab-btn {
            flex: 1;
            padding: 10px 4px;
            font-size: clamp(10.5px, 2.8vw, 12px);
            letter-spacing: 0.04em;
            text-align: center;
            border-radius: 10px;
            white-space: nowrap;
          }
          .vdt-ref-form-card {
            border-radius: 14px;
            box-shadow: 0 8px 30px rgba(23, 25, 28, 0.06);
          }
          .vdt-ref-grid-3,
          .vdt-ref-grid-hourly-2,
          .vdt-ref-grid-4 {
            grid-template-columns: 1fr;
          }
          .vdt-ref-cell:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid #ECE7DE;
          }
          .vdt-ref-cell {
            padding: 11px 16px;
            min-height: 60px;
          }
          .vdt-ref-cell-label {
            font-size: 10px;
            letter-spacing: 0.05em;
            margin-bottom: 3px;
          }
          .vdt-ref-cell-input,
          .vdt-ref-cell-select {
            font-size: 14px;
          }
          .vdt-ref-bottom-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-top: 12px;
          }
          .vdt-ref-quote-btn {
            width: 100%;
            justify-content: center;
            padding: 13px 24px;
            font-size: 12.5px;
            letter-spacing: 0.06em;
          }
          .vdt-ref-error-message {
            width: 100%;
            justify-content: center;
            font-size: 12.5px;
            padding: 6px 14px;
          }

          /* Compact 2x2 Trust Bar */
          .hero-trust-container {
            padding: 0 12px;
            margin: 1.25rem auto 1.75rem auto;
          }
          .hero-trust-inner-card {
            border-radius: 14px;
            padding: 0.9rem 1rem;
          }
          .hero-trust-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
          .hero-trust-item {
            gap: 0.65rem;
            padding: 0;
          }
          .hero-trust-bordered {
            border-left: none;
            border-top: none;
            padding-top: 0;
          }
          .hero-trust-icon-box {
            width: 34px;
            height: 34px;
            border-radius: 8px;
          }
          .hero-trust-icon-box svg {
            width: 17px;
            height: 17px;
          }
          .hero-trust-title {
            font-size: 0.78rem;
          }
          .hero-trust-sub {
            font-size: 0.68rem;
            line-height: 1.25;
          }
        }

        /* Extra Compact Phones (<= 360px & 320px) */
        @media (max-width: 360px) {
          .hero-rounded-banner {
            margin: 8px 8px 0 8px;
            border-radius: 14px;
          }
          .hero-content-stage {
            padding: 18px 14px;
          }
          .hero-heading {
            font-size: 21px;
          }
          .hero-subtitle {
            font-size: 13.5px;
          }
          .hero-description {
            font-size: 12px;
          }
          .hero-highlights-wrap {
            grid-template-columns: 1fr;
            gap: 0.25rem;
          }
          .hero-booking-panel-container {
            padding: 0 8px;
          }
          .vdt-ref-tab-btn {
            padding: 8px 2px;
            font-size: 9.5px;
            letter-spacing: 0.02em;
          }
          .vdt-ref-cell {
            padding: 9px 12px;
            min-height: 54px;
          }
          .hero-trust-container {
            padding: 0 8px;
          }
          .hero-trust-grid {
            grid-template-columns: 1fr;
            gap: 0.65rem;
          }
          .hero-trust-bordered {
            border-top: 1px solid #ECE7DE;
            padding-top: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}
