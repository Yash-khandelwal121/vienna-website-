import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';
import { reviews } from '../data/site';

export default function ReviewsSlider() {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const offset = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      sliderRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Header with Ratings Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div className="eyebrow">VERIFIED CLIENT TESTIMONIALS</div>
          <h2 className="heading-xl">Praised Across Continents.</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', color: 'var(--accent)' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              5.0 / 5.0 Rating (150+ Reviews)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous review"
              className="btn-icon"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next review"
              className="btn-icon"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Cards Slider Track */}
      <div
        ref={sliderRef}
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '2rem',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            style={{
              flex: '0 0 clamp(300px, 35vw, 420px)',
              scrollSnapAlign: 'start',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}
            className="review-card"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', color: 'var(--accent)', gap: '0.2rem' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <Quote size={28} style={{ color: 'var(--accent)', opacity: 0.25 }} />
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '1.75rem' }}>
                "{rev.text}"
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {rev.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {rev.source}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>
                <ShieldCheck size={14} />
                <span>Verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .review-card:hover {
          border-color: rgba(197, 160, 89, 0.45);
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.06), 0 0 20px rgba(197, 160, 89, 0.12);
        }
      `}</style>
    </div>
  );
}
