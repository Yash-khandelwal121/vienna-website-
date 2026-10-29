import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowUpRight, ShieldCheck, Star } from 'lucide-react';
import { siteConfig } from '../data/site';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        backgroundColor: '#FAF8F4',
        borderTop: '1px solid #E6D8C3',
        paddingTop: '5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
        position: 'relative'
      }}
    >
      <div className="container-wide">
        {/* Top 24/7 Concierge Strip */}
        <div
          className="footer-concierge-strip"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6D8C3',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.75rem, 4vw, 3rem)',
            marginBottom: '4rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '2rem',
            alignItems: 'center',
            boxShadow: '0 12px 35px rgba(23, 25, 28, 0.04)'
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: '#C69C50' }}>24/7 LUXURY CHAUFFEUR DISPATCH</div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 2.5vw, 1.95rem)',
                fontWeight: 700,
                color: '#17191C',
                margin: '0.4rem 0 0.65rem'
              }}
            >
              NEED AN IMMEDIATE RIDE OR TAILORED QUOTE?
            </h3>
            <p style={{ color: '#62666D', fontSize: '0.96rem', margin: 0, lineHeight: 1.6 }}>
              Our executive dispatch team responds in real time via WhatsApp or direct phone consultation.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'flex-start' }}>
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.8rem', fontSize: '0.88rem' }}
            >
              CHAT ON WHATSAPP
            </a>
            <a
              href={`tel:${siteConfig.phone}`}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.6rem', fontSize: '0.88rem' }}
            >
              <Phone size={15} style={{ color: '#C69C50' }} />
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>

        {/* 4-Column Clean Layout */}
        <div
          className="footer-links-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '2.5rem',
            marginBottom: '4rem'
          }}
        >
          {/* Column 1 — Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}
            >
              {/* Official Brand Logo */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid #C69C50',
                  background: '#0E1013',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(198, 156, 80, 0.22)',
                  flexShrink: 0,
                  padding: '3px'
                }}
              >
                <img
                  src="/images/logo2.png"
                  alt="Vienna Day Trip"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#17191C',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                VIENNA DAY TRIP
              </span>
            </Link>

            <p style={{ color: '#62666D', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              At Vienna Day Trip, we provide premium private chauffeur services based in Vienna. Working with embassies, top hotels, cruise companies, and renowned global travel partners, we deliver luxury airport transfers, private sightseeing, day trips, and custom European tours.
            </p>

            {/* Social Media Links with Official SVG Icons */}
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8E929B', marginBottom: '0.65rem', fontWeight: 600 }}>
                Social Channels
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
                {[
                  {
                    name: 'Instagram',
                    url: siteConfig.socials.instagram,
                    ariaLabel: 'Follow Vienna Day Trip on Instagram',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    )
                  },
                  {
                    name: 'Facebook',
                    url: siteConfig.socials.facebook,
                    ariaLabel: 'Visit Vienna Day Trip on Facebook',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )
                  },
                  {
                    name: 'TripAdvisor',
                    url: siteConfig.socials.tripadvisor,
                    ariaLabel: 'Read Vienna Day Trip on TripAdvisor',
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="6.5" cy="13.5" r="2"/>
                        <circle cx="17.5" cy="13.5" r="2"/>
                        <circle cx="6.5" cy="13.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                        <circle cx="17.5" cy="13.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M12 9.5c-2.3 0-4.3 1-5.5 2.5h11c-1.2-1.5-3.2-2.5-5.5-2.5zm0-4.5c2.5 0 4.8 1.1 6.5 2.8l2-2.3 1 3.5-3.5-.5 1.7-2A9.9 9.9 0 0 0 12 4a9.9 9.9 0 0 0-7.7 3.5l1.7 2-3.5.5 1-3.5 2 2.3A9.9 9.9 0 0 1 12 5z"/>
                        <polygon points="12,12.5 11,15.5 13,15.5"/>
                      </svg>
                    )
                  },
                  {
                    name: 'Trustpilot',
                    url: siteConfig.socials.trustpilot,
                    ariaLabel: 'Check Vienna Day Trip reviews on Trustpilot',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0l3.708 7.514 8.292 1.205-6 5.849 1.416 8.258L12 18.924l-7.416 3.902L6 14.568 0 8.719l8.292-1.205z" fill="#00B67A"/>
                        <path d="M17.416 22.826L12 18.924l5.416-2.85 1.026 6.752z" fill="#005128"/>
                      </svg>
                    )
                  },
                  {
                    name: 'TikTok',
                    url: siteConfig.socials.tiktok,
                    ariaLabel: 'Follow Vienna Day Trip on TikTok',
                    icon: (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.9 2.9 0 0 1 2.316-4.643c.277 0 .548.04.808.113V9.387a6.368 6.368 0 0 0-.808-.052 6.347 6.347 0 0 0-6.346 6.348 6.346 6.346 0 0 0 6.346 6.347 6.333 6.333 0 0 0 6.33-6.347V8.583a8.197 8.197 0 0 0 4.77 1.526V6.686z"/>
                      </svg>
                    )
                  }
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.ariaLabel}
                    title={s.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E6D8C3',
                      borderRadius: '50%',
                      color: '#17191C',
                      textDecoration: 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#C69C50';
                      e.currentTarget.style.borderColor = '#C69C50';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(198, 156, 80, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#17191C';
                      e.currentTarget.style.borderColor = '#E6D8C3';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.03)';
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 — Quick Links: Home, About Us, Luxury Fleet, Tours & Pricing, Blog */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                color: '#17191C',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #E6D8C3',
                paddingBottom: '0.5rem'
              }}
            >
              {t('footer_quick_links')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0 }}>
              {[
                { label: t('nav_home'), href: '/' },
                { label: t('nav_about'), href: '/about-vienna-day-trip/' },
                { label: 'Booking', href: '/booking' },
                { label: t('nav_fleet'), href: '/our-fleet/' },
                { label: t('footer_private_day_trips') || 'Private Day Trips', href: '/day-trips/' },
                { label: t('nav_blog'), href: '/blog/' }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{
                      color: '#62666D',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C69C50')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#62666D')}
                  >
                    <span style={{ color: '#C69C50', fontSize: '0.8rem' }}>✦</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services: Airport Transfers, Hourly Chauffeur, Private Transfers, B2B Solutions, Day Trips */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                color: '#17191C',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #E6D8C3',
                paddingBottom: '0.5rem'
              }}
            >
              {t('footer_services')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0 }}>
              {[
                { label: t('nav_airport_transfer'), href: '/airport-transfer-vienna/' },
                { label: t('nav_hourly_chauffeur'), href: '/hourly-chauffeur-service/' },
                { label: t('nav_private_transfers'), href: '/our-services/' },
                { label: t('nav_b2b_solutions'), href: '/b2b-solutions/' },
                { label: t('nav_daytrips'), href: '/day-trips/' }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{
                      color: '#62666D',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C69C50')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#62666D')}
                  >
                    <span style={{ color: '#C69C50', fontSize: '0.8rem' }}>✦</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact: Contact Us, phone, email, address, Google Reviews link */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                color: '#17191C',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #E6D8C3',
                paddingBottom: '0.5rem'
              }}
            >
              {t('footer_contact')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#62666D' }}>
              <div>
                <Link
                  to="/contact-us-i/"
                  style={{
                    color: '#C69C50',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>{t('nav_contact')}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={17} style={{ color: '#C69C50', flexShrink: 0, marginTop: '2px' }} />
                <span>{siteConfig.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={17} style={{ color: '#C69C50', flexShrink: 0 }} />
                <a href={`tel:${siteConfig.phone}`} style={{ color: '#17191C', textDecoration: 'none', fontWeight: 600 }}>
                  {siteConfig.phoneDisplay}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={17} style={{ color: '#C69C50', flexShrink: 0 }} />
                <a href={`mailto:${siteConfig.email}`} style={{ color: '#17191C', textDecoration: 'none' }}>
                  {siteConfig.email}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={17} style={{ color: '#C69C50', flexShrink: 0 }} />
                <span>{t('footer_247')}</span>
              </div>

              {/* Verified Google Reviews Link */}
              <div style={{ marginTop: '0.35rem', paddingTop: '0.65rem', borderTop: '1px solid #E6D8C3' }}>
                <a
                  href={siteConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#C69C50',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem'
                  }}
                >
                  <Star size={15} fill="#C69C50" />
                  <span>{t('footer_read_reviews')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer: Privacy Policy, Terms, Imprint, Copyright */}
        <div
          style={{
            borderTop: '1px solid #E6D8C3',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.25rem',
            fontSize: '0.84rem',
            color: '#8E929B'
          }}
        >
          <div>
            © 2026 Vienna Day Trip. {t('footer_rights')}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <Link to="/about-vienna-day-trip/" style={{ color: '#62666D', textDecoration: 'none' }}>
              {t('nav_about')}
            </Link>
            <Link to="/contact-us-i/" style={{ color: '#62666D', textDecoration: 'none' }}>
              {t('nav_contact')}
            </Link>
            <Link to="/privacy-policy/" style={{ color: '#62666D', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link to="/cancellation-refund-policy/" style={{ color: '#62666D', textDecoration: 'none' }}>
              Terms & Cancellation
            </Link>
            <Link to="/imprint/" style={{ color: '#62666D', textDecoration: 'none' }}>
              Imprint
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
