import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import DestinationCarousel from '../components/DestinationCarousel';
import PremiumServices from '../components/PremiumServices';
import VehicleShowcase from '../components/VehicleShowcase';
import TimelineSection from '../components/TimelineSection';
import DestinationGallery from '../components/DestinationGallery';
import ReviewsSlider from '../components/ReviewsSlider';
import { siteConfig, marqueeItems } from '../data/site';

export default function Home() {
  const scrollToBooking = () => {
    const el = document.getElementById('hero-booking-card') || document.getElementById('booking-bar');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* =========================================================================
          HERO BANNER (Reference-Matched Luxury Chauffeur Experience)
          ========================================================================= */}
      <HeroBanner />

      {/* Animated Marquee Ticker */}
      <div
        className="marquee-container reveal-on-scroll"
        role="region"
        aria-label="Service Destinations Marquee"
      >
        <div className="marquee-content">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => {
            const label = typeof item === 'string' ? item : item.label;
            const href = typeof item === 'string' ? '/our-services/' : item.href;
            return (
              <span key={idx} className="marquee-item-wrapper">
                <Link
                  to={href}
                  className="marquee-item"
                  title={`View ${label}`}
                  aria-label={`View ${label}`}
                >
                  <span className="marquee-item-text">{label}</span>
                </Link>
                <span className="marquee-dot" aria-hidden="true" />
              </span>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: PREMIUM DESTINATIONS (Horizontal Carousel)
          ========================================================================= */}
      <section className="section section-dark reveal-on-scroll">
        <div className="container-wide">
          <DestinationCarousel />
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OUR PREMIUM SERVICES (European Luxury Arch Showcase)
          ========================================================================= */}
      <PremiumServices />

      {/* =========================================================================
          SECTION 6: LUXURY FLEET (2x2 Grid)
          ========================================================================= */}
      <VehicleShowcase />

      {/* =========================================================================
          SECTION 7: HOW IT WORKS (Animated Horizontal Timeline)
          ========================================================================= */}
      <section className="section section-secondary reveal-on-scroll">
        <div className="container">
          <TimelineSection />
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: ABOUT US (Editorial Split Layout)
          ========================================================================= */}
      <section className="section section-dark reveal-on-scroll">
        <div className="container-wide">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 'clamp(2.5rem, 5vw, 5rem)',
              alignItems: 'center'
            }}
          >
            {/* Chauffeur & Mercedes Image */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  position: 'relative',
                  height: 'clamp(340px, 55vw, 560px)'
                }}
              >
                <img
                  src="https://viennadaytrip.com/wp-content/uploads/2026/03/service-VIP-chauffeur-3.jpg"
                  alt="Professional Vienna Chauffeur and Mercedes-Benz"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.1)'
                  }}
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(6, 7, 5, 0.95) 12%, rgba(6, 7, 5, 0.2) 60%, transparent 100%)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '2rem',
                    right: '2rem',
                    padding: '1.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(197, 160, 89, 0.35)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div style={{ color: 'var(--text-gold)', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                    LICENSED OPERATOR SINCE 2019
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    HARMEET SINGH CHEEMA
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                    Founder & Managing Director • Official Partner of Vienna Chamber of Commerce (WKO)
                  </div>
                </div>
              </div>
            </div>

            {/* Story Text & Statistics */}
            <div>
              <div className="eyebrow">OUR HERITAGE & MISSION</div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(1.75rem, 2.8vw, 2.35rem)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  marginBottom: '1.15rem',
                  color: 'var(--text-primary)'
                }}
              >
                Vienna's Trusted Chauffeur & Private Tour Company.
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1rem' }}>
                Vienna Day Trip started as a private chauffeur service focused on one thing: getting Vienna’s visitors where they need to go, comfortably and on time, in a private Mercedes rather than a shared shuttle or public tour bus.
              </p>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                Working with foreign embassies, leading five-star hotels, cruise companies, and discerning independent travelers, we provide luxury airport transfers, private sightseeing, day trips across Austria, Hungary, Czechia, and Slovakia, and secure diplomatic convoys.
              </p>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                {siteConfig.stats.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      padding: '1.15rem',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/about-vienna-day-trip/" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '0.88rem' }}>
                <span>READ OUR FULL STORY</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: PREMIUM 2x2 GALLERY
          ========================================================================= */}
      <DestinationGallery />

      {/* =========================================================================
          SECTION 10: CUSTOMER REVIEWS (Horizontal Testimonial Slider)
          ========================================================================= */}
      <section className="section section-dark reveal-on-scroll">
        <div className="container-wide">
          <ReviewsSlider />
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: FINAL CTA (White Pearl & Champagne Gold)
          ========================================================================= */}
      <section
        className="reveal-on-scroll"
        style={{
          padding: 'clamp(2.8rem, 4.5vw, 4.25rem) 0',
          position: 'relative',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          overflow: 'hidden',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197, 160, 89, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>YOUR BESPOKE EXPEDITION AWAITS</div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              marginBottom: '1rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}
          >
            Your Next Journey<br />
            <span className="text-accent-gradient" style={{ fontStyle: 'italic', fontWeight: 600 }}>
              Starts Here.
            </span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', maxWidth: '620px', margin: '0 auto 1.65rem', lineHeight: '1.65' }}>
            Whether you require a seamless airport meet-and-greet, an executive roadshow, or a grand tour to Hallstatt and Budapest, experience the pinnacle of European chauffeuring.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={scrollToBooking}
              className="btn btn-primary"
              style={{ padding: '0.95rem 2.2rem', fontSize: '0.95rem' }}
            >
              <span>PLAN YOUR JOURNEY</span>
              <ArrowRight size={16} />
            </button>

            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '0.95rem 2rem', fontSize: '0.95rem' }}
            >
              <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
              <span>WHATSAPP CONCIERGE</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
