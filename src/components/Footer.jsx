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
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#17191C',
                    textTransform: 'uppercase',
                    lineHeight: 1
                  }}
                >
                  VIENNA DAY TRIP
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.18em',
                    color: '#C69C50',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  PRIVATE CHAUFFEUR TOURS
                </span>
              </div>
            </Link>

            <p style={{ color: '#62666D', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              At Vienna Day Trip, we provide premium private chauffeur services based in Vienna. Working with embassies, top hotels, cruise companies, and renowned global travel partners, we deliver luxury airport transfers, private sightseeing, day trips, and custom European tours.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#C69C50', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              <ShieldCheck size={16} />
              <span>Official Partner of Vienna Chamber of Commerce (WKO)</span>
            </div>

            {/* Social Media Links */}
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8E929B', marginBottom: '0.5rem', fontWeight: 600 }}>
                Social Channels
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {[
                  { name: 'Instagram', url: siteConfig.socials.instagram },
                  { name: 'Facebook', url: siteConfig.socials.facebook },
                  { name: 'TripAdvisor', url: siteConfig.socials.tripadvisor },
                  { name: 'Trustpilot', url: siteConfig.socials.trustpilot },
                  { name: 'TikTok', url: siteConfig.socials.tiktok }
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.3rem 0.65rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E6D8C3',
                      borderRadius: '6px',
                      color: '#62666D',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#C69C50';
                      e.currentTarget.style.borderColor = '#C69C50';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#62666D';
                      e.currentTarget.style.borderColor = '#E6D8C3';
                    }}
                  >
                    {s.name}
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
