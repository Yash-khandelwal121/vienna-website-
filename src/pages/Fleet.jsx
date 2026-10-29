import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Shield,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Phone,
  MessageSquare,
  ChevronDown,
  Car,
  Compass,
  Clock,
  Award
} from 'lucide-react';
import { fleetData } from '../data/fleet';
import { siteConfig } from '../data/site';
import VehicleModal from '../components/VehicleModal';
import { useLanguage } from '../context/LanguageContext';
import { fetchPublicVehicles, sanitizeImageUrl } from '../services/api';

export default function Fleet() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fleetList, setFleetList] = useState(fleetData);

  useEffect(() => {
    let isMounted = true;
    async function loadFleet() {
      try {
        const live = await fetchPublicVehicles();
        if (isMounted && Array.isArray(live) && live.length > 0) {
          const merged = live.map((v) => {
            const staticMatch = fleetData.find((f) => f.id === v.vehicleId || f.id === v.id);
            const image = sanitizeImageUrl(v.image || v.transparentImage, staticMatch?.image || '/cars/s-class.png');
            const gallery = Array.isArray(v.gallery) && v.gallery.length > 0
              ? v.gallery
              : (Array.isArray(staticMatch?.gallery) && staticMatch.gallery.length > 0 ? staticMatch.gallery : [image]);
            const features = Array.isArray(v.features) && v.features.length > 0
              ? v.features
              : (staticMatch?.features || []);

            return {
              ...staticMatch,
              ...v,
              id: v.vehicleId || v.id,
              name: v.name,
              category: v.category,
              badge: v.badge || staticMatch?.badge || v.category,
              tagline: v.tagline || staticMatch?.tagline || '',
              description: v.shortDescription || staticMatch?.description || '',
              fullDesc: v.fullDescription || staticMatch?.fullDesc || '',
              passengers: v.passengers || staticMatch?.passengers || '3 Guests',
              luggage: v.luggage || staticMatch?.luggage || '2 Large Bags',
              ride: v.ride || staticMatch?.ride || 'AIRMATIC Suspension',
              image,
              gallery,
              features,
              angles: staticMatch?.angles || [v.transparentImage || v.mainImage || image],
              specs: staticMatch?.specs || [
                { label: 'Passenger Capacity', val: v.passengers || '3 Guests' },
                { label: 'Luggage Capacity', val: v.luggage || '2 Large Bags' },
                { label: 'Chassis & Ride', val: v.ride || 'AIRMATIC Suspension' },
                { label: 'Availability', val: v.availability || '24/7 Monitored' }
              ]
            };
          });
          setFleetList(merged);
        }
      } catch (e) {}
    }
    loadFleet();
    return () => { isMounted = false; };
  }, []);

  // Active vehicle state: defaults to Mercedes-Benz S-Class
  const sClassIndex = fleetList.findIndex((c) => c.id === 's-class');
  const [selectedIdx, setSelectedIdx] = useState(sClassIndex !== -1 ? sClassIndex : 0);
  const [activeAngleIdx, setActiveAngleIdx] = useState(0);

  // 360° Showroom modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Single-expand FAQ state
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  const showroomRef = useRef(null);
  const car = fleetList[selectedIdx] || fleetList[0] || fleetData[0];

  const handleSelectVehicle = (idx) => {
    setSelectedIdx(idx);
    setActiveAngleIdx(0);
  };

  const handleNextShowroomCar = () => {
    setSelectedIdx((prev) => (prev + 1) % fleetList.length);
    setActiveAngleIdx(0);
  };

  const handlePrevShowroomCar = () => {
    setSelectedIdx((prev) => (prev - 1 + fleetList.length) % fleetList.length);
    setActiveAngleIdx(0);
  };

  // PART 7.9 & PART 10: Seamless Fleet Page Booking Integration
  const handleRequestVehicle = (vehicleName = car.name) => {
    try {
      sessionStorage.setItem('vdt_selected_vehicle', vehicleName);
    } catch (e) {
      // ignore
    }
    navigate('/');
    setTimeout(() => {
      const bookingCard = document.getElementById('hero-booking-card');
      if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const scrollToShowroom = (idx) => {
    setSelectedIdx(idx);
    setActiveAngleIdx(0);
    if (showroomRef.current) {
      showroomRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fleetFaqs = [
    {
      question: 'Can I choose a specific vehicle when I book?',
      answer:
        'Yes. Let us know your preferred vehicle class (E-Class, S-Class, V-Class, Sprinter, or Armored) when requesting a quote, and we will confirm guaranteed assignment.'
    },
    {
      question: 'How do I book the Sprinter or an armored vehicle?',
      answer:
        'Both vehicles are available upon special advance request. Contact our 24/7 dispatch with your itinerary, passenger count, and security specifications.'
    },
    {
      question: 'Are these vehicles used for both airport transfers and day trips?',
      answer:
        'Yes. The identical flagship fleet is deployed across all our services, from 25-minute airport transfers to multi-day grand tours across Europe.'
    },
    {
      question: 'How is the fleet maintained?',
      answer:
        'Every vehicle undergoes daily multi-point inspections, comprehensive interior deep cleaning, acoustic checks, and authorized Mercedes-Benz dealership servicing.'
    }
  ];

  const luxuryFeatures = [
    {
      title: 'Professional Chauffeur Service',
      desc: 'Uniformed, multilingual chauffeurs with extensive local expertise and discrete etiquette.',
      icon: Award
    },
    {
      title: 'Premium Vehicle Interiors',
      desc: 'Handcrafted leather seating, multi-zone acoustic glass, and ambient climate control.',
      icon: Sparkles
    },
    {
      title: 'Comfortable Private Travel',
      desc: 'Smooth pneumatic ride suspensions tailored for relaxing long-distance European journeys.',
      icon: Car
    },
    {
      title: 'Airport Transfer Convenience',
      desc: 'Automated live flight tracking, complimentary waiting time, and terminal meet-and-greet.',
      icon: Clock
    },
    {
      title: 'Personalized Transportation',
      desc: 'Flexible custom itineraries with bottled mineral water, Wi-Fi, and electronic device charging.',
      icon: Compass
    },
    {
      title: 'Group Travel Options',
      desc: 'Executive conference seating in our V-Class and VIP Sprinter vans for families and corporate teams.',
      icon: Users
    }
  ];

  return (
    <div style={{ position: 'relative', backgroundColor: 'var(--bg-main)' }}>
      {/* =========================================================================
          7.1 HERO SECTION: Cinematic full-width fleet hero banner
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          paddingTop: 'clamp(5.5rem, 8vw, 6.5rem)',
          paddingBottom: 'clamp(2.5rem, 5vw, 4.5rem)',
          backgroundColor: '#0E1216',
          color: '#FFFFFF',
          overflow: 'hidden',
          borderBottom: '1px solid #E6D8C3',
          minHeight: 'clamp(520px, 37.5vw, 700px)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Background High-Resolution Panoramic Photography */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            backgroundImage: "url('/images/luxury-fleet-banner-premium.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Ambient Dark Gradient on Left for Razor-Sharp Text Readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background:
              'linear-gradient(to right, rgba(14, 18, 22, 0.96) 0%, rgba(14, 18, 22, 0.90) 36%, rgba(14, 18, 22, 0.6) 52%, rgba(14, 18, 22, 0) 72%)',
            pointerEvents: 'none'
          }}
        />

        {/* Mobile / Tablet Extra Contrast Vignette */}
        <div
          className="fleet-mobile-vignette"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            pointerEvents: 'none'
          }}
        />

        {/* Top Left Golden Curved Flourish Accent */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '280px',
            height: '280px',
            pointerEvents: 'none',
            zIndex: 4,
            opacity: 0.6
          }}
          viewBox="0 0 280 280"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M -40 220 C 70 190, 180 120, 240 -40"
            stroke="#C69C50"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
          <path
            d="M -50 260 C 80 220, 200 140, 270 -40"
            stroke="#C69C50"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
        </svg>

        {/* Content Container */}
        <div className="container-wide" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
          <div style={{ maxWidth: '600px' }}>
            {/* Small Eyebrow Heading */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: '#C69C50',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}
            >
              <span>AUSTRIAN CHAUFFEUR EXCELLENCE</span>
              <span style={{ width: '36px', height: '1px', backgroundColor: '#C69C50' }} />
            </div>

            {/* Main Heading */}
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.4rem, 4.4vw, 3.8rem)',
                fontWeight: 600,
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                color: '#FFFFFF'
              }}
            >
              Our Luxury{' '}
              <span
                style={{
                  color: '#C69C50',
                  fontStyle: 'italic',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Fleet
              </span>
            </h1>

            {/* Description */}
            <p
              style={{
                color: '#E0DFDC',
                fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                lineHeight: 1.7,
                marginBottom: '2rem',
                maxWidth: '540px'
              }}
            >
              {t('fleet_hero_desc')}
            </p>

            {/* 3 Styled Feature Badges */}
            <div
              className="fleet-hero-badges"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1.25rem',
                marginBottom: '2rem'
              }}
            >
              {/* Badge 1: Diamond */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C69C50"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M2 9h20" />
                  <path d="M10 3l-2 6 4 12 4-12-2-6" />
                </svg>
                <span style={{ fontSize: '0.88rem', color: '#FAF8F4', fontWeight: 600, lineHeight: 1.3 }}>
                  {t('fleet_hl_1')}
                </span>
              </div>

              {/* Badge 2: Chauffeur Hat / Professional Chauffeurs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C69C50"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 13h18" />
                  <path d="M5 13V9a7 7 0 0 1 14 0v4" />
                  <path d="M2 13c1 2 4 3 10 3s9-1 10-3" />
                  <circle cx="12" cy="19" r="2" />
                  <path d="M9 19h6" />
                </svg>
                <span style={{ fontSize: '0.88rem', color: '#FAF8F4', fontWeight: 600, lineHeight: 1.3 }}>
                  {t('fleet_hl_2')}
                </span>
              </div>

              {/* Badge 3: Shield Check / For Every Journey */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C69C50"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span style={{ fontSize: '0.88rem', color: '#FAF8F4', fontWeight: 600, lineHeight: 1.3 }}>
                  {t('fleet_hl_3')}
                </span>
              </div>
            </div>

            {/* Clickable CTA Button */}
            <div>
              <button
                id="fleet-hero-s-class-cta"
                type="button"
                onClick={() => scrollToShowroom(sClassIndex)}
                aria-label="Explore Mercedes-Benz S-Class Flagship in Showroom"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.72rem 1.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(14, 18, 22, 0.55)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1.5px solid #C69C50',
                  color: '#C69C50',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.28s ease',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#C69C50';
                  e.currentTarget.style.color = '#17191C';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(198, 156, 80, 0.55)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(14, 18, 22, 0.55)';
                  e.currentTarget.style.color = '#C69C50';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Mercedes-Benz S-Class Flagship</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7.2 VEHICLE SELECTION TABS: 5 Premium Cards
          ========================================================================= */}
      <section
        style={{
          backgroundColor: '#FAF8F4',
          borderBottom: '1px solid #E6D8C3',
          padding: '1.5rem 0'
        }}
      >
        <div className="container-wide">
          <div className="fleet-tabs-grid">
            {fleetList.map((item, idx) => {
              const isActive = selectedIdx === idx;
              const isArmored = item.id === 'armored';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectVehicle(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.9rem 1.15rem',
                    backgroundColor: '#FFFFFF',
                    border: isActive ? '2px solid #C69C50' : '1px solid #E6D8C3',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: isActive
                      ? '0 8px 24px rgba(198, 156, 80, 0.16)'
                      : '0 2px 8px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.25s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = '#C69C50';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = '#E6D8C3';
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '64px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: 'transparent',
                      borderRadius: '6px',
                      padding: '2px'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: isActive ? '#C69C50' : '#17191C',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: isArmored ? '#A0782C' : '#8E929B',
                          fontWeight: isArmored ? 700 : 500
                        }}
                      >
                        {isArmored ? 'On Request' : item.category}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#C69C50',
                        boxShadow: '0 0 8px #C69C50'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7.3 & 7.4 INTERACTIVE MAIN VEHICLE SHOWCASE (60% / 40%)
          ========================================================================= */}
      <section
        ref={showroomRef}
        id="fleet-showroom"
        style={{
          padding: 'clamp(3rem, 5vw, 5rem) 0',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E6D8C3'
        }}
      >
        <div className="container-wide">
          <div className="fleet-showroom-grid">
            {/* LEFT SIDE — 60%: Large Vehicle Display + Gallery Thumbnails */}
            <div>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#FAF8F4',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #E6D8C3',
                  padding: 'clamp(2rem, 4vw, 3.5rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '440px',
                  boxShadow: '0 16px 45px rgba(23, 25, 28, 0.05)'
                }}
              >
                {/* Prev / Next Showroom Arrows */}
                <button
                  type="button"
                  onClick={handlePrevShowroomCar}
                  aria-label="Previous Mercedes vehicle"
                  style={{
                    position: 'absolute',
                    left: '1.25rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E6D8C3',
                    color: '#17191C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C69C50';
                    e.currentTarget.style.color = '#C69C50';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E6D8C3';
                    e.currentTarget.style.color = '#17191C';
                  }}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleNextShowroomCar}
                  aria-label="Next Mercedes vehicle"
                  style={{
                    position: 'absolute',
                    right: '1.25rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E6D8C3',
                    color: '#17191C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C69C50';
                    e.currentTarget.style.color = '#C69C50';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E6D8C3';
                    e.currentTarget.style.color = '#17191C';
                  }}
                >
                  <ChevronRight size={20} />
                </button>

                {/* Main Vehicle Image */}
                <div style={{ width: '100%', maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
                  <img
                    key={`${car.id}-${activeAngleIdx}`}
                    src={
                      car.gallery && car.gallery[activeAngleIdx]
                        ? car.gallery[activeAngleIdx]
                        : car.image
                    }
                    alt={car.name}
                    style={
                      activeAngleIdx === 0
                        ? {
                            width: '100%',
                            maxHeight: '340px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.12))',
                            transition: 'opacity 0.3s ease'
                          }
                        : {
                            width: '100%',
                            maxHeight: '340px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
                            transition: 'opacity 0.3s ease'
                          }
                    }
                  />
                </div>

                {/* Interactive 360° Showroom Launch Button */}
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  style={{
                    marginTop: '1.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #C69C50',
                    borderRadius: '25px',
                    padding: '0.55rem 1.25rem',
                    color: '#C69C50',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(198, 156, 80, 0.15)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#C69C50';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#C69C50';
                  }}
                >
                  <RotateCcw size={15} />
                  <span>{t('explore_viewer')}</span>
                </button>
              </div>

              {/* Gallery Angle Thumbnails (front, side, interior) */}
              {Array.isArray(car?.gallery) && car.gallery.length > 1 && (
                <div className="fleet-gallery-strip">
                  {car.gallery.map((imgUrl, angleIdx) => (
                    <button
                      key={angleIdx}
                      type="button"
                      onClick={() => setActiveAngleIdx(angleIdx)}
                      style={{
                        width: '74px',
                        height: '52px',
                        borderRadius: '8px',
                        border: activeAngleIdx === angleIdx ? '2px solid #C69C50' : '1px solid #E6D8C3',
                        padding: '3px',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`${car.name} view ${angleIdx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDE — 40%: Vehicle Information & Booking */}
            <div>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: car.id === 'armored' ? '#17191C' : 'rgba(198, 156, 80, 0.12)',
                  color: car.id === 'armored' ? '#C69C50' : '#A0782C',
                  border: '1px solid rgba(198, 156, 80, 0.35)',
                  borderRadius: '20px',
                  padding: '0.35rem 0.95rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem'
                }}
              >
                {car.badge || car.category}
              </div>

              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                  fontWeight: 600,
                  color: '#17191C',
                  lineHeight: 1.2,
                  marginBottom: '0.4rem'
                }}
              >
                {car.name}
              </h2>

              <div
                style={{
                  color: '#C69C50',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  letterSpacing: '0.04em',
                  marginBottom: '1.25rem'
                }}
              >
                {car.tagline}
              </div>

              <p style={{ color: '#62666D', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                {car.description}
              </p>

              {/* Verified Capacity Specs Strip */}
              <div className="fleet-specs-strip">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#8E929B', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    <Users size={14} style={{ color: '#C69C50' }} />
                    <span>{t('specs_passengers')}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.98rem', color: '#17191C', marginTop: '0.2rem' }}>
                    {car.passengers}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#8E929B', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    <Briefcase size={14} style={{ color: '#C69C50' }} />
                    <span>{t('specs_luggage')}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.98rem', color: '#17191C', marginTop: '0.2rem' }}>
                    {car.luggage}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#8E929B', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    <Shield size={14} style={{ color: '#C69C50' }} />
                    <span>{t('specs_transmission')}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.98rem', color: '#17191C', marginTop: '0.2rem' }}>
                    {car.transmission}
                  </div>
                </div>
              </div>

              {/* Key Features Checklist */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8E929B', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Confirmed Luxury Specifications
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(Array.isArray(car?.features) ? car.features : []).map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(198, 156, 80, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        <Check size={11} style={{ color: '#C69C50' }} />
                      </div>
                      <span style={{ fontSize: '0.92rem', color: '#17191C', lineHeight: 1.5 }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleRequestVehicle(car.name)}
                  className="btn btn-primary"
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '0.92rem',
                    fontWeight: 700
                  }}
                >
                  <span>{t('fleet_request_btn')}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.9rem 1.8rem',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}
                >
                  <span>{t('fleet_view_features_btn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7.5 COMPLETE FLEET OVERVIEW: 5 Vehicle Cards
          ========================================================================= */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 5.5rem) 0',
          backgroundColor: '#FAF8F4',
          borderBottom: '1px solid #E6D8C3'
        }}
      >
        <div className="container-wide">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ justifyContent: 'center', color: '#C69C50' }}>
              OUR VEHICLE SELECTION
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2rem, 3.5vw, 2.85rem)',
                fontWeight: 500,
                color: '#17191C',
                lineHeight: 1.2,
                marginBottom: '0.75rem'
              }}
            >
              {t('fleet_explore_heading')}
            </h2>
            <p style={{ color: '#62666D', fontSize: '1.05rem', lineHeight: 1.6 }}>
              {t('fleet_explore_sub')}
            </p>
          </div>

          {/* 5 Vehicle Cards Grid */}
          <div className="fleet-cards-grid">
            {fleetList.map((item, idx) => {
              const isArmored = item.id === 'armored';
              const isSelected = selectedIdx === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => scrollToShowroom(idx)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: isSelected ? '2px solid #C69C50' : '1px solid #E6D8C3',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 16px 36px rgba(198, 156, 80, 0.15)'
                      : '0 8px 24px rgba(23, 25, 28, 0.04)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  className="fleet-overview-card"
                >
                  {isArmored && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        backgroundColor: '#17191C',
                        color: '#C69C50',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase'
                      }}
                    >
                      {t('fleet_on_request')}
                    </div>
                  )}

                  <div>
                    <div
                      style={{
                        height: '160px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.08))'
                        }}
                      />
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#C69C50', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                      {item.category}
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.35rem',
                        fontWeight: 600,
                        color: '#17191C',
                        marginBottom: '0.65rem'
                      }}
                    >
                      {item.name}
                    </h3>

                    <p
                      style={{
                        color: '#62666D',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.description}
                    </p>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid #F0ECE4',
                      paddingTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.82rem', color: '#8E929B' }}>
                      <span>👥 {item.passengers}</span>
                      <span>🧳 {item.luggage}</span>
                    </div>

                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#C69C50' : '#FAF8F4',
                        color: isSelected ? '#FFFFFF' : '#C69C50',
                        border: '1px solid #E6D8C3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7.6 PREMIUM FEATURES: Confirmed Luxury Features Grid
          ========================================================================= */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 5rem) 0',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E6D8C3'
        }}
      >
        <div className="container-wide">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ justifyContent: 'center', color: '#C69C50' }}>
              UNCOMPROMISED STANDARDS
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2rem, 3.2vw, 2.65rem)',
                fontWeight: 500,
                color: '#17191C',
                lineHeight: 1.2
              }}
            >
              The Vienna Day Trip Difference.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {luxuryFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#FAF8F4',
                    border: '1px solid #E6D8C3',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E6D8C3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#C69C50',
                      boxShadow: '0 4px 12px rgba(198, 156, 80, 0.1)'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.18rem',
                        fontWeight: 600,
                        color: '#17191C',
                        marginBottom: '0.4rem'
                      }}
                    >
                      {feat.title}
                    </h3>
                    <p style={{ color: '#62666D', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7.7 CUSTOM FLEET CTA: Dark-Charcoal Banner
          ========================================================================= */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 5rem) 0',
          backgroundColor: '#17191C',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#C69C50',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}
          >
            <span>TAILORED PRIVATE LOGISTICS</span>
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 500,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '1rem'
            }}
          >
            {t('fleet_custom_cta_title')}
          </h2>

          <p
            style={{
              color: '#E0DFDC',
              fontSize: '1.08rem',
              maxWidth: '680px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.7
            }}
          >
            {t('fleet_custom_cta_desc')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/contact-us-i/')}
              className="btn btn-primary"
              style={{
                padding: '0.95rem 2.25rem',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <span>{t('fleet_contact_team')}</span>
            </button>

            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #C69C50',
                color: '#FAF8F4',
                borderRadius: '30px',
                padding: '0.95rem 2.25rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageSquare size={16} style={{ color: '#C69C50' }} />
              <span>WhatsApp Dispatch 24/7</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7.8 FAQ SECTION: Premium Accordion (Single-expand)
          ========================================================================= */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 5.5rem) 0',
          backgroundColor: '#FAF8F4'
        }}
      >
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="eyebrow" style={{ justifyContent: 'center', color: '#C69C50' }}>
              CLEAR & TRANSPARENT
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 500,
                color: '#17191C',
                lineHeight: 1.2,
                marginBottom: '0.65rem'
              }}
            >
              {t('fleet_faq_title')}
            </h2>
            <p style={{ color: '#62666D', fontSize: '1rem', margin: 0 }}>
              {t('fleet_faq_sub')}
            </p>
          </div>

          {/* Accordion Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fleetFaqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E6D8C3',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    boxShadow: isOpen
                      ? '0 8px 24px rgba(23, 25, 28, 0.05)'
                      : '0 2px 8px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.35rem 1.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: '1rem'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.12rem',
                        fontWeight: 600,
                        color: isOpen ? '#C69C50' : '#17191C',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {faq.question}
                    </span>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isOpen ? '#FAF8F4' : '#FFFFFF',
                        border: '1px solid #E6D8C3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#C69C50',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.25s ease'
                      }}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.75rem 1.5rem',
                        color: '#62666D',
                        fontSize: '0.98rem',
                        lineHeight: 1.75,
                        borderTop: '1px solid #F0ECE4',
                        paddingTop: '1rem'
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reusable 360° Showroom Modal */}
      {modalOpen && (
        <VehicleModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          vehicle={car}
          vehicles={fleetList}
          currentCarIdx={selectedIdx}
          onSelectCar={handleSelectVehicle}
          onBookVehicle={(selectedCar) => {
            setModalOpen(false);
            handleRequestVehicle(selectedCar.name || selectedCar.bookingValue);
          }}
        />
      )}

      <style>{`
        .fleet-hero-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: clamp(1.5rem, 3vw, 3rem);
          align-items: center;
        }

        @media (max-width: 900px) {
          .fleet-mobile-vignette {
            background: linear-gradient(to right, rgba(14, 18, 22, 0.95) 0%, rgba(14, 18, 22, 0.88) 70%, rgba(14, 18, 22, 0.6) 100%);
          }
        }
        @media (max-width: 600px) {
          .fleet-mobile-vignette {
            background: rgba(14, 18, 22, 0.82);
          }
          .fleet-hero-badges {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.85rem !important;
            margin-bottom: 1.5rem !important;
          }
        }

        .fleet-tabs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));
          gap: 1rem;
        }

        .fleet-showroom-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(2rem, 4vw, 4.5rem);
          align-items: center;
        }

        @media (max-width: 1024px) {
          .fleet-showroom-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        .fleet-gallery-strip {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          margin-top: 1.25rem;
          overflow-x: auto;
          max-width: 100%;
          padding: 4px 2px;
          -webkit-overflow-scrolling: touch;
        }

        .fleet-specs-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
          padding: 1rem;
          background-color: #FAF8F4;
          border-radius: 12px;
          border: 1px solid #E6D8C3;
          margin-bottom: 1.75rem;
        }

        @media (max-width: 520px) {
          .fleet-specs-strip {
            grid-template-columns: 1fr;
            gap: 0.65rem;
          }
        }

        .fleet-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 1.75rem;
        }

        @media (max-width: 480px) {
          .fleet-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .fleet-overview-card:hover {
          border-color: #C69C50 !important;
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(198, 156, 80, 0.16) !important;
        }
      `}</style>
    </div>
  );
}
