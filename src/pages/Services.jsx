import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ShieldCheck, Clock, Plane, Compass } from 'lucide-react';
import { servicesData } from '../data/pages';
import { fetchPublicServices } from '../services/api';
import FaqAccordion from '../components/FaqAccordion';
import BookingWidget from '../components/BookingWidget';

import ServicesCinematicHero from '../components/ServicesCinematicHero';

export default function Services() {
  const [pillars, setPillars] = useState(servicesData.pillars);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveServices() {
      try {
        const liveServices = await fetchPublicServices();
        if (isMounted && Array.isArray(liveServices) && liveServices.length > 0) {
          const formatted = liveServices.map((s, idx) => {
            let bullets = [];
            if (Array.isArray(s.features)) {
              bullets = s.features;
            } else if (typeof s.features === 'string') {
              try {
                bullets = JSON.parse(s.features);
              } catch {
                bullets = s.features.split('\n').map((b) => b.trim()).filter(Boolean);
              }
            }

            const title = s.name || s.title || 'Executive Service';
            let tag = s.tag;
            if (!tag) {
              const lower = title.toLowerCase();
              if (lower.includes('airport')) tag = 'Airport Transportation';
              else if (lower.includes('hourly')) tag = 'Flexible Chauffeur Hire';
              else if (lower.includes('day trip')) tag = 'Luxury European Tours';
              else if (lower.includes('secure')) tag = 'Close Protection & Tactical';
              else tag = 'Executive Chauffeur';
            }

            return {
              id: s.id || `srv_${idx}`,
              title,
              tag,
              desc: s.shortDesc || s.fullDesc || s.desc || '',
              bullets: bullets && bullets.length > 0 ? bullets : (s.shortDesc ? [s.shortDesc] : []),
              link: s.ctaUrl || (s.slug ? `/${s.slug}/` : '/contact/'),
              image: s.image || '/images/vienna-palace-backdrop.webp'
            };
          });
          setPillars(formatted);
        }
      } catch (err) {
        console.warn('[Services] Could not load live services:', err);
      }
    }
    loadLiveServices();
    return () => {
      isMounted = false;
    };
  }, []);

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
            {pillars.map((pillar, idx) => {
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
