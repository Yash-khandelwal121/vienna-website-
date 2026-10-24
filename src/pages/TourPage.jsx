import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Clock, Calendar, Check, X, ArrowRight, ShieldCheck,
  ChevronRight, Car, Compass, Users, Sparkles, MessageSquare, Phone
} from 'lucide-react';
import { toursData } from '../data/tours';
import FaqAccordion from '../components/FaqAccordion';
import BookingWidget from '../components/BookingWidget';
import { siteConfig } from '../data/site';
import { signatureDestinations } from '../components/DestinationCarousel';

export default function TourPage({ tourKey }) {
  const params = useParams();
  // Get tour key either from props or path parameter
  const key = tourKey || params.slug || 'hallstatt-day-trip-from-vienna';
  const tour = toursData[key] || toursData['hallstatt-day-trip-from-vienna'];

  const scrollToBooking = () => {
    const el = document.getElementById('tour-booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Other related tours
  const relatedTours = signatureDestinations.filter(
    (d) => !d.slug.includes(tour.slug)
  ).slice(0, 3);

  return (
    <div style={{ position: 'relative' }}>
      {/* =========================================================================
          HERO: Editorial White Luxury Destination Presentation
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '4.5rem',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="tour-hero-grid">
            {/* Left Column: Editorial Details */}
            <div>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
                <ChevronRight size={13} />
                <Link to="/tour-pricing/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Tours & Services</Link>
                <ChevronRight size={13} />
                <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>{tour.title}</span>
              </div>

              <div className="eyebrow">{tour.eyebrow}</div>

              <h1 className="heading-xl" style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                {tour.title}
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.12rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                {tour.overview[0]}
              </p>

              {/* Quick Metrics Bar */}
              {tour.stats && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 2rem',
                    maxWidth: 'fit-content',
                    marginBottom: '2.5rem'
                  }}
                >
                  {tour.stats.map((st) => (
                    <div key={st.label} style={{ marginRight: '1rem' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                        {st.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                        {st.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="btn btn-primary"
                >
                  <span>REQUEST THIS TOUR</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href={`${siteConfig.whatsappUrl}&text=Hello!%20I%20would%20like%20to%20inquire%20about%20the%20${encodeURIComponent(tour.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
                  <span>INQUIRE VIA WHATSAPP</span>
                </a>
              </div>
            </div>

            {/* Right Column: Crisp Vibrant Destination Photography */}
            <div style={{ position: 'relative' }}>
              <div
                className="tour-hero-img-box"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
                  position: 'relative'
                }}
              >
                <img
                  src={tour.heroImage}
                  alt={tour.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.05) saturate(1.05)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OVERVIEW & HIGHLIGHTS SPLIT
          ========================================================================= */}
      <section className="section section-dark">
        <div className="container-wide">
          <div className="tour-overview-grid">
            {/* Left: Detailed Overview */}
            <div>
              <div className="eyebrow">EXPERIENCE OVERVIEW</div>
              <h2 className="heading-lg" style={{ marginBottom: '1.5rem' }}>
                JOURNEY IN UNCOMPROMISED COMFORT.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.8' }}>
                {tour.overview.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Service Details Table (if applicable) */}
              {tour.serviceDetails && (
                <div style={{ marginTop: '2.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    SERVICE SPECIFICATIONS
                  </h4>
                  <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {tour.serviceDetails.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '1rem 1.5rem',
                          borderBottom: idx < tour.serviceDetails.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          fontSize: '0.92rem'
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{item.item}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Tour Highlights List Card */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2.5rem'
                }}
              >
                <div className="eyebrow">CURATED HIGHLIGHTS</div>
                <h3 className="heading-md" style={{ marginBottom: '1.5rem' }}>
                  WHAT MAKES THIS JOURNEY SPECIAL
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tour.highlights.map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(214, 255, 103, 0.15)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        <Check size={14} />
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.98rem', lineHeight: '1.5' }}>
                        {h}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DETAILED STEP-BY-STEP ITINERARY (If Available)
          ========================================================================= */}
      {tour.itinerary && (
        <section className="section section-secondary">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>DAY TRIP ITINERARY</div>
              <h2 className="heading-xl">A PERFECTLY TIMED EXPEDITION.</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', marginTop: '0.75rem' }}>
                Every timeline is fully flexible — adjust stops, coffee breaks, or photo pauses whenever inspiration strikes.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
              {tour.itinerary.map((step, idx) => (
                <div
                  key={idx}
                  className="itinerary-item tour-itinerary-card"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem 2rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)' }}>
                      {step.time}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      SCHEDULED
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {step.step}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                      {step.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          VISUAL HIGHLIGHTS / GALLERY CARDS
          ========================================================================= */}
      {tour.visualHighlights && tour.visualHighlights.length > 0 && (
        <section className="section section-dark">
          <div className="container-wide">
            <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>KEY LANDMARKS</div>
              <h2 className="heading-xl">ICONIC SIGHTS ALONG THE ROUTE.</h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '2rem'
              }}
            >
              {tour.visualHighlights.map((vh, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  className="card-strada"
                >
                  <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={vh.image}
                      alt={vh.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '1.75rem' }}>
                    <h4 className="heading-md" style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      {vh.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                      {vh.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          INCLUDED / NOT INCLUDED
          ========================================================================= */}
      <section className="section section-secondary">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>TRANSPARENCY & CLARITY</div>
            <h2 className="heading-xl">WHAT IS INCLUDED IN YOUR BOOKING.</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '2rem'
            }}
          >
            {/* Included */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                <Check size={22} />
                <span>WHAT IS INCLUDED</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {tour.included.map((inc, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--accent)', marginTop: '2px' }}>✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Included */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                <X size={22} />
                <span>NOT INCLUDED / OPTIONAL</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {tour.notIncluded.map((not, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)', marginTop: '2px' }}>✕</span>
                    <span>{not}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQS ACCORDION
          ========================================================================= */}
      {tour.faqs && tour.faqs.length > 0 && (
        <section className="section section-dark">
          <div className="container-narrow">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>FREQUENTLY ASKED QUESTIONS</div>
              <h2 className="heading-xl">ANSWERS FOR YOUR JOURNEY.</h2>
            </div>

            <FaqAccordion faqs={tour.faqs} />
          </div>
        </section>
      )}

      {/* =========================================================================
          RELATED JOURNEYS
          ========================================================================= */}
      {relatedTours.length > 0 && (
        <section className="section section-secondary">
          <div className="container-wide">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="eyebrow">MORE EXPERIENCES</div>
                <h2 className="heading-xl">EXPLORE RELATED DAY TRIPS.</h2>
              </div>
              <Link to="/tour-pricing/" className="btn btn-secondary">
                <span>VIEW ALL TOURS</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
              {relatedTours.map((rel) => (
                <div
                  key={rel.slug}
                  className="card-strada"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 0, overflow: 'hidden' }}
                >
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    <img src={rel.image} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                      <span className="pill-badge">{rel.driveTime}</span>
                    </div>
                  </div>
                  <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: 'var(--text-gold)', fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.35rem' }}>{rel.country}</div>
                      <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>{rel.title}</h3>
                    </div>
                    <Link to={rel.slug} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>VIEW DETAILS</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          RESERVATION CTA / BOOKING WIDGET ANCHOR
          ========================================================================= */}
      <section id="tour-booking-section" className="section section-dark">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>SEAMLESS RESERVATION</div>
            <h2 className="heading-xl">{tour.ctaText || "READY TO BEGIN YOUR JOURNEY?"}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '1rem' }}>
              {tour.ctaSub || "Reserve your private Mercedes chauffeur transfer today with free cancellation and fixed transparent pricing."}
            </p>
          </div>

          <BookingWidget />
        </div>
      </section>

      <style>{`
        .tour-hero-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
          gap: clamp(2rem, 4vw, 4.5rem);
          align-items: center;
        }

        .tour-hero-img-box {
          height: clamp(300px, 45vw, 480px);
        }

        .tour-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: clamp(2rem, 4vw, 4rem);
          align-items: flex-start;
        }

        .tour-itinerary-card {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 2rem;
          align-items: center;
        }

        @media (max-width: 600px) {
          .tour-itinerary-card {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            padding: 1.25rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
