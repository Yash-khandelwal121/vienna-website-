import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck, ExternalLink, Edit3 } from 'lucide-react';
import { reviews, siteConfig } from '../data/site';
import { useLanguage } from '../context/LanguageContext';

export default function ReviewsSlider() {
  const { t } = useLanguage();
  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Number of cards to advance per slide
  const totalReviews = reviews.length;

  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('.review-slide-card')?.offsetWidth || 360;
      sliderRef.current.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('.review-slide-card')?.offsetWidth || 360;
      sliderRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  // Autoplay every 6 seconds, paused on hover
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardWidth = sliderRef.current.querySelector('.review-slide-card')?.offsetWidth || 360;

        if (scrollLeft >= maxScroll - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
        }
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header with Title and Google 5.0 Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div className="eyebrow" style={{ color: '#C69C50', marginBottom: '0.5rem' }}>
            GOOGLE BUSINESS VERIFIED REVIEWS
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
              fontWeight: 500,
              color: '#17191C',
              lineHeight: 1.2,
              marginBottom: '0.65rem'
            }}
          >
            {t('reviews_heading')}
          </h2>
          <p style={{ color: '#62666D', fontSize: '1.02rem', lineHeight: 1.6, margin: 0 }}>
            {t('reviews_desc')}
          </p>
        </div>

        {/* Rating Badge + Arrow Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Verified Google Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#FFFFFF',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #E6D8C3',
              boxShadow: '0 4px 15px rgba(23, 25, 28, 0.04)'
            }}
          >
            <div style={{ display: 'flex', color: '#C69C50', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#C69C50" />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 700, color: '#17191C' }}>
              5.0 / 5.0 (150+ Google Reviews)
            </span>
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Previous review"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6D8C3',
                color: '#17191C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C69C50';
                e.currentTarget.style.color = '#C69C50';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E6D8C3';
                e.currentTarget.style.color = '#17191C';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Next review"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6D8C3',
                color: '#17191C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C69C50';
                e.currentTarget.style.color = '#C69C50';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E6D8C3';
                e.currentTarget.style.color = '#17191C';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Cards Slider Track: 3 on Desktop, 2 on Tablet, 1 on Mobile */}
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
        className="hide-scrollbar reviews-track"
      >
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="review-slide-card"
            style={{
              scrollSnapAlign: 'start',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6D8C3',
              borderRadius: 'var(--radius-xl)',
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(23, 25, 28, 0.04)',
              minHeight: '280px'
            }}
          >
            <div>
              {/* Stars & Quote Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', color: '#C69C50', gap: '3px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#C69C50" />
                  ))}
                </div>
                <Quote size={26} style={{ color: '#C69C50', opacity: 0.3 }} />
              </div>

              {/* Review Text */}
              <p
                style={{
                  color: '#17191C',
                  fontSize: '0.96rem',
                  lineHeight: '1.7',
                  fontStyle: 'italic',
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                "{rev.text}"
              </p>
            </div>

            {/* Customer Author & Source Badge */}
            <div
              style={{
                borderTop: '1px solid #F0ECE4',
                paddingTop: '1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.12rem', fontWeight: 700, color: '#17191C' }}>
                  {rev.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8E929B', marginTop: '0.15rem' }}>
                  {rev.source}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#C69C50', fontSize: '0.78rem', fontWeight: 600 }}>
                <ShieldCheck size={15} />
                <span>Verified Guest</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PART 8.4: Direct Google Review Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #E6D8C3'
        }}
      >
        <a
          href={siteConfig.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            padding: '0.8rem 1.8rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ExternalLink size={15} style={{ color: '#C69C50' }} />
          <span>{t('reviews_read_all')}</span>
        </a>

        <a
          href={siteConfig.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            padding: '0.8rem 1.8rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Edit3 size={15} />
          <span>{t('reviews_write')}</span>
        </a>
      </div>

      <style>{`
        /* Responsive Review Cards Width */
        .review-slide-card {
          flex: 0 0 calc((100% - 3rem) / 3);
        }
        @media (max-width: 1024px) {
          .review-slide-card {
            flex: 0 0 calc((100% - 1.5rem) / 2);
          }
        }
        @media (max-width: 680px) {
          .review-slide-card {
            flex: 0 0 100%;
          }
        }
        .review-slide-card:hover {
          border-color: #C69C50;
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(23, 25, 28, 0.08), 0 0 20px rgba(198, 156, 80, 0.08);
        }
      `}</style>
    </div>
  );
}
