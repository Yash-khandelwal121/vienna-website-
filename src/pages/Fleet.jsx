import React, { useState } from 'react';
import { Users, Briefcase, Zap, Shield, Check, ArrowRight, MessageSquare } from 'lucide-react';
import { fleetData } from '../data/fleet';
import { siteConfig } from '../data/site';
import BookingWidget from '../components/BookingWidget';
import FaqAccordion from '../components/FaqAccordion';

export default function Fleet() {
  const [selectedIdx, setSelectedIdx] = useState(1); // Mercedes S-Class
  const car = fleetData[selectedIdx];

  const fleetFaqs = [
    {
      question: "Can I choose a specific vehicle when I book?",
      answer: "Yes. Let us know your preferred vehicle class (E-Class, S-Class, V-Class, Sprinter, or Armored) when requesting a quote, and we will confirm guaranteed assignment."
    },
    {
      question: "How do I book the Sprinter or an armored vehicle?",
      answer: "Both vehicles are available upon special advance request. Contact our 24/7 dispatch with your itinerary, passenger count, and security specifications."
    },
    {
      question: "Are these vehicles used for both airport transfers and day trips?",
      answer: "Yes. The identical flagship fleet is deployed across all our services, from 25-minute airport transfers to multi-day grand tours across Europe."
    },
    {
      question: "How is the fleet maintained?",
      answer: "Every vehicle undergoes daily multi-point inspections, comprehensive interior deep cleaning, acoustic checks, and authorized Mercedes-Benz dealership servicing."
    }
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Fleet Hero */}
      <section
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '4rem',
          backgroundColor: 'var(--bg-main)',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <img
            src="https://viennadaytrip.com/wp-content/uploads/2026/03/S-class-.png"
            alt="Mercedes-Benz S-Class Flagship"
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0.3) contrast(1.2)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #FFFFFF 15%, rgba(255, 255, 255, 0.8) 70%, rgba(255, 255, 255, 0.95) 100%)' }} />
        </div>

        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow">AUSTRIAN LIMOUSINE EXCELLENCE</div>
          <h1 className="heading-xl" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            THE FLEET. UNCOMPROMISED.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '720px', lineHeight: '1.65' }}>
            Our fleet represents the very highest standards of German luxury automotive engineering — pristine Mercedes-Benz sedans, VIP executive vans, and specialized armored security vehicles.
          </p>
        </div>
      </section>

      {/* Main Interactive Fleet Selector */}
      <section className="section section-dark">
        <div className="container-wide">
          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem',
              justifyContent: 'center'
            }}
          >
            {fleetData.map((item, idx) => {
              const active = selectedIdx === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '0.8rem 1.8rem',
                    borderRadius: 'var(--radius-full)',
                    border: active ? '1px solid rgba(197, 160, 89, 0.45)' : '1px solid rgba(0, 0, 0, 0.08)',
                    background: active ? 'linear-gradient(135deg, #DFC187 0%, #C5A059 50%, #967425 100%)' : '#F3F4F7',
                    color: active ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: active ? '0 4px 18px rgba(197, 160, 89, 0.35)' : 'none'
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Active Vehicle Deep Dive */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2rem, 5vw, 4rem)',
              marginBottom: '5rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '4rem',
                alignItems: 'center',
                marginBottom: '3.5rem'
              }}
            >
              {/* Left Details */}
              <div>
                <span className="pill-badge">{car.badge}</span>
                <div style={{ color: 'var(--text-gold)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.04em', marginTop: '0.75rem' }}>
                  {car.tagline}
                </div>
                <h2 className="heading-xl" style={{ margin: '0.5rem 0 1.25rem', color: 'var(--text-primary)' }}>
                  {car.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1.75rem' }}>
                  {car.description}
                </p>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 0, 0, 0.06)', marginBottom: '2rem' }}>
                  <div style={{ color: 'var(--text-gold)', fontSize: '0.82rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 700 }}>
                    IDEAL APPLICATION
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {car.idealFor}
                  </div>
                </div>

                {/* Specs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>CAPACITY</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{car.passengers}</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>LUGGAGE</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{car.luggage}</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>SUSPENSION</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{car.transmission}</div>
                  </div>
                </div>

                <a
                  href={`${siteConfig.whatsappUrl}&text=Hello!%20I%20wish%20to%20reserve%20the%20${encodeURIComponent(car.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <MessageSquare size={16} />
                  <span>RESERVE {car.name}</span>
                </a>
              </div>

              {/* Right Big Vehicle Shot */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                  src={car.image}
                  alt={car.name}
                  style={{
                    width: '100%',
                    maxHeight: '440px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.85))'
                  }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Interior & Cabin Features Gallery */}
            <div>
              <div className="eyebrow">CABIN APPOINTMENTS & INTERIORS</div>
              <h3 className="heading-md" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                LUXURY INTERIOR SHOWCASE
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}
              >
                {car.gallery.map((imgUrl, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      height: '240px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${car.name} detail ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* Bullet Features */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {car.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div style={{ maxWidth: '880px', margin: '0 auto 5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>FLEET FAQ</div>
              <h2 className="heading-lg">QUESTIONS ABOUT OUR LUXURY VEHICLES.</h2>
            </div>
            <FaqAccordion faqs={fleetFaqs} />
          </div>

          {/* Booking Widget Anchor */}
          <div>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>INSTANT RESERVATION</div>
              <h2 className="heading-lg">RESERVE YOUR MERCEDES-BENZ.</h2>
            </div>
            <BookingWidget />
          </div>
        </div>
      </section>
    </div>
  );
}
