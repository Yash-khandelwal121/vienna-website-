import React from 'react';
import { Compass, Sliders, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: "01",
    title: "Choose Your Experience",
    subtitle: "DESTINATION OR CHAUFFEUR CLASS",
    desc: "Select from our curated signature day trips (Hallstatt, Salzburg, Budapest, Prague) or reserve an executive Mercedes by the hour for business meetings or airport transfers.",
    icon: Compass
  },
  {
    step: "02",
    title: "Personalize Your Journey",
    subtitle: "TAILORED STOPS & SCHEDULE",
    desc: "Coordinate departure timing, custom lakeside coffee stops, luggage assistance, child seats, or diplomatic privacy requirements directly with our 24/7 concierge.",
    icon: Sliders
  },
  {
    step: "03",
    title: "Travel Effortlessly",
    subtitle: "IMMACULATE MERCEDES COMFORT",
    desc: "Your uniformed chauffeur greets you at your doorstep or arrivals terminal. Sit back in climate-controlled acoustic quietude with complimentary Wi-Fi and chilled mineral water.",
    icon: ShieldCheck
  }
];

export default function TimelineSection() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.2rem' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>HOW IT WORKS</div>
        <h2 className="heading-xl">Seamless from First Contact.</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.65rem' }}>
          Three simple steps to world-class private travel across Austria and Central Europe.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          position: 'relative'
        }}
      >
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="card-strada"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.5rem 2rem',
                minHeight: '340px'
              }}
            >
              <div>
                {/* Step Number & Icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '3.2rem',
                      fontWeight: 800,
                      lineHeight: 0.9,
                      color: 'var(--text-gold)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {item.step}
                  </span>

                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <div style={{ color: 'var(--text-gold)', fontSize: '0.78rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                  {item.subtitle}
                </div>

                <h3 className="heading-md" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.7' }}>
                  {item.desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: '2rem',
                  height: '2px',
                  width: '100%',
                  backgroundColor: 'var(--border)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${((idx + 1) / steps.length) * 100}%`,
                    backgroundColor: 'var(--accent)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
