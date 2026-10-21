import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

export default function FaqAccordion({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(0); // first open by default

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: isOpen ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              transition: 'all 0.25s ease'
            }}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '1.35rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
                transition: 'color 0.2s'
              }}
            >
              <span>{faq.question}</span>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isOpen ? 'var(--accent)' : 'var(--bg-main)',
                  color: isOpen ? 'var(--text-inverse)' : 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>

            {isOpen && (
              <div
                style={{
                  padding: '0 1.75rem 1.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1rem'
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
