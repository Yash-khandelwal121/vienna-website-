import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { siteConfig } from '../data/site';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.65rem',
        pointerEvents: 'none'
      }}
    >
      {/* Tooltip bubble */}
      {showTooltip && (
        <div
          style={{
            pointerEvents: 'auto',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(197, 160, 89, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.95rem 1.35rem',
            boxShadow: '0 15px 40px rgba(0,0,0,0.1), 0 0 20px rgba(197, 160, 89, 0.08)',
            maxWidth: '280px',
            position: 'relative',
            animation: 'fadeInUp 0.3s ease'
          }}
        >
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            aria-label="Close tooltip"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={13} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              VIP Concierge 24/7
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.45', margin: 0 }}>
            Welcome to Vienna Day Trip. How may our private dispatch assist your itinerary?
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={siteConfig.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Concierge"
        style={{
          pointerEvents: 'auto',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #DFC187 0%, #C5A059 50%, #967425 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(197, 160, 89, 0.45), 0 0 15px rgba(197, 160, 89, 0.2)',
          textDecoration: 'none',
          transition: 'all 0.25s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(197, 160, 89, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(197, 160, 89, 0.45), 0 0 15px rgba(197, 160, 89, 0.2)';
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px solid rgba(197, 160, 89, 0.5)',
            opacity: 0.7,
            animation: 'pulseRing 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite'
          }}
        />
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="#FFFFFF"
          aria-hidden="true"
          style={{ display: 'block', pointerEvents: 'none' }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.22); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
