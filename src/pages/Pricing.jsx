import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { pricingData } from '../data/pages';
import BookingWidget from '../components/BookingWidget';
import { useLanguage } from '../context/LanguageContext';
import { fetchPublicDayTrips, CANONICAL_DAY_TRIP_IMAGES, sanitizeImageUrl } from '../services/api';

export default function Pricing() {
  const { t } = useLanguage();

  const defaultTours = Array.isArray(pricingData?.tours)
    ? pricingData.tours.filter(
        (t) => t && t.slug && !t.slug.includes('airport') && !t.slug.includes('hourly') && !t.slug.includes('secure')
      )
    : [];

  const [tours, setTours] = useState(defaultTours);

  useEffect(() => {
    document.title = 'Private Day Trips from Vienna with a Personal Chauffeur | Vienna Day Trip';
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://viennadaytrip.com/day-trips/';

    let isMounted = true;
    async function loadTrips() {
      try {
        const live = await fetchPublicDayTrips();
        if (isMounted && Array.isArray(live) && live.length > 0) {
          const formatted = live.map((t) => ({
            slug: t.slug,
            title: t.title || `${t.name} from Vienna`,
            tag: t.eyebrow || 'Signature Tour',
            desc: t.shortDesc || t.desc || (typeof t.fullDesc === 'string' ? t.fullDesc.replace(/<[^>]*>?/gm, '').substring(0, 160) : ''),
            duration: t.duration || 'Full Day (10-12h)',
            capacity: '1–7 Guests',
            price: t.price || 'From €550',
            image: CANONICAL_DAY_TRIP_IMAGES[t.slug] || sanitizeImageUrl(t.image, '/images/vienna-palace-backdrop.webp')
          }));
          setTours(formatted);
        }
      } catch (e) {}
    }
    loadTrips();
    return () => { isMounted = false; };
  }, []);

  const eyebrow = t('pricing_eyebrow') || pricingData?.eyebrow || 'PRIVATE CHAUFFEUR EXPERIENCES';
  const title = t('pricing_title') || pricingData?.title || 'Private Day Trips from Vienna with a Personal Chauffeur';
  const lead = t('pricing_lead') || pricingData?.lead || 'Explore Austria with private day trips from Vienna in a luxury Mercedes. Enjoy door-to-door pickup, flexible itineraries and fixed per-vehicle pricing. Visit Hallstatt, Salzburg, the Wachau Valley or Bratislava with your personal chauffeur.';

  return (
    <div style={{ position: 'relative' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          paddingTop: 'clamp(7.5rem, 11vw, 9rem)',
          paddingBottom: 'clamp(2.5rem, 4vw, 3.5rem)',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow">{eyebrow}</div>
          <h1
            className="heading-xl"
            style={{
              marginBottom: '1.25rem',
              color: 'var(--text-primary)',
              maxWidth: '920px',
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              lineHeight: 1.15
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1.05rem, 1.3vw, 1.2rem)',
              maxWidth: '780px',
              lineHeight: 1.7
            }}
          >
            {lead}
          </p>
        </div>
      </section>

      {/* Tour List & Filter Bar */}
      <section className="section section-dark">
        <div className="container-wide">
          {/* Category Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.65rem 1.8rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(197, 160, 89, 0.45)',
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Sparkles size={16} />
              <span>Signature Day Trips</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '2rem',
              marginBottom: '5rem'
            }}
          >
            {tours.map((tour) => (
              <div
                key={tour.slug}
                className="card-strada"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 0,
                  overflow: 'hidden'
                }}
              >
                <div style={{ height: '230px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={tour.image}
                    alt={tour.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                    loading="lazy"
                  />
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <span className="pill-badge">{tour.tag}</span>
                  </div>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      {tour.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '1.75rem' }}>
                      {tour.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={15} style={{ color: 'var(--accent)' }} />
                        <span>{tour.duration}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={15} style={{ color: 'var(--accent)' }} />
                        <span>{tour.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/${tour.slug}/`}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <span>VIEW ITINERARY & DETAILS</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Booking Bar */}
          <div>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>REQUEST A QUOTE</div>
              <h2 className="heading-lg">BOOK YOUR DESIRED JOURNEY.</h2>
            </div>
            <BookingWidget />
          </div>
        </div>
      </section>
    </div>
  );
}
