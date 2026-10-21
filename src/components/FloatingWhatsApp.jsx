import React, { useState } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
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
        <MessageSquare size={26} strokeWidth={2.2} />
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
