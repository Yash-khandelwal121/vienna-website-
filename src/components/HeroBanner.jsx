import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Lock
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
    scale: 1.0,
    offsetY: '0px',
    offsetX: '0px',
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
    scale: 1.0,
    offsetY: '0px',
    offsetX: '0px',
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
    scale: 1.0,
    offsetY: '0px',
    offsetX: '0px',
    shadowWidth: '92%',
    shadowLeft: '4%',
    passengers: '7 Guests',
    luggage: '7 Large Bags',
    ride: 'Luxury Air Ride',
    description: 'The Mercedes V-Class offers the perfect combination of generous space and uncompromised luxury. With flexible conference seating and abundant luggage space, it is ideal for families, small groups, and long-distance European journeys.',
    features: [
      'Spacious conference seating face-to-face setup',
      'Separate rear digital passenger climate control',
      'Generous luggage capacity for up to 7 large suitcases',
      'Privacy tinted glass & electric sliding doors'
    ]
  },
  {
    id: 'sprinter',
    fleetId: 'sprinter',
    bookingValue: 'Mercedes Sprinter VIP',
    name: 'Mercedes-Benz Sprinter',
    badge: 'VIP Group Minibus',
    image: '/cars/hero-sprinter-car.webp',
    fallback: '/cars/hero-sprinter-car.png',
    alt: 'Mercedes-Benz Sprinter VIP luxury minibus with professional chauffeur in Vienna',
    scale: 1.0,
    offsetY: '0px',
    offsetX: '0px',
    shadowWidth: '92%',
    shadowLeft: '4%',
    passengers: '8-16 Guests',
    luggage: '16 Large Bags',
    ride: 'Heavy-Duty Comfort',
    description: 'The Mercedes Sprinter offers premium comfort, generous headroom, and smooth long-distance travel for group transportation, airport transfers, corporate delegations, and private European tours.',
    features: [
      'Stand-up cabin height with panoramic tinted windows',
      'Reclining leather captain chairs with armrests',
      'Individual air conditioning vents & power outlets',
      'Huge separate luggage compartment in the rear'
    ]
  }
];

export default function HeroBanner() {
  const { t } = useLanguage();

  // Carousel State
  const [currentCarIdx, setCurrentCarIdx] = useState(0);
  const [prevCarIdx, setPrevCarIdx] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' | 'prev'
  const [isHovered, setIsHovered] = useState(false);
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  // Booking Form State
  const [activeTab, setActiveTab] = useState('airport'); // 'airport' | 'daytrip' | 'hourly'
  const [formData, setFormData] = useState({
    pickup: 'Vienna International Airport (VIE)',
    dropoff: 'Hotel or destination',
    date: '2026-10-22',
    time: '02:00',
    passengers: '1 Passenger',
    vehicle: 'Mercedes S-Class'
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Modal showcase state (for vehicle inspection if clicked)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCarIdx, setModalCarIdx] = useState(0);

  // Preload all 4 vehicle images immediately to eliminate blank frames/flicker
  useEffect(() => {
    HERO_VEHICLES.forEach((v) => {
      const img = new Image();
      img.src = v.image;
    });
  }, []);

  // Listen for preselected vehicle requests from other pages (e.g. Fleet page "Request This Vehicle")
  useEffect(() => {
    try {
      const preselected = sessionStorage.getItem('vdt_selected_vehicle');
      if (preselected) {
        setFormData((prev) => ({ ...prev, vehicle: preselected }));
        sessionStorage.removeItem('vdt_selected_vehicle');
        const matchIdx = HERO_VEHICLES.findIndex(
          (v) => v.bookingValue === preselected || v.name.toLowerCase().includes(preselected.toLowerCase())
        );
        if (matchIdx !== -1) {
          setCurrentCarIdx(matchIdx);
        }
        setTimeout(() => {
          const card = document.getElementById('hero-booking-card');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Monitor tab visibility to pause automatic timer when hidden
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 5-Second Automatic Carousel: pauses on hover, modal open, or inactive tab
  useEffect(() => {
    if (isHovered || isModalOpen || !isTabActive) {
      return;
    }

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
      const timer = setTimeout(() => {
        setPrevCarIdx(null);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [prevCarIdx]);

  // Manual Navigation Controls
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

  const handleSelectCar = (idx) => {
    if (idx === currentCarIdx) return;
    setSlideDirection(idx > currentCarIdx ? 'next' : 'prev');
    setPrevCarIdx(currentCarIdx);
    setCurrentCarIdx(idx);
    setTimerResetKey((k) => k + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'airport') {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Vienna International Airport (VIE)',
        dropoff: 'Hotel or destination'
      }));
    } else if (tab === 'daytrip') {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Vienna City Center / Hotel',
        dropoff: 'Hallstatt (Salzkammergut)'
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Vienna City Center',
        dropoff: 'Hourly Chauffeur (Vienna & Surrounds)'
      }));
    }
  };

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (field === 'vehicle') {
      // Sync carousel vehicle preview when user changes preferred vehicle in booking form
      const idx = HERO_VEHICLES.findIndex((v) => v.bookingValue === val || v.name === val);
      if (idx !== -1 && idx !== currentCarIdx) {
        handleSelectCar(idx);
      }
    }
    if (errorMsg) setErrorMsg('');
  };

  const handleGetQuote = async (e) => {
    e.preventDefault();
    if (!formData.pickup || !formData.dropoff || !formData.date || !formData.time) {
      setErrorMsg('Please complete all journey fields before requesting your quote.');
      return;
    }

    const tabName =
      activeTab === 'airport'
        ? 'Airport Transfer'
        : activeTab === 'daytrip'
        ? 'Private Day Trip'
        : 'Hourly Chauffeur';

    // Asynchronously register enquiry in PostgreSQL database
    let bookingRef = '';
    try {
      const apiRes = await submitBookingEnquiry({
        customerName: 'Website Guest',
        email: 'concierge-lead@viennadaytrip.com',
        serviceType: tabName,
        pickupLocation: formData.pickup,
        dropoffLocation: formData.dropoff,
        pickupDate: formData.date,
        pickupTime: formData.time,
        passengerCount: formData.passengers,
        preferredVehicle: formData.vehicle
      });
      if (apiRes && apiRes.success && apiRes.reference) {
        bookingRef = apiRes.reference;
      }
    } catch (err) {
      // Graceful offline fallback
    }

    const refLine = bookingRef ? `\n• Booking Reference: ${bookingRef}` : '';
    const message = `Hello Vienna Day Trip! I would like to request a private chauffeur quote:${refLine}\n\n• Service: ${tabName}\n• Pickup Location: ${formData.pickup}\n• Drop-off Location: ${formData.dropoff}\n• Pickup Date: ${formData.date}\n• Pickup Time: ${formData.time}\n• Passengers: ${formData.passengers}\n• Preferred Vehicle: ${formData.vehicle}\n\nPlease let me know availability and private quote details. Thank you!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/436642035445?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBookVehicleFromModal = (selectedCar) => {
    setIsModalOpen(false);
    setFormData((prev) => ({
      ...prev,
      vehicle: selectedCar.bookingValue || selectedCar.name
    }));

    setTimeout(() => {
      const bookingCard = document.getElementById('hero-booking-card');
      if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const vehicleSelect = document.getElementById('hero-preferred-vehicle-select');
      if (vehicleSelect) {
        vehicleSelect.focus();
      }
    }, 100);
  };

  const currentCar = HERO_VEHICLES[currentCarIdx];

  return (
    <div className="hero-master-wrapper">
      {/* =============================================================
          1. HERO ROUNDED LUXURY BANNER
          - Static Vienna Hofburg Palace (Michaelerplatz) backdrop
          - Left: Heading, Description, 5 Highlights, CTA Button
          - Bottom-Right: Grounded Mercedes Carousel with Realistic Shadows
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
            <source srcSet="/images/vienna-palace-backdrop.webp" type="image/webp" />
            <img
              src="/images/vienna-palace-backdrop.jpg"
              alt="Vienna Hofburg Palace at Michaelerplatz"
              className="hero-palace-img"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </picture>
          <div className="hero-palace-sheen" />
          <div className="hero-palace-gradient" />
        </div>

        {/* Layer 2: Main Hero Content (Left Side Text) */}
        <div className="hero-content-stage">
          <div className="hero-left-col">
            {/* Small Top Label */}
            <div className="hero-eyebrow-container">
              <span className="hero-eyebrow-text">{t('hero_small_label')}</span>
              <span className="hero-eyebrow-line" />
            </div>

            {/* Playfair Display Main Heading */}
            <h1 className="hero-heading">
              {t('hero_heading_part1')}{' '}
              <span className="hero-heading-gold-italic">
                {t('hero_heading_highlight')}
              </span>{' '}
              {t('hero_heading_part2')}
            </h1>

            {/* Description */}
            <p className="hero-description">
              {t('hero_desc')}
            </p>

            {/* 5 Service Highlights arranged elegantly */}
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

        {/* Layer 3: Grounded Mercedes Fleet Carousel Stage (Bottom-Right of Hero) */}
        <div
          className="hero-vehicle-carousel-stage"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Vehicle Slides with Calibrated Ground Baseline */}
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
                    '--car-offset-x': vehicle.offsetX || '0px'
                  }}
                >
                  {/* Standalone Mercedes Vehicle Presentation */}
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
                </div>
              );
            })}
          </div>

          {/* Professional Vienna Chauffeur Layer */}
          <picture>
            <source srcSet="/images/hero-chauffeur-cutout.webp" type="image/webp" />
            <img
              src="/images/hero-chauffeur-cutout.png"
              alt="Professional Vienna Chauffeur"
              className="hero-chauffeur"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      {/* =============================================================
          2. COMPACT HORIZONTAL BOOKING PANEL
          - Moved to bottom of hero section
          - Overlaps hero boundary by ~45-50px on desktop
          - Warm ivory background (#FAF7F2), champagne-gold accents
          - Preserves all 6 fields + WhatsApp Quote CTA
          - Responsive: Desktop horizontal, Tablet 2-column, Mobile stacked below
          - Never covers the Mercedes vehicle
          ============================================================= */}
      <div className="hero-booking-panel-container">
        <div id="hero-booking-card" className="hero-horizontal-booking-card">
          {/* Booking Service Tabs */}
          <div className="hero-booking-tabs-row">
            <button
              type="button"
              onClick={() => handleTabChange('airport')}
              className={`hero-h-tab-btn ${activeTab === 'airport' ? 'active' : ''}`}
            >
              <Plane size={14} style={{ flexShrink: 0 }} />
              <span>{t('tab_airport')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('daytrip')}
              className={`hero-h-tab-btn ${activeTab === 'daytrip' ? 'active' : ''}`}
            >
              <Car size={14} style={{ flexShrink: 0 }} />
              <span>{t('tab_daytrip')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('hourly')}
              className={`hero-h-tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
            >
              <Clock size={14} style={{ flexShrink: 0 }} />
              <span>{t('tab_hourly')}</span>
            </button>
          </div>

          {/* Booking Inputs Form */}
          <form onSubmit={handleGetQuote} className="hero-h-form">
            <div className="hero-h-fields-grid">
              {/* Field 1: Pickup Location */}
              <div className="hero-h-field-group">
                <label className="hero-h-field-label">{t('lbl_pickup').toUpperCase()}</label>
                <div className="hero-h-input-box">
                  <MapPin size={13} className="hero-h-icon" />
                  <select
                    value={formData.pickup}
                    onChange={(e) => handleInputChange('pickup', e.target.value)}
                    className="hero-h-select"
                  >
                    <option value="Vienna International Airport (VIE)">Vienna Airport (VIE)</option>
                    <option value="Vienna City Center (Innere Stadt)">Vienna City Center</option>
                    <option value="Hotel Sacher / Bristol / Imperial">Hotel Sacher / Imperial</option>
                    <option value="Vienna Central Station (Hauptbahnhof)">Vienna Central Station</option>
                    <option value="Private Address / Residence">Private Address</option>
                  </select>
                </div>
              </div>

              {/* Field 2: Drop-off Location */}
              <div className="hero-h-field-group">
                <label className="hero-h-field-label">{t('lbl_dropoff').toUpperCase()}</label>
                <div className="hero-h-input-box">
                  <MapPin size={13} className="hero-h-icon" />
                  <select
                    value={formData.dropoff}
                    onChange={(e) => handleInputChange('dropoff', e.target.value)}
                    className="hero-h-select"
                  >
                    <option value="Hotel or destination">Hotel or destination</option>
                    <option value="Vienna City Center (Innere Stadt)">Vienna City Center</option>
                    <option value="Vienna International Airport (VIE)">Vienna Airport (VIE)</option>
                    <option value="Hallstatt (Salzkammergut)">Hallstatt Day Trip</option>
                    <option value="Salzburg (Historic Center)">Salzburg Day Trip</option>
                    <option value="Budapest (Hungary)">Budapest Day Trip</option>
                    <option value="Prague (Czech Republic)">Prague Day Trip</option>
                    <option value="Bratislava (Slovakia)">Bratislava Day Trip</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Date */}
              <div className="hero-h-field-group">
                <label className="hero-h-field-label">{t('lbl_date').toUpperCase()}</label>
                <div className="hero-h-input-box">
                  <CalendarIcon size={13} className="hero-h-icon" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="hero-h-input"
                  />
                </div>
              </div>

              {/* Field 4: Time */}
              <div className="hero-h-field-group">
                <label className="hero-h-field-label">{t('lbl_time').toUpperCase()}</label>
                <div className="hero-h-input-box">
                  <Clock size={13} className="hero-h-icon" />
                  <select
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="hero-h-select"
                  >
                    <option value="02:00">02:00</option>
                    <option value="06:00">06:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="16:00">16:00</option>
                    <option value="18:00">18:00</option>
                    <option value="20:00">20:00</option>
                    <option value="22:00">22:00</option>
                  </select>
                </div>
              </div>

              {/* Field 5: Passengers */}
              <div className="hero-h-field-group">
                <label className="hero-h-field-label">{t('lbl_passengers').toUpperCase()}</label>
                <div className="hero-h-input-box">
                  <Users size={13} className="hero-h-icon" />
                  <select
                    value={formData.passengers}
                    onChange={(e) => handleInputChange('passengers', e.target.value)}
                    className="hero-h-select"
                  >
                    <option value="1 Passenger">1 Passenger</option>
                    <option value="2 Passengers">2 Passengers</option>
                    <option value="3 Passengers">3 Passengers</option>
                    <option value="4-7 Passengers (Van)">4-7 Passengers</option>
                    <option value="8+ Passengers (Sprinter)">8+ Passengers</option>
                  </select>
                </div>
              </div>

              {/* Field 6: Preferred Vehicle */}
              <div className="hero-h-field-group">
                <label className="hero-h-field-label">{t('lbl_vehicle').toUpperCase()}</label>
                <div className="hero-h-input-box">
                  <Car size={13} className="hero-h-icon" />
                  <select
                    id="hero-preferred-vehicle-select"
                    value={formData.vehicle}
                    onChange={(e) => handleInputChange('vehicle', e.target.value)}
                    className="hero-h-select"
                  >
                    <option value="Mercedes S-Class">Mercedes S-Class</option>
                    <option value="Mercedes E-Class">Mercedes E-Class</option>
                    <option value="Mercedes V-Class">Mercedes V-Class</option>
                    <option value="Mercedes Sprinter VIP">Mercedes Sprinter</option>
                  </select>
                </div>
              </div>

              {/* Action Button: GET QUOTE ON WHATSAPP */}
              <div className="hero-h-field-group hero-h-action-group">
                <button type="submit" className="hero-h-quote-btn">
                  <span>{t('btn_get_quote_whatsapp')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="hero-h-error-msg">
                {errorMsg}
              </div>
            )}

            {/* Subtext reassurance */}
            <div className="hero-h-reassurance">
              <Lock size={12} style={{ opacity: 0.65 }} />
              <span>{t('booking_no_payment')}</span>
            </div>
          </form>
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
        onBookVehicle={handleBookVehicleFromModal}
      />

      {/* =============================================================
          3. PRESERVED LUXURY TRUST BAR
          ============================================================= */}
      <div className="hero-trust-container">
        <div className="hero-trust-inner-card">
          <div className="hero-trust-grid">
            {/* Column 1 */}
            <div className="hero-trust-item">
              <div className="hero-trust-icon-box">
                <ShieldCheck size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">{t('trust_chauffeurs_title')}</h4>
                <p className="hero-trust-sub">{t('trust_chauffeurs_sub')}</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Gem size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">{t('trust_fleet_title')}</h4>
                <p className="hero-trust-sub">{t('trust_fleet_sub')}</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Compass size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">{t('trust_pricing_title')}</h4>
                <p className="hero-trust-sub">{t('trust_pricing_sub')}</p>
              </div>
            </div>

            {/* Column 4 */}
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
          background-color: var(--bg-main, #FFFFFF);
          overflow-x: clip;
        }

        /* 1. Rounded Luxury Hero Banner */
        .hero-rounded-banner {
          max-width: 1820px;
          min-height: clamp(520px, 42vw, 630px);
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

        /* Palace Backdrop */
        .hero-palace-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .hero-palace-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 54%;
          display: block;
          transform: scale(1.02);
        }

        .hero-palace-sheen {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            ellipse 65% 55% at 52% 40%,
            rgba(212, 175, 55, 0.12) 0%,
            rgba(198, 156, 80, 0.04) 45%,
            transparent 75%
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
            rgba(252, 250, 246, 0.95) 0%,
            rgba(252, 250, 246, 0.88) 32%,
            rgba(252, 250, 246, 0.50) 48%,
            rgba(252, 250, 246, 0.12) 64%,
            rgba(252, 250, 246, 0.00) 100%
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
          max-width: 580px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 12;
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
          font-size: clamp(34px, 3.1vw, 48px);
          line-height: 1.14;
          font-weight: 600;
          color: #17191C;
          letter-spacing: -0.015em;
          margin: 0 0 0.85rem 0;
        }

        .hero-heading-gold-italic {
          color: #C69C50;
          font-style: italic;
          font-weight: 500;
        }

        .hero-description {
          font-family: var(--font-body);
          font-size: 0.94rem;
          line-height: 1.58;
          color: #525660;
          max-width: 530px;
          margin: 0 0 1.15rem 0;
        }

        /* 5 Service Highlights arranged elegantly */
        .hero-highlights-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem 1.15rem;
          margin-bottom: 1.35rem;
          max-width: 560px;
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

        /* 
          =============================================================
          GROUNDED MERCEDES CAROUSEL STAGE (Bottom-Right of Hero)
          - Positioned toward bottom-right, resting on cobblestone pavement
          - Calibrated offset-y for each vehicle removes transparent padding gap
          - Authentic double-layer ground contact shadow beneath the tyres
          =============================================================
        */
        .hero-vehicle-carousel-stage {
          position: absolute;
          right: clamp(10px, 2.5vw, 40px);
          bottom: 0px;
          width: clamp(520px, 48vw, 760px);
          height: clamp(260px, 26vw, 380px);
          z-index: 10;
          pointer-events: auto;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-end;
        }

        /* Vehicle Viewport Container */
        .hero-vehicle-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          overflow: visible;
        }

        /* Animated Vehicle Slide */
        .hero-vehicle-slide {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          will-change: transform, opacity;
          transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1),
                      transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-vehicle-slide.active {
          opacity: 1;
          transform: translateX(calc(0px + var(--car-offset-x, 0px))) translateY(var(--car-offset-y, 0px)) scale(var(--car-scale, 1));
          z-index: 2;
        }

        .hero-vehicle-slide.exiting.slide-dir-next {
          opacity: 0;
          transform: translateX(calc(-24px + var(--car-offset-x, 0px))) translateY(var(--car-offset-y, 0px)) scale(var(--car-scale, 1));
          z-index: 1;
        }

        .hero-vehicle-slide.exiting.slide-dir-prev {
          opacity: 0;
          transform: translateX(calc(24px + var(--car-offset-x, 0px))) translateY(var(--car-offset-y, 0px)) scale(var(--car-scale, 1));
          z-index: 1;
        }

        .hero-car-picture {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .hero-car-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: right bottom;
          display: block;
          position: relative;
          z-index: 1;
        }

        /* CHAUFFEUR IMAGE SIZE FIX */
        .hero-chauffeur {
          position: absolute;
          height: 100%;
          width: auto;
          right: 12%;
          bottom: 0;
          object-fit: contain;
          object-position: bottom;
          z-index: 3;
          pointer-events: none;
        }

        /* 
          2. COMPACT HORIZONTAL BOOKING PANEL
          - Placed directly below the hero banner
          - Overlaps hero boundary by ~45-50px on desktop
          - Warm ivory background (#FAF7F2), champagne-gold accents
        */
        .hero-booking-panel-container {
          position: relative;
          z-index: 25;
          max-width: 1420px;
          margin: -48px auto 0 auto;
          padding: 0 32px;
          width: 100%;
        }

        .hero-horizontal-booking-card {
          background-color: #FAF7F2;
          border: 1px solid rgba(198, 156, 80, 0.35);
          border-radius: 20px;
          padding: 20px 24px 18px 24px;
          box-shadow: 0 18px 45px rgba(23, 25, 28, 0.08), 0 2px 10px rgba(198, 156, 80, 0.04);
        }

        /* Tabs row */
        .hero-booking-tabs-row {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          background: rgba(255, 255, 255, 0.65);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #EAE3D6;
        }

        .hero-h-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid transparent;
          background-color: transparent;
          color: #555962;
          font-family: var(--font-heading);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hero-h-tab-btn:hover {
          color: #17191C;
        }

        .hero-h-tab-btn.active {
          background-color: #C69C50;
          color: #FFFFFF;
          border-color: #C69C50;
          box-shadow: 0 3px 10px rgba(198, 156, 80, 0.28);
        }

        /* Horizontal 7-column grid on desktop */
        .hero-h-fields-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(130px, 1fr)) minmax(195px, 1.3fr);
          gap: 10px;
          align-items: flex-end;
        }

        .hero-h-field-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .hero-h-field-label {
          font-family: var(--font-heading);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6A6E78;
          margin-bottom: 0.35rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-h-input-box {
          position: relative;
          width: 100%;
        }

        .hero-h-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #C69C50;
          pointer-events: none;
        }

        .hero-h-select,
        .hero-h-input {
          width: 100%;
          height: 46px;
          background-color: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 10px;
          padding: 0 0.5rem 0 1.95rem;
          font-family: var(--font-body);
          font-size: 0.81rem;
          color: #17191C;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-h-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2362666D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 11px;
          padding-right: 22px;
        }

        .hero-h-select:focus,
        .hero-h-input:focus {
          border-color: #C69C50;
          box-shadow: 0 0 0 2px rgba(198, 156, 80, 0.18);
        }

        /* Action Column & Quote Button */
        .hero-h-action-group {
          justify-content: flex-end;
        }

        .hero-h-quote-btn {
          width: 100%;
          height: 46px;
          background: linear-gradient(135deg, #C69C50 0%, #B88B3C 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-family: var(--font-heading);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(198, 156, 80, 0.32);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          transition: all 0.25s ease;
          white-space: nowrap;
          padding: 0 0.75rem;
        }

        .hero-h-quote-btn:hover {
          background: linear-gradient(135deg, #B58B3F 0%, #A4782E 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(198, 156, 80, 0.42);
        }

        .hero-h-error-msg {
          color: #DC2626;
          font-size: 0.78rem;
          font-family: var(--font-body);
          text-align: center;
          margin-top: 0.65rem;
        }

        .hero-h-reassurance {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 0.75rem;
          color: #62666D;
          font-size: 0.74rem;
          font-family: var(--font-body);
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
          .hero-content-stage {
            padding: 30px 35px 85px 35px;
          }
          .hero-heading {
            font-size: 38px;
          }
          .hero-vehicle-carousel-stage {
            width: clamp(480px, 46vw, 620px);
            height: clamp(260px, 26vw, 320px);
            bottom: 2px;
          }
          .hero-booking-panel-container {
            padding: 0 24px;
            margin-top: -45px;
          }
          .hero-h-fields-grid {
            grid-template-columns: repeat(3, 1fr) repeat(3, 1fr);
          }
          .hero-h-action-group {
            grid-column: span 6;
          }
        }

        /* Tablet (769px - 1023px): 2-Column Balanced Layout */
        @media (max-width: 1023px) and (min-width: 769px) {
          .hero-rounded-banner {
            margin: 16px 20px 0 20px;
            min-height: unset;
            border-radius: 22px;
            flex-direction: column;
            align-items: stretch;
            padding-bottom: 20px;
          }
          .hero-content-stage {
            padding: 30px 25px 15px 25px;
          }
          .hero-left-col {
            max-width: 100%;
          }
          .hero-heading {
            font-size: 34px;
          }
          .hero-vehicle-carousel-stage {
            position: relative;
            right: auto;
            bottom: auto;
            width: 100%;
            max-width: 580px;
            height: clamp(230px, 30vw, 300px);
            margin: 10px auto 0 auto;
            align-items: center;
          }
          .hero-car-picture {
            justify-content: center;
          }
          .hero-car-image {
            object-position: center bottom;
          }
          .hero-booking-panel-container {
            margin-top: 16px;
            padding: 0 20px;
          }
          .hero-h-fields-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .hero-h-action-group {
            grid-column: span 2;
          }
          .hero-trust-container {
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

        /* Mobile (<= 768px): Stacked layout below hero */
        @media (max-width: 768px) {
          .hero-master-wrapper {
            padding-top: 78px;
          }
          .hero-rounded-banner {
            margin: 12px 12px 0 12px;
            border-radius: 18px;
            min-height: unset;
            flex-direction: column;
            align-items: stretch;
            padding-bottom: 22px;
          }
          .hero-palace-gradient {
            background: linear-gradient(
              180deg,
              rgba(252, 250, 246, 0.95) 0%,
              rgba(252, 250, 246, 0.84) 40%,
              rgba(252, 250, 246, 0.40) 70%,
              rgba(252, 250, 246, 0.15) 100%
            );
          }
          .hero-content-stage {
            padding: 24px 16px 12px 16px;
          }
          .hero-heading {
            font-size: clamp(26px, 6.5vw, 32px);
            line-height: 1.18;
          }
          .hero-description {
            font-size: 0.88rem;
            line-height: 1.52;
          }
          .hero-highlights-wrap {
            flex-direction: column;
            gap: 0.45rem;
            margin-bottom: 1.15rem;
          }

          /* Grounded Car and Chauffeur in Mobile */
          .hero-vehicle-carousel-stage {
            position: relative;
            right: auto;
            bottom: auto;
            width: 100%;
            max-width: 440px;
            height: clamp(210px, 54vw, 250px);
            margin: 12px auto 0 auto;
            align-items: center;
            justify-content: flex-end;
          }
          .hero-car-picture {
            justify-content: center;
          }
          .hero-car-image {
            object-position: center bottom;
            padding-bottom: 2px;
          }

          /* Booking form stacked below hero banner, NEVER covering the car */
          .hero-booking-panel-container {
            margin-top: 14px;
            padding: 0 12px;
          }
          .hero-horizontal-booking-card {
            border-radius: 16px;
            padding: 16px 14px;
          }
          .hero-booking-tabs-row {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            padding: 3px;
            gap: 2px;
          }
          .hero-h-tab-btn {
            font-size: 0.68rem;
            padding: 0.5rem 0.2rem;
            justify-content: center;
          }
          .hero-h-fields-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .hero-h-action-group {
            margin-top: 4px;
          }
          .hero-trust-container {
            padding: 0 12px;
            margin: 1.8rem auto;
          }
          .hero-trust-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .hero-trust-bordered {
            border-left: none;
            border-top: 1px solid #E8E4DC;
            padding-top: 0.85rem;
          }
        }

        /* Respect accessibility preference */
        @media (prefers-reduced-motion: reduce) {
          .hero-vehicle-slide {
            transition: opacity 200ms ease !important;
            transform: translateY(var(--car-offset-y, 0px)) scale(var(--car-scale, 1)) !important;
          }
        }
      `}</style>
    </div>
  );
}
