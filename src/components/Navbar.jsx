import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, Calendar, ArrowUpRight } from 'lucide-react';
import { siteConfig, navLinks } from '../data/site';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (href) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  const scrollToHeroBooking = () => {
    const el = document.getElementById('hero-booking-card') || document.getElementById('booking-bar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(siteConfig.whatsappUrl, '_blank');
    }
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '74px',
          zIndex: 900,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E8E4DC',
          boxShadow: scrolled ? '0 6px 20px rgba(0, 0, 0, 0.04)' : 'none',
          display: 'flex',
          alignItems: 'center',
          transition: 'box-shadow 0.25s ease'
        }}
      >
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
          {/* Vienna Day Trip Brand Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: '0.85rem'
            }}
          >
            {/* Gold Monogram Crest */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid rgba(198, 156, 80, 0.45)',
                background: '#FAF8F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(198, 156, 80, 0.15)'
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#C69C50',
                  letterSpacing: '0.04em'
                }}
              >
                V✦
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.12rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.22rem',
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
                  fontSize: '0.64rem',
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

          {/* Desktop Navigation Links */}
          <nav style={{ alignItems: 'center', gap: 'clamp(0.85rem, 1.35vw, 1.75rem)' }} className="desktop-nav">
            {navLinks.map((item) => {
              if (item.dropdown) {
                return (
                  <div
                    key={item.label}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        fontWeight: isActive(item.href) ? 600 : 500,
                        color: isActive(item.href) ? '#C69C50' : '#17191C',
                        padding: '0.5rem 0',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={13} style={{ transform: openDropdown === item.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                    </button>

                    {openDropdown === item.label && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          minWidth: '280px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E8E4DC',
                          borderRadius: '12px',
                          padding: '0.65rem 0',
                          boxShadow: '0 20px 45px rgba(0,0,0,0.08), 0 0 20px rgba(198, 156, 80, 0.06)',
                          zIndex: 1000
                        }}
                      >
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1.35rem',
                              color: isActive(sub.href) ? '#C69C50' : '#17191C',
                              textDecoration: 'none',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.88rem',
                              fontWeight: 500,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#C69C50';
                              e.currentTarget.style.backgroundColor = '#FAF8F4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = isActive(sub.href) ? '#C69C50' : '#17191C';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span>{sub.label}</span>
                            <ArrowUpRight size={13} style={{ opacity: 0.4 }} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    fontWeight: isActive(item.href) ? 600 : 500,
                    color: isActive(item.href) ? '#C69C50' : '#17191C',
                    textDecoration: 'none',
                    position: 'relative',
                    padding: '0.5rem 0',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#C69C50')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive(item.href) ? '#C69C50' : '#17191C')}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '10%',
                        right: '10%',
                        height: '2px',
                        backgroundColor: '#C69C50',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
            {/* Language Selector */}
            <div
              style={{
                alignItems: 'center',
                gap: '0.35rem',
                color: '#17191C',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.4rem 0.5rem'
              }}
              className="lang-selector"
            >
              <Globe size={15} style={{ color: '#C69C50' }} />
              <span>EN</span>
              <ChevronDown size={13} style={{ opacity: 0.6 }} />
            </div>

            {/* Champagne Gold Book Now Button */}
            <button
              type="button"
              onClick={scrollToHeroBooking}
              className="btn header-book-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#C69C50',
                color: '#FFFFFF',
                borderRadius: '30px',
                padding: '0.65rem 1.45rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                border: 'none',
                boxShadow: '0 4px 14px rgba(198, 156, 80, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B58B3F';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#C69C50';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Calendar size={14} />
              <span>BOOK NOW</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              className="btn-icon mobile-menu-toggle"
              style={{
                background: '#FAF8F4',
                border: '1px solid #E8E4DC',
                color: '#17191C',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: '72px',
            backgroundColor: '#FFFFFF',
            zIndex: 890,
            overflowY: 'auto',
            padding: '2.5rem 1.5rem 4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          {navLinks.map((item) => (
            <div key={item.label} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '0.85rem' }}>
              <Link
                to={item.href}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isActive(item.href) ? 'var(--text-gold)' : 'var(--text-primary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{item.label}</span>
                <ArrowUpRight size={18} style={{ color: 'var(--accent)', opacity: 0.8 }} />
              </Link>
              {item.dropdown && (
                <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.92rem',
                        fontFamily: 'var(--font-body)',
                        padding: '0.2rem 0'
                      }}
                    >
                      ✦ {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <a
              href={`tel:${siteConfig.phone}`}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <Phone size={16} style={{ color: 'var(--accent)' }} />
              CALL {siteConfig.phoneDisplay}
            </a>
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <MessageSquare size={16} />
              WHATSAPP CONCIERGE 24/7
            </a>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav {
          display: none;
        }
        .lang-selector {
          display: none;
        }
        .mobile-menu-toggle {
          display: flex;
        }
        @media (min-width: 1060px) {
          .desktop-nav {
            display: flex !important;
          }
          .lang-selector {
            display: inline-flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
