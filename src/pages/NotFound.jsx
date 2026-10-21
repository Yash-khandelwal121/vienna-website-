import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '8rem 1.5rem',
        backgroundColor: 'var(--bg-main)',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214, 255, 103, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>NAVIGATION REROUTE</div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(6rem, 15vw, 12rem)',
            fontWeight: 900,
            lineHeight: 0.85,
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
            marginBottom: '1rem'
          }}
        >
          404
        </div>

        <h1 className="heading-lg" style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          JOURNEY NOT FOUND.
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          The road you are looking for has been moved or doesn't exist. Allow our chauffeur team to guide you back to familiar coordinates.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>RETURN TO HOMEPAGE</span>
          </Link>

          <Link to="/tour-pricing/" className="btn btn-secondary">
            <Compass size={16} />
            <span>EXPLORE ALL TOURS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
