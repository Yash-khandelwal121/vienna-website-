import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import DestinationCarousel from '../components/DestinationCarousel';
import BentoServices from '../components/BentoServices';
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
      <div className="marquee-container">
        <div className="marquee-content">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="marquee-item">
              {item}
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: PREMIUM DESTINATIONS (Horizontal Carousel)
          ========================================================================= */}
      <section className="section section-dark">
        <div className="container-wide">
          <DestinationCarousel />
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OUR SERVICES (2x2 Grid)
          ========================================================================= */}
      <BentoServices />

      {/* =========================================================================
          SECTION 6: LUXURY FLEET (2x2 Grid)
          ========================================================================= */}
      <VehicleShowcase />

      {/* =========================================================================
          SECTION 7: HOW IT WORKS (Animated Horizontal Timeline)
          ========================================================================= */}
      <section className="section section-secondary">
        <div className="container">
          <TimelineSection />
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: ABOUT US (Editorial Split Layout)
          ========================================================================= */}
      <section className="section section-dark">
        <div className="container-wide">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
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
                  height: '560px'
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
              <h2 className="heading-xl" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                VIENNA'S TRUSTED CHAUFFEUR & PRIVATE TOUR COMPANY.
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.75', marginBottom: '1.35rem' }}>
                Vienna Day Trip started as a private chauffeur service focused on one thing: getting Vienna’s visitors where they need to go, comfortably and on time, in a private Mercedes rather than a shared shuttle or public tour bus.
              </p>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>
                Working with foreign embassies, leading five-star hotels, cruise companies, and discerning independent travelers, we provide luxury airport transfers, private sightseeing, day trips across Austria, Hungary, Czechia, and Slovakia, and secure diplomatic convoys.
              </p>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1.25rem',
                  marginBottom: '2.5rem'
                }}
              >
                {siteConfig.stats.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      padding: '1.35rem',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/about-vienna-day-trip/" className="btn btn-primary">
                <span>READ OUR FULL STORY</span>
                <ArrowRight size={16} />
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
      <section className="section section-dark">
        <div className="container-wide">
          <ReviewsSlider />
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: FINAL CTA (White Pearl & Champagne Gold)
          ========================================================================= */}
      <section
        style={{
          padding: 'clamp(5rem, 10vw, 8.5rem) 0',
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
            width: '800px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197, 160, 89, 0.14) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>YOUR BESPOKE EXPEDITION AWAITS</div>
          <h2 className="heading-massive" style={{ marginBottom: '1.75rem', color: 'var(--text-primary)' }}>
            YOUR NEXT JOURNEY<br />
            <span className="text-accent-gradient">STARTS HERE.</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '640px', margin: '0 auto 2.75rem', lineHeight: '1.7' }}>
            Whether you require a seamless airport meet-and-greet, an executive roadshow, or a grand tour to Hallstatt and Budapest, experience the pinnacle of European chauffeuring.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={scrollToBooking}
              className="btn btn-primary"
              style={{ padding: '1.15rem 2.6rem', fontSize: '1.12rem' }}
            >
              <span>PLAN YOUR JOURNEY</span>
              <ArrowRight size={18} />
            </button>

            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '1.15rem 2.4rem', fontSize: '1.12rem' }}
            >
              <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
              <span>WHATSAPP CONCIERGE</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
