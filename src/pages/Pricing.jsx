import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { pricingData } from '../data/pages';
import BookingWidget from '../components/BookingWidget';

export default function Pricing() {
  const [filter, setFilter] = useState('all');

  const filteredTours = pricingData.tours.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'transfers') return t.slug.includes('airport') || t.slug.includes('hourly') || t.slug.includes('secure');
    if (filter === 'daytrips') return !t.slug.includes('airport') && !t.slug.includes('hourly') && !t.slug.includes('secure');
    return true;
  });

  return (
    <div style={{ position: 'relative' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '3.5rem',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow">{pricingData.eyebrow}</div>
          <h1 className="heading-xl" style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            {pricingData.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '720px', lineHeight: '1.65' }}>
            {pricingData.lead}
          </p>
        </div>
      </section>

      {/* Tour List & Filter Bar */}
      <section className="section section-dark">
        <div className="container-wide">
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '3.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'all', label: 'All Tours & Services' },
              { id: 'daytrips', label: 'Signature Day Trips' },
              { id: 'transfers', label: 'Airport, Hourly & Secure' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '0.65rem 1.6rem',
                  borderRadius: 'var(--radius-full)',
                  border: filter === f.id ? '1px solid rgba(197, 160, 89, 0.45)' : '1px solid var(--border)',
                  backgroundColor: filter === f.id ? 'var(--accent)' : '#FFFFFF',
                  color: filter === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: filter === f.id ? '0 4px 15px rgba(197, 160, 89, 0.3)' : 'none'
                }}
              >
                {f.label}
              </button>
            ))}
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
            {filteredTours.map((tour) => (
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
