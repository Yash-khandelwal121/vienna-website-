import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ShieldCheck, Clock, Plane, Compass } from 'lucide-react';
import { servicesData } from '../data/pages';
import FaqAccordion from '../components/FaqAccordion';
import BookingWidget from '../components/BookingWidget';

import ServicesCinematicHero from '../components/ServicesCinematicHero';

export default function Services() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Services Hero */}
      <section
        style={{
          position: 'relative',
          paddingTop: '80px',
          paddingBottom: '2rem',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <ServicesCinematicHero />

        <div className="container-wide" style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '780px', margin: '0 auto', lineHeight: '1.65' }}>
            {servicesData.lead}
          </p>
        </div>
      </section>

      {/* Services Pillars Deep Dive */}
      <section className="section section-dark">
        <div className="container-wide">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', marginBottom: '5rem' }}>
            {servicesData.pillars.map((pillar, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div
                  key={pillar.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                    gap: 'clamp(2rem, 4vw, 4rem)',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ order: isEven ? 2 : 1 }}>
                    <span className="pill-badge">{pillar.tag}</span>
                    <h2 className="heading-lg" style={{ marginTop: '0.75rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                      {pillar.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.75', marginBottom: '1.75rem' }}>
                      {pillar.desc}
                    </p>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.25rem' }}>
                      {pillar.bullets.map((b, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          <span style={{ color: 'var(--accent)' }}>✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={pillar.link} className="btn btn-primary">
                      <span>LEARN MORE & BOOK</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>

                  <div style={{ order: isEven ? 1 : 2 }}>
                    <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', height: '420px', position: 'relative' }}>
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: '880px', margin: '0 auto 5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>SERVICES FAQ</div>
              <h2 className="heading-lg">ANSWERS ABOUT OUR CHAUFFEUR SERVICES.</h2>
            </div>
            <FaqAccordion faqs={servicesData.faqs} />
          </div>

          {/* Quick Booking Bar */}
          <div>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>BOOK YOUR VEHICLE</div>
              <h2 className="heading-lg">START YOUR RESERVATION.</h2>
            </div>
            <BookingWidget />
          </div>
        </div>
      </section>
    </div>
  );
}
