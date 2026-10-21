import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../data/site';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        paddingTop: '5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
        position: 'relative'
      }}
    >
      <div className="container-wide">
        {/* Top Newsletter / Quick Contact Strip */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '4.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div>
            <div className="eyebrow">24/7 LUXURY CHAUFFEUR DISPATCH</div>
            <h3 className="heading-lg" style={{ marginBottom: '0.65rem' }}>
              NEED AN IMMEDIATE RIDE OR TAILORED QUOTE?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Our executive dispatch team responds in real time via WhatsApp or direct phone consultation.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'flex-start' }}>
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              CHAT ON WHATSAPP
            </a>
            <a
              href={`tel:${siteConfig.phone}`}
              className="btn btn-secondary"
            >
              <Phone size={15} style={{ color: 'var(--accent)' }} />
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '4.5rem'
          }}
        >
          {/* Col 1: About & Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.9rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase'
                }}
              >
                VIENNA DAY TRIP
              </span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 10px var(--accent)'
                }}
              />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              At Vienna Day Trip, we provide premium private chauffeur services based in Vienna. Working with embassies, top hotels, cruise companies, and renowned global travel partners, we offer luxury airport transfers, private sightseeing, day trips, and custom European tours.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Official Partner of Vienna Chamber of Commerce (WKO)</span>
            </div>
          </div>

          {/* Col 2: Popular Tours */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                color: 'var(--text-primary)',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.5rem'
              }}
            >
              SIGNATURE DAY TRIPS
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Hallstatt Day Trip', href: '/hallstatt-day-trip-from-vienna/' },
                { label: 'Salzburg Day Trip', href: '/salzburg-day-trip/' },
                { label: 'Budapest Day Trip', href: '/budapest-day-trip/' },
                { label: 'Prague Day Trip', href: '/prague-day-trip/' },
                { label: 'Bratislava Day Trip', href: '/bratislava-day-trip/' },
                { label: 'Wachau Valley Wine Trip', href: '/wachau-valley-trip/' },
                { label: 'Vienna Sightseeing Tour', href: '/vienna-sightseeing-tour/' },
                { label: 'Customized Day Trips', href: '/customized-day-trips/' }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services & Fleet */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                color: 'var(--text-primary)',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.5rem'
              }}
            >
              SERVICES & FLEET
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Our Services Overview', href: '/our-services/' },
                { label: 'Vienna Airport Pick & Drop-off', href: '/airport-transfer-vienna/' },
                { label: 'Hourly Chauffeur Service', href: '/hourly-chauffeur-service/' },
                { label: 'Secure Transportation', href: '/secure-transportation/' },
                { label: 'Our Luxury Mercedes Fleet', href: '/our-fleet/' },
                { label: 'B2B Solutions & Partnerships', href: '/b2b-solutions/' },
                { label: 'All Tours & Pricing', href: '/tour-pricing/' },
                { label: 'Blog & Travel Guides', href: '/blog' }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Details */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                color: 'var(--text-primary)',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.5rem'
              }}
            >
              CONTACT & DISPATCH
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                <span>{siteConfig.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <a href={`tel:${siteConfig.phone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {siteConfig.phoneDisplay}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <a href={`mailto:${siteConfig.email}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {siteConfig.email}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span>24 Hours / 7 Days a Week</span>
              </div>

              {/* Social Channels */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Follow Our Journeys
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent)';
                        e.currentTarget.style.borderColor = 'var(--accent-border)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.25rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © 2026 Vienna Day Trip. All rights reserved. GISA: 9110025257769. Member of WKO.
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <Link to="/about-vienna-day-trip/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Us</Link>
            <Link to="/contact-us-i/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact</Link>
            <Link to="/privacy-policy/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/cancellation-refund-policy/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cancellation Policy</Link>
            <Link to="/imprint/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Imprint</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
