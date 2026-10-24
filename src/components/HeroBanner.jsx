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
  Lock,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import VehicleModal from './VehicleModal';
import { useLanguage } from '../context/LanguageContext';
import { submitBookingEnquiry } from '../services/api';

/* 
  SIXT-STYLE HERO VEHICLES (Independent from Booking Form selection)
  1. Mercedes-Benz S-Class (First Class Sedan)
  2. Mercedes-Benz E-Class (Business Class Sedan)
  3. Mercedes-Benz V-Class (VIP Business Van)
  4. Mercedes-Benz Sprinter (VIP Group Minibus)
  - Specifications authentic to src/data/fleet.js
  - Fine-tuned scale & offset so V-Class and Sprinter never overlap the left description text
*/
const HERO_VEHICLES = [
  {
    id: 's-class',
    fleetId: 's-class',
    bookingValue: 'Mercedes S-Class',
    name: 'Mercedes-Benz S-Class',
    badge: 'First Class Sedan',
    category: 'First Class Limousine',
    tagline: 'The Pinnacle of Automotive Luxury',
    image: '/cars/s-class.webp',
    fallback: '/cars/s-class.png',
    alt: 'Mercedes-Benz S-Class luxury chauffeur sedan',
    scale: 0.98,
    offsetY: '0px',
    offsetX: '0px',
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
    category: 'Executive Business',
    tagline: 'Sophistication Meets Everyday Efficiency',
    image: '/cars/e-class.webp',
    fallback: '/cars/e-class.png',
    alt: 'Mercedes-Benz E-Class executive chauffeur sedan',
    scale: 0.96,
    offsetY: '0px',
    offsetX: '0px',
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
    category: 'VIP Executive Van',
    tagline: 'First-Class Space for Families & Delegations',
    image: '/cars/v-class.webp',
    fallback: '/cars/v-class.png',
    alt: 'Mercedes-Benz V-Class VIP luxury chauffeur van',
    scale: 0.88,
    offsetY: '-2px',
    offsetX: '48px',
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
    category: 'Luxury Mini-Coach',
    tagline: 'Spacious Group Travel with High-End Refinement',
    image: '/cars/sprinter.webp',
    fallback: '/cars/sprinter.png',
    alt: 'Mercedes-Benz Sprinter VIP luxury minibus',
    scale: 0.84,
    offsetY: '2px',
    offsetX: '54px',
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

  // Vehicle Slider State (Independent State)
  const [currentCarIdx, setCurrentCarIdx] = useState(0);
  const [prevCarIdx, setPrevCarIdx] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' | 'prev'
  const [touchStart, setTouchStart] = useState(null);

  // Auto-Slider & Modal Controls State
  const [isHoveredNav, setIsHoveredNav] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCarIdx, setModalCarIdx] = useState(0);
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [timerResetKey, setTimerResetKey] = useState(0);

  // Preload all vehicle images immediately to eliminate delay or flicker
  useEffect(() => {
    HERO_VEHICLES.forEach((v) => {
      const img = new Image();
      img.src = v.image;
    });
  }, []);

  // Listen for preselected vehicle requests (e.g. from Fleet page "Request This Vehicle")
  useEffect(() => {
    try {
      const preselected = sessionStorage.getItem('vdt_selected_vehicle');
      if (preselected) {
        setFormData((prev) => ({ ...prev, vehicle: preselected }));
        sessionStorage.removeItem('vdt_selected_vehicle');
        const foundIdx = HERO_VEHICLES.findIndex(
          (v) => v.bookingValue === preselected || v.name.toLowerCase().includes(preselected.toLowerCase())
        );
        if (foundIdx !== -1) {
          setCurrentCarIdx(foundIdx);
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

  // Monitor document visibility to pause when inactive
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Automatic Vehicle Slider: 5-second interval
  // Paused when: hovered over nav card, modal is open, or browser tab is inactive
  useEffect(() => {
    if (isModalOpen || isHoveredNav || !isTabActive) {
      return;
    }

    const interval = setInterval(() => {
      setSlideDirection('next');
      setPrevCarIdx(currentCarIdx);
      setCurrentCarIdx((prev) => (prev + 1) % HERO_VEHICLES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentCarIdx, isModalOpen, isHoveredNav, isTabActive, timerResetKey]);

  // Transition duration: 700ms cleanup (matching 700ms CSS transition)
  useEffect(() => {
    if (prevCarIdx !== null) {
      const timer = setTimeout(() => {
        setPrevCarIdx(null);
      }, 700);
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

  const handleSelectCar = (idx) => {
    if (idx === currentCarIdx) return;
    setSlideDirection(idx > currentCarIdx ? 'next' : 'prev');
    setPrevCarIdx(currentCarIdx);
    setCurrentCarIdx(idx);
    setTimerResetKey((k) => k + 1);
  };

  const handleOpenVehicleModal = (idx = currentCarIdx) => {
    setModalCarIdx(idx);
    setIsModalOpen(true);
  };

  const handleCloseVehicleModal = () => {
    setIsModalOpen(false);
    // Restart automatic timer when modal closes
    setTimerResetKey((k) => k + 1);
  };

  const handleBookVehicleFromModal = (selectedCar) => {
    // 1. Close popup
    setIsModalOpen(false);
    setTimerResetKey((k) => k + 1);

    // 2. Update booking form's preferred vehicle using existing state management
    setFormData((prev) => ({
      ...prev,
      vehicle: selectedCar.bookingValue || selectedCar.name
    }));

    // 3. Smoothly scroll to the booking form
    setTimeout(() => {
      const bookingCard = document.getElementById('hero-booking-card');
      if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 4. Focus preferred vehicle field
      const vehicleSelect = document.getElementById('hero-preferred-vehicle-select');
      if (vehicleSelect) {
        vehicleSelect.focus();
      }
    }, 100);
  };

  // Subtle Cinematic Parallax for Palace Backdrop Only (Disabled on mobile & reduced-motion)
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) return;

    let ticking = false;
    const palaceImg = document.querySelector('.hero-palace-img');
    if (!palaceImg) return;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (scrollY < 900) {
            const parallaxOffset = scrollY * 0.16; // subtle 16% optical depth
            palaceImg.style.setProperty('--palace-parallax', `${parallaxOffset.toFixed(1)}px`);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [activeTab, setActiveTab] = useState('airport'); // 'airport' | 'daytrip' | 'hourly'
  const [formData, setFormData] = useState({
    pickup: 'Vienna International Airport (VIE)',
    dropoff: 'Hotel name or destination',
    date: '2026-10-22',
    time: '02:00',
    passengers: '1 Passenger',
    vehicle: 'Mercedes S-Class'
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'airport') {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Vienna International Airport (VIE)',
        dropoff: 'Hotel Sacher (Vienna City Center)'
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

  return (
    <div className="hero-master-wrapper">
      {/* 
        =======================================================================
        ROUNDED LUXURY HERO BANNER CONTAINER
        - Desktop: 620px | Laptop: 580px | Tablet: auto (min 520px) | Mobile: auto
        - Margin: 15px top, 35px sides, 25px bottom (mobile: 15px top, 12px sides, 25px bottom)
        - Radius: 22px (mobile: 14px)
        - Border: 1px solid #E8E1D5
        - Shadow: 0 12px 35px rgba(0,0,0,0.06)
        =======================================================================
      */}
      <div
        className="hero-rounded-banner vdt-hero"
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
        {/* =============================================================
            LAYER 1: STATIC VIENNA PALACE BACKGROUND
            - Static Vienna Hofburg Palace backdrop (Michaelerplatz)
            - Palace remains 100% static when changing vehicles
            ============================================================= */}
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
          {/* Subtle golden morning atmospheric sheen */}
          <div className="hero-palace-sheen" />
          {/* Luxury text protection gradient */}
          <div className="hero-palace-gradient" />
        </div>

        {/* =============================================================
            LAYER 2: SIXT-STYLE MERCEDES VEHICLE CAROUSEL
            - Center-lower placement (matching existing hero composition)
            - Transparent-background studio vehicles with natural ground shadow
            - 550ms fade + 20px horizontal slide, cubic-bezier(0.22, 1, 0.36, 1)
            ============================================================= */}
        <div className="hero-vehicle-stage" aria-hidden="true">
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
                <picture>
                  <source srcSet={vehicle.image} type="image/webp" />
                  <img
                    src={vehicle.fallback}
                    alt={vehicle.alt}
                    className="hero-vehicle-img"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </picture>
              </div>
            );
          })}
        </div>

        {/* Two-Column Layout Grid: 55% Left Content, 45% Right Booking Form */}
        <div className="hero-grid-layout vdt-inner">
          {/* =============================================================
              LEFT SIDE CONTENT (55%)
              ============================================================= */}
          <div className="hero-left-content">
            {/* Eyebrow Label */}
            <div className="hero-eyebrow-container">
              <div className="hero-eyebrow-brand">
                <span className="hero-eyebrow-text">VIENNA DAY TRIP</span>
                <span className="hero-eyebrow-line" />
              </div>
              <div className="hero-eyebrow-sub">
                PRIVATE CHAUFFEUR EXPERIENCES
              </div>
            </div>

            {/* Reduced & Responsive Heading */}
            <h1 className="hero-heading">
              Every Journey.<br />
              <span className="hero-heading-italic">Exceptionally</span> Yours.
            </h1>

            {/* Description */}
            <p className="hero-description">
              Luxury private transfers, VIP airport concierge and unforgettable day trips across Vienna and Central Europe with professional chauffeurs and premium Mercedes-Benz vehicles.
            </p>

            {/* 4 Feature Checklist Items in compact 2x2 grid to prevent overlapping the Mercedes bumper */}
            <div className="hero-features-grid">
              {[
                { title: 'Professional Chauffeurs', icon: ShieldCheck },
                { title: 'Premium Mercedes Fleet', icon: Car },
                { title: 'Private European Day Trips', icon: Compass },
                { title: '24/7 Availability', icon: Clock }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="hero-feature-item">
                    <div className="hero-feature-icon-box">
                      <Icon size={12} strokeWidth={2.2} />
                    </div>
                    <span className="hero-feature-text">{item.title}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="hero-cta-wrapper">
              <Link to="/our-services/" className="hero-cta-btn">
                <span>EXPLORE OUR SERVICES</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* =============================================================
              RIGHT SIDE: COMPACT LUXURY BOOKING FORM (45%)
              - Width: 460px
              - Padding: 24px
              - Border radius: 16px
              - Input height: 45px
              - Gap: 14px
              - Button height: 52px
              ============================================================= */}
          <div className="hero-right-content">
            <div id="hero-booking-card" className="hero-compact-card vdt-form">
              {/* 3 Booking Tabs */}
              <div className="hero-tabs-row">
                {[
                  { id: 'airport', label: t('tab_airport'), icon: Plane },
                  { id: 'daytrip', label: t('tab_daytrip'), icon: Car },
                  { id: 'hourly', label: t('tab_hourly'), icon: Clock }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`hero-tab-btn ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={13} style={{ flexShrink: 0 }} />
                      <span className="hero-tab-label">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Booking Form Fields: 2 Columns */}
              <form onSubmit={handleGetQuote}>
                <div className="hero-form-fields-grid">
                  {/* Field 1: Pickup Location */}
                  <div>
                    <label className="hero-field-label">{t('lbl_pickup').toUpperCase()}</label>
                    <div className="hero-input-wrapper">
                      <MapPin size={13} className="hero-field-icon" />
                      <select
                        value={formData.pickup}
                        onChange={(e) => handleInputChange('pickup', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="Vienna International Airport (VIE)">Vienna Airport (VIE)</option>
                        <option value="Vienna City Center (Innere Stadt)">Vienna City Center</option>
                        <option value="Hotel Sacher / Bristol / Imperial">Hotel Sacher / Imperial</option>
                        <option value="Vienna Central Station (Hauptbahnhof)">Vienna Central Station</option>
                        <option value="Private Address / Residence">Private Address</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 2: Drop-Off Location */}
                  <div>
                    <label className="hero-field-label">{t('lbl_dropoff').toUpperCase()}</label>
                    <div className="hero-input-wrapper">
                      <MapPin size={13} className="hero-field-icon" />
                      <select
                        value={formData.dropoff}
                        onChange={(e) => handleInputChange('dropoff', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="Hotel name or destination">Hotel or destination</option>
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

                  {/* Field 3: Pickup Date */}
                  <div>
                    <label className="hero-field-label">{t('lbl_date').toUpperCase()}</label>
                    <div className="hero-input-wrapper">
                      <CalendarIcon size={13} className="hero-field-icon" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="hero-custom-input"
                      />
                    </div>
                  </div>

                  {/* Field 4: Pickup Time */}
                  <div>
                    <label className="hero-field-label">{t('lbl_time').toUpperCase()}</label>
                    <div className="hero-input-wrapper">
                      <Clock size={13} className="hero-field-icon" />
                      <select
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="hero-custom-select"
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
                  <div>
                    <label className="hero-field-label">{t('lbl_passengers').toUpperCase()}</label>
                    <div className="hero-input-wrapper">
                      <Users size={13} className="hero-field-icon" />
                      <select
                        value={formData.passengers}
                        onChange={(e) => handleInputChange('passengers', e.target.value)}
                        className="hero-custom-select"
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
                  <div>
                    <label className="hero-field-label">{t('lbl_vehicle').toUpperCase()}</label>
                    <div className="hero-input-wrapper">
                      <Car size={13} className="hero-field-icon" />
                      <select
                        id="hero-preferred-vehicle-select"
                        value={formData.vehicle}
                        onChange={(e) => handleInputChange('vehicle', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="Mercedes S-Class">Mercedes S-Class</option>
                        <option value="Mercedes E-Class">Mercedes E-Class</option>
                        <option value="Mercedes V-Class">Mercedes V-Class</option>
                        <option value="Mercedes Sprinter VIP">Mercedes Sprinter</option>
                      </select>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="hero-form-error">
                    {errorMsg}
                  </div>
                )}

                {/* Booking Button: Height 52px */}
                <button type="submit" className="hero-quote-btn">
                  <span>{t('btn_get_quote')}</span>
                  <ArrowRight size={15} />
                </button>

                {/* Subtext Reassurance */}
                <div className="hero-reassurance-row">
                  <Lock size={12} style={{ opacity: 0.6 }} />
                  <span>No payment required. Get a personalized quote via WhatsApp.</span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* =============================================================
            SIXT-STYLE VEHICLE CONTROLS (Bottom Center/Right)
            - Independent previous / next navigation arrows
            - Central vehicle card opens luxury 360° vehicle details popup
            - Pauses 5s auto-sliding on hover
            - Champagne gold accents
            ============================================================= */}
        <div
          className="hero-vehicle-nav-wrapper"
          onMouseEnter={() => setIsHoveredNav(true)}
          onMouseLeave={() => setIsHoveredNav(false)}
        >
          <div className="hero-vehicle-nav-pill">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevCar();
              }}
              className="hero-vehicle-arrow-btn"
              aria-label="Previous Mercedes vehicle"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Central Clickable Vehicle Card Area: Opens Premium Vehicle Popup */}
            <div
              className="hero-vehicle-info-block clickable"
              onClick={() => handleOpenVehicleModal(currentCarIdx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenVehicleModal(currentCarIdx);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View 360° showcase and specifications for ${HERO_VEHICLES[currentCarIdx].name}`}
              title={t('view_360_card')}
            >
              <span className="hero-vehicle-badge-text">{HERO_VEHICLES[currentCarIdx].badge}</span>
              <div className="hero-vehicle-title-row">
                <span className="hero-vehicle-title-text">{HERO_VEHICLES[currentCarIdx].name}</span>
                <span className="hero-vehicle-expand-hint" aria-hidden="true">
                  <Maximize2 size={11} />
                </span>
              </div>
            </div>

            <div className="hero-vehicle-dots-row">
              {HERO_VEHICLES.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCar(i);
                  }}
                  className={`hero-vehicle-dot-btn ${i === currentCarIdx ? 'active' : ''}`}
                  aria-label={`Select ${v.name}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextCar();
              }}
              className="hero-vehicle-arrow-btn"
              aria-label="Next Mercedes vehicle"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* =============================================================
          LUXURY 360° VEHICLE SHOWCASE POPUP MODAL
          ============================================================= */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={handleCloseVehicleModal}
        vehicle={HERO_VEHICLES[modalCarIdx]}
        vehicles={HERO_VEHICLES}
        currentCarIdx={modalCarIdx}
        onSelectCar={(idx) => setModalCarIdx(idx)}
        onBookVehicle={handleBookVehicleFromModal}
      />

      {/* =============================================================
          BOTTOM TRUST BAR (Preserved cleanly below the hero banner)
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
                <h4 className="hero-trust-title">Professional Chauffeurs</h4>
                <p className="hero-trust-sub">Experienced & Licensed</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Gem size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">Premium Mercedes-Benz Fleet</h4>
                <p className="hero-trust-sub">Luxury & Comfort</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Compass size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">Flexible Private Journeys</h4>
                <p className="hero-trust-sub">Vienna & Beyond</p>
              </div>
            </div>

            {/* Column 4 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Clock size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">24/7 Availability</h4>
                <p className="hero-trust-sub">Always at Your Service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped CSS Styles for Pixel-Perfect Accuracy Across All Breakpoints */}
      <style>{`
        /* Master Hero Wrapper: Ensures hero starts directly below fixed 74px navbar */
        .hero-master-wrapper {
          padding-top: 74px;
          position: relative;
          width: 100%;
          background-color: var(--bg-main, #FFFFFF);
        }

        /* 
          STEP 3: HERO SIZE & CONTAINER
          - Desktop Max width: 1820px
          - Height: clamp(520px, 42vw, 650px)
          - Border radius: 28px
          - Outer margin: 20px 32px
          - Border: 1px solid #E6D8C3
          - Overflow: hidden
        */
        .hero-rounded-banner {
          max-width: 1820px;
          height: clamp(520px, 42vw, 650px);
          margin: 20px 32px 25px 32px;
          border-radius: 28px;
          border: 1px solid #E6D8C3;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.08);
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

        .vdt-hero {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border-radius: 28px;
          border: 1px solid #E6D8C3;
        }

        /* Disable legacy pseudo backgrounds in favor of hardware-accelerated stage */
        .vdt-hero::before,
        .vdt-hero::after {
          display: none !important;
        }

        /* 
          =============================================================
          LAYER 1: STATIC VIENNA PALACE BACKDROP
          Palace remains 100% static when changing vehicles
          =============================================================
        */
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
          transform: translate3d(0, var(--palace-parallax, 0px), 0) scale(1.06);
          transform-origin: center center;
          will-change: transform;
        }

        .hero-palace-sheen {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            ellipse 65% 55% at 52% 40%,
            rgba(212, 175, 55, 0.14) 0%,
            rgba(198, 156, 80, 0.05) 45%,
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
            rgba(252, 250, 246, 0.94) 0%,
            rgba(252, 250, 246, 0.82) 20%,
            rgba(252, 250, 246, 0.44) 34%,
            rgba(252, 250, 246, 0.08) 47%,
            rgba(252, 250, 246, 0.00) 58%,
            rgba(252, 250, 246, 0.00) 100%
          );
        }

        /* 
          =============================================================
          LAYER 2: SIXT-STYLE MERCEDES VEHICLE CAROUSEL
          - Center-lower placement (matching existing hero composition)
          - Transparent-background studio vehicles with natural ground shadow
          - 700ms smooth fade + 24px horizontal slide, cubic-bezier(0.22, 1, 0.36, 1)
          - Calibrated scale & offset so V-Class & Sprinter clear the left text
          =============================================================
        */
        .hero-vehicle-stage {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          overflow: hidden;
        }

        .hero-vehicle-slide {
          position: absolute;
          bottom: 14px;
          left: 48%;
          transform: translateX(calc(-50% + var(--car-offset-x, 0px))) translate3d(0, var(--car-offset-y, 0px), 0) scale(var(--car-scale, 1));
          width: clamp(400px, 44vw, 640px);
          height: clamp(230px, 24vw, 350px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
          transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
                      transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, opacity;
        }

        .hero-vehicle-slide.active {
          opacity: 1;
          transform: translateX(calc(-50% + var(--car-offset-x, 0px))) translate3d(0, var(--car-offset-y, 0px), 0) scale(var(--car-scale, 1));
          z-index: 2;
        }

        /* Subtle 24px horizontal slide on vehicle change */
        .hero-vehicle-slide.exiting.slide-dir-next {
          opacity: 0;
          transform: translateX(calc(-50% + var(--car-offset-x, 0px))) translate3d(-24px, var(--car-offset-y, 0px), 0) scale(var(--car-scale, 1));
          z-index: 1;
        }

        .hero-vehicle-slide.exiting.slide-dir-prev {
          opacity: 0;
          transform: translateX(calc(-50% + var(--car-offset-x, 0px))) translate3d(24px, var(--car-offset-y, 0px), 0) scale(var(--car-scale, 1));
          z-index: 1;
        }

        .hero-vehicle-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center bottom;
          display: block;
          filter: drop-shadow(0 12px 24px rgba(23, 25, 28, 0.16));
        }

        /* 
          =============================================================
          SIXT-STYLE VEHICLE NAVIGATION CONTROLS
          - Bottom-center/right pill near car
          - Central card is clickable with micro-interaction to open 360 viewer
          - Champagne gold accents
          =============================================================
        */
        .hero-vehicle-nav-wrapper {
          position: absolute;
          bottom: 22px;
          left: 48%;
          transform: translateX(-50%);
          z-index: 15;
          pointer-events: auto;
        }

        .hero-vehicle-nav-pill {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid #E6D8C3;
          padding: 0.35rem 0.65rem;
          border-radius: 30px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          user-select: none;
        }

        .hero-vehicle-arrow-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid #E6D8C3;
          background: #FFFFFF;
          color: #17191C;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          flex-shrink: 0;
        }

        .hero-vehicle-arrow-btn:hover {
          background: #C69C50;
          color: #FFFFFF;
          border-color: #C69C50;
          transform: scale(1.06);
          box-shadow: 0 3px 10px rgba(198, 156, 80, 0.35);
        }

        .hero-vehicle-arrow-btn:active {
          transform: scale(0.96);
        }

        /* Central Clickable Vehicle Info Block */
        .hero-vehicle-info-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 0.4rem;
          min-width: 140px;
        }

        .hero-vehicle-info-block.clickable {
          cursor: pointer;
          border-radius: 12px;
          padding: 2px 8px;
          transition: all 0.2s ease;
          outline: none;
        }

        .hero-vehicle-info-block.clickable:hover {
          background: rgba(198, 156, 80, 0.10);
        }

        .hero-vehicle-info-block.clickable:focus-visible {
          box-shadow: 0 0 0 2px #C69C50;
        }

        .hero-vehicle-title-row {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .hero-vehicle-expand-hint {
          color: #C69C50;
          display: inline-flex;
          align-items: center;
          opacity: 0.65;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .hero-vehicle-info-block.clickable:hover .hero-vehicle-expand-hint {
          opacity: 1;
          transform: scale(1.15);
        }

        .hero-vehicle-badge-text {
          font-family: var(--font-heading);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C69C50;
          line-height: 1.1;
        }

        .hero-vehicle-title-text {
          font-family: var(--font-heading);
          font-size: 0.78rem;
          font-weight: 700;
          color: #17191C;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .hero-vehicle-dots-row {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .hero-vehicle-dot-btn {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D8D2C4;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .hero-vehicle-dot-btn.active {
          background: #C69C50;
          width: 16px;
          border-radius: 4px;
        }

        /* CONTENT */
        .vdt-inner {
          position: relative;
          z-index: 1;
        }

        /* BOOKING FORM */
        .vdt-form {
          position: relative;
          z-index: 2;
          background: #FFFFFF;
          box-shadow: 0 12px 35px rgba(0,0,0,0.10);
        }

        /* 6. Clean Two-Column Layout Grid (55% Left, 45% Right) */
        .hero-grid-layout {
          display: grid;
          grid-template-columns: 55% 45%;
          align-items: center;
          width: 100%;
          height: 100%;
          padding: 0 clamp(24px, 3.8vw, 48px);
          position: relative;
          z-index: 10;
        }

        /* Left Side Content Area (55%) */
        .hero-left-content {
          max-width: 470px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 12;
        }

        .hero-eyebrow-container {
          margin-bottom: 0.35rem;
        }

        .hero-eyebrow-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.15rem;
        }

        .hero-eyebrow-text {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #62666D;
        }

        .hero-eyebrow-line {
          width: 50px;
          height: 1px;
          background-color: #C69C50;
          opacity: 0.75;
        }

        .hero-eyebrow-sub {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #C69C50;
        }

        /* 5. Heading Typography: Desktop 58px, Laptop 52px, Tablet 44px, Mobile 36px */
        .hero-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 58px;
          line-height: 1.08;
          font-weight: 600;
          color: #17191C;
          letter-spacing: -0.015em;
          margin: 0 0 0.55rem 0;
        }

        .hero-heading-italic {
          color: #C69C50;
          font-style: italic;
          font-weight: 500;
          margin-right: 0.18em;
        }

        .hero-description {
          font-family: var(--font-body);
          font-size: 0.90rem;
          line-height: 1.5;
          color: #555962;
          max-width: 460px;
          margin: 0 0 0.75rem 0;
        }

        /* Features List: 2x2 Grid avoids overlap with the car's front bumper */
        .hero-features-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.35rem 0.85rem;
          margin-bottom: 0.85rem;
          max-width: 450px;
        }

        .hero-feature-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .hero-feature-icon-box {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid #C69C50;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C69C50;
          flex-shrink: 0;
        }

        .hero-feature-text {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 600;
          color: #17191C;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        /* CTA & Indicator */
        .hero-cta-wrapper {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #C69C50;
          color: #FFFFFF;
          border-radius: 28px;
          padding: 0.68rem 1.65rem;
          font-family: var(--font-heading);
          font-size: 0.80rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 5px 16px rgba(198, 156, 80, 0.32);
          transition: all 0.25s ease;
        }

        .hero-cta-btn:hover {
          background-color: #B58B3F;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(198, 156, 80, 0.45);
        }

        .hero-slider-counter {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.78rem;
          font-family: var(--font-heading);
        }

        .counter-active {
          font-weight: 800;
          color: #17191C;
        }

        .counter-bar {
          width: 32px;
          height: 2px;
          background-color: #C69C50;
          border-radius: 2px;
        }

        .counter-muted {
          color: #8E929B;
          font-weight: 500;
        }

        /* 
          4. Compact Booking Form
          - Desktop width: 460px
          - Padding: 24px
          - Border radius: 16px
          - Input height: 45px
          - Gap between fields: 14px
          - Booking button height: 52px
        */
        .hero-right-content {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .hero-compact-card {
          width: 100%;
          max-width: 460px;
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(232, 225, 213, 0.9);
          position: relative;
        }

        .hero-tabs-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.45rem;
          margin-bottom: 0.9rem;
        }

        .hero-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.55rem 0.25rem;
          border-radius: 8px;
          border: 1px solid #E8E4DC;
          background-color: #FFFFFF;
          color: #17191C;
          font-family: var(--font-heading);
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hero-tab-btn.active {
          border-color: #C69C50;
          background-color: #C69C50;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(198, 156, 80, 0.25);
        }

        .hero-tab-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-form-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .hero-field-label {
          display: block;
          font-family: var(--font-heading);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #62666D;
          margin-bottom: 0.3rem;
        }

        .hero-input-wrapper {
          position: relative;
        }

        .hero-field-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #C69C50;
          pointer-events: none;
        }

        .hero-custom-select,
        .hero-custom-input {
          width: 100%;
          height: 45px;
          background-color: #FFFFFF;
          border: 1px solid #E8E4DC;
          border-radius: 8px;
          padding: 0 0.65rem 0 1.95rem;
          font-family: var(--font-body);
          font-size: 0.81rem;
          color: #17191C;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .hero-custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2362666D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 11px;
        }

        .hero-custom-select:focus,
        .hero-custom-input:focus {
          border-color: #C69C50;
          box-shadow: 0 0 0 2px rgba(198, 156, 80, 0.15);
        }

        .hero-form-error {
          color: #DC2626;
          font-size: 0.78rem;
          font-family: var(--font-body);
          margin-bottom: 0.65rem;
          text-align: center;
        }

        .hero-quote-btn {
          width: 100%;
          height: 52px;
          background-color: #C69C50;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-family: var(--font-heading);
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(198, 156, 80, 0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          transition: all 0.25s ease;
        }

        .hero-quote-btn:hover {
          background-color: #B58B3F;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(198, 156, 80, 0.42);
        }

        .hero-reassurance-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 0.65rem;
          color: #62666D;
          font-size: 0.74rem;
          font-family: var(--font-body);
        }

        /* Bottom Floating Trust Bar (Preserved) */
        .hero-trust-container {
          width: 100%;
          max-width: 100%;
          padding: 0 35px;
          margin-bottom: 2rem;
        }

        .hero-trust-inner-card {
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 1rem 1.6rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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

        /* 
          =============================================================
          RESPONSIVE BREAKPOINTS (Laptop, Tablet, Mobile)
          =============================================================
        */

        /* Laptop (1024px - 1280px) */
        @media (max-width: 1280px) and (min-width: 1024px) {
          .hero-rounded-banner {
            height: clamp(520px, 44vw, 590px);
            margin: 18px 24px 25px 24px;
          }
          .hero-heading {
            font-size: 50px;
          }
          .hero-vehicle-slide {
            width: clamp(380px, 42vw, 560px);
            height: clamp(220px, 24vw, 320px);
            left: 48%;
            bottom: 12px;
          }
          .hero-vehicle-nav-wrapper {
            bottom: 18px;
            left: 48%;
          }
          .hero-compact-card {
            max-width: 430px;
            padding: 22px;
          }
        }

        /* Tablet (769px - 1023px): Keep vehicle centered, card on right */
        @media (max-width: 1023px) and (min-width: 769px) {
          .hero-rounded-banner {
            height: auto;
            min-height: 540px;
            margin: 16px 20px 24px 20px;
            border-radius: 24px;
            padding: 30px 0;
          }
          .hero-grid-layout {
            grid-template-columns: 1.05fr 0.95fr;
            gap: 20px;
            height: auto;
            padding: 0 24px;
          }
          .hero-left-content {
            max-width: 100%;
          }
          .hero-heading {
            font-size: 42px;
          }
          .hero-compact-card {
            max-width: 100%;
            padding: 20px 18px;
          }
          .hero-vehicle-slide {
            width: clamp(320px, 36vw, 440px);
            height: clamp(180px, 22vw, 250px);
            left: 46%;
            bottom: 10px;
          }
          .hero-vehicle-nav-wrapper {
            bottom: 12px;
            left: 46%;
          }
          .hero-vehicle-nav-pill {
            padding: 0.25rem 0.5rem;
            gap: 0.45rem;
          }
          .hero-vehicle-info-block {
            min-width: 110px;
          }
          .hero-vehicle-title-text {
            font-size: 0.72rem;
          }
          .hero-trust-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
          .hero-trust-bordered {
            border-left: none;
          }
        }

        /* Mobile (<= 768px): Strictly follow specified order:
           1. Hero heading, 2. Description, 3. Main CTA, 4. Vehicle showcase, 5. Booking form */
        @media (max-width: 768px) {
          .hero-rounded-banner {
            height: auto;
            min-height: unset;
            margin: 14px 12px 20px 12px;
            border-radius: 20px;
            padding: 24px 0 20px 0;
            display: flex;
            flex-direction: column;
            position: relative;
          }
          .hero-grid-layout {
            display: contents;
          }
          .hero-left-content {
            order: 1;
            max-width: 100%;
            padding: 0 16px;
            position: relative;
            z-index: 2;
          }
          .hero-heading {
            font-size: clamp(28px, 6.5vw, 36px);
            line-height: 1.15;
            margin-bottom: 0.65rem;
          }
          .hero-description {
            font-size: 0.88rem;
            line-height: 1.55;
            margin-bottom: 0.85rem;
          }
          .hero-features-grid {
            grid-template-columns: 1fr;
            gap: 0.45rem;
            margin-bottom: 1rem;
          }
          .hero-cta-wrapper {
            margin-bottom: 0.75rem;
          }
          .hero-vehicle-stage {
            order: 2;
            position: relative;
            inset: auto;
            width: 100%;
            height: clamp(160px, 45vw, 210px);
            margin: 8px 0 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            pointer-events: auto;
          }
          .hero-vehicle-slide {
            width: 94%;
            max-width: 380px;
            height: 100%;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 0;
          }
          .hero-vehicle-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center bottom;
          }
          .hero-vehicle-nav-wrapper {
            order: 3;
            position: relative;
            bottom: auto;
            left: auto;
            transform: none;
            display: flex;
            justify-content: center;
            margin: 2px 0 16px 0;
            z-index: 3;
          }
          .hero-vehicle-nav-pill {
            padding: 0.35rem 0.65rem;
            gap: 0.5rem;
          }
          .hero-vehicle-arrow-btn {
            width: 38px;
            height: 38px;
            min-width: 38px;
          }
          .hero-vehicle-info-block {
            min-width: 120px;
          }
          .hero-vehicle-title-text {
            font-size: 0.74rem;
          }
          .hero-right-content {
            order: 4;
            justify-content: stretch;
            padding: 0 16px;
            position: relative;
            z-index: 2;
            width: 100%;
          }
          .hero-compact-card {
            max-width: 100%;
            padding: 18px 14px;
            border-radius: 14px;
          }
          .hero-form-fields-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .hero-tabs-row {
            gap: 0.3rem;
          }
          .hero-tab-btn {
            font-size: 0.7rem;
            padding: 0.5rem 0.2rem;
          }
          .hero-palace-img {
            object-position: center 38%;
            transform: none !important;
            will-change: auto;
          }
          .hero-palace-sheen {
            display: none;
          }
          .hero-palace-gradient {
            background: linear-gradient(
              180deg,
              rgba(252, 250, 246, 0.94) 0%,
              rgba(252, 250, 246, 0.82) 30%,
              rgba(252, 250, 246, 0.35) 48%,
              rgba(252, 250, 246, 0.10) 65%,
              rgba(252, 250, 246, 0.35) 100%
            );
          }
          .hero-trust-container {
            padding: 0 12px;
            margin-bottom: 1.5rem;
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

        /* Respect accessibility preference: prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-palace-img {
            transform: none !important;
            will-change: auto;
          }
          .hero-vehicle-slide {
            transition: opacity 200ms ease !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>
    </div>
  );
}
