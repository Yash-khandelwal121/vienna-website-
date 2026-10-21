import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Star, Clock, Car, Check, ArrowRight, MessageSquare, Phone } from 'lucide-react';
import { aboutData } from '../data/pages';
import { siteConfig } from '../data/site';
import FaqAccordion from '../components/FaqAccordion';

export default function About() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Hero Banner */}
      <section
        style={{
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '4rem',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow">{aboutData.eyebrow}</div>
          <h1 className="heading-xl" style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            {aboutData.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '720px', lineHeight: '1.65' }}>
            {aboutData.lead}
          </p>
        </div>
      </section>

      {/* Main Story & Values */}
      <section className="section section-dark">
        <div className="container-wide">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
            <div>
              <div className="eyebrow">THE VIENNA DAY TRIP STORY</div>
              <h2 className="heading-lg" style={{ marginBottom: '1.5rem' }}>
                BUILT ON PRECISION, ELEGANCE & AUTHENTIC HOSPITALITY.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.8' }}>
                {aboutData.story.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Stats Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '2.5rem' }}>
                {aboutData.stats.map((st) => (
                  <div key={st.label} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent)' }}>
                      {st.value}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', height: '520px' }}>
                <img
                  src="https://viennadaytrip.com/wp-content/uploads/2026/03/your-professional-chauffeur.jpg"
                  alt="Professional Chauffeur in Vienna"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div style={{ marginBottom: '5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>OUR CORE VALUES</div>
              <h2 className="heading-lg">THE PRINCIPLES GUIDING EVERY MILE.</h2>
            </div>

            <div className="grid-4">
              {aboutData.coreValues.map((val) => (
                <div key={val.title} className="card-strada">
                  <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    {val.title}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    {val.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Licensing & Partnerships */}
          <div className="grid-2" style={{ marginBottom: '4rem' }}>
            <div className="card-strada">
              <div className="eyebrow">LEGAL COMPLIANCE</div>
              <h3 className="heading-md" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {aboutData.licensing.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                {aboutData.licensing.text}
              </p>
            </div>

            <div className="card-strada">
              <div className="eyebrow">DIPLOMACY & PARTNERS</div>
              <h3 className="heading-md" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {aboutData.partnerships.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                {aboutData.partnerships.text}
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>ABOUT US FAQ</div>
              <h2 className="heading-lg">COMMON QUESTIONS ABOUT OUR COMPANY.</h2>
            </div>
            <FaqAccordion faqs={aboutData.faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}
