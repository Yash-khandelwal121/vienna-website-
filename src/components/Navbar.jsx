import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, Calendar, ArrowUpRight, Phone, MessageSquare, Check } from 'lucide-react';
import { siteConfig, navLinks } from '../data/site';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const langRef = useRef(null);
  const desktopNavRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setLangDropdownOpen(false);
    setMobileLangOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Click outside to close language dropdown & nav dropdown, and Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isActive = (href) => {
    if (!href) return false;
    const cleanCurrent = location.pathname.replace(/\/$/, '') || '/';
    const cleanTarget = href.replace(/\/$/, '') || '/';
    if (cleanTarget === '/') return cleanCurrent === '/';
    const dayTripAliases = ['/tour-pricing', '/private-day-trips', '/day-trips'];
    if (dayTripAliases.includes(cleanTarget) && dayTripAliases.includes(cleanCurrent)) {
      return true;
    }
    return cleanCurrent === cleanTarget || cleanCurrent.startsWith(`${cleanTarget}/`);
  };

  const scrollToHeroBooking = () => {
    const el = document.getElementById('hero-booking-card') || document.getElementById('booking-bar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.location.href = '/#hero-booking-card';
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <>
      <header
        className={`main-header ${scrolled ? 'scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '74px',
          zIndex: 1000,
          backgroundColor: scrolled ? 'rgba(250, 248, 244, 0.98)' : '#FAF8F4',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid #E6D8C3' : '1px solid rgba(230, 216, 195, 0.65)',
          boxShadow: scrolled ? '0 10px 30px rgba(23, 25, 28, 0.06)' : 'none',
          display: 'flex',
          alignItems: 'center',
          transition: 'background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
        }}
      >
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', gap: '1.5rem' }}>
          {/* Brand Logo (LEFT) */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: '0.85rem',
              flexShrink: 0
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
              className="brand-logo-text-main"
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

          {/* Desktop Navigation Links (CENTER): LOGO | Home | Our Services ▾ | Day Trips ▾ | Luxury Fleet | About Us */}
          <nav className="desktop-nav" ref={desktopNavRef}>
            {navLinks.map((item) => {
              if (item.dropdown) {
                return (
                  <div
                    key={item.label}
                    className="desktop-dropdown-wrapper"
                    style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setOpenDropdown(null)}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.92rem',
                        fontWeight: isActive(item.href) ? 600 : 500,
                        color: isActive(item.href) ? '#C69C50' : '#17191C',
                        textDecoration: 'none',
                        padding: '0.5rem 0',
                        transition: 'color 0.2s ease',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C69C50')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = isActive(item.href) ? '#C69C50' : '#17191C')}
                    >
                      <span>{t(item.tKey) || item.label}</span>
                      {isActive(item.href) && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-2px',
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: '#C69C50',
                            borderRadius: '2px'
                          }}
                        />
                      )}
                    </Link>

                    <button
                      type="button"
                      aria-label={`Toggle ${item.label} dropdown`}
                      aria-haspopup="true"
                      aria-expanded={openDropdown === item.label}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenDropdown((prev) => (prev === item.label ? null : item.label));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem 0.2rem 0.5rem 0.35rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: openDropdown === item.label || isActive(item.href) ? '#C69C50' : '#17191C',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C69C50')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          openDropdown === item.label || isActive(item.href) ? '#C69C50' : '#17191C')
                      }
                    >
                      <ChevronDown
                        size={13}
                        style={{
                          transform: openDropdown === item.label ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                          opacity: 0.75,
                          flexShrink: 0
                        }}
                      />
                    </button>

                    {openDropdown === item.label && (
                      <div
                        role="menu"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          minWidth: '270px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E6D8C3',
                          borderRadius: '12px',
                          padding: '0.6rem 0',
                          boxShadow: '0 20px 45px rgba(23, 25, 28, 0.08), 0 0 20px rgba(198, 156, 80, 0.06)',
                          zIndex: 1000
                        }}
                      >
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            role="menuitem"
                            onClick={() => setOpenDropdown(null)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.72rem 1.35rem',
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
                            <span>{t(sub.tKey) || sub.label}</span>
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
                    fontSize: '0.92rem',
                    fontWeight: isActive(item.href) ? 600 : 500,
                    color: isActive(item.href) ? '#C69C50' : '#17191C',
                    textDecoration: 'none',
                    position: 'relative',
                    padding: '0.5rem 0',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#C69C50')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive(item.href) ? '#C69C50' : '#17191C')}
                >
                  {t(item.tKey) || item.label}
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

          {/* Right Header Controls (RIGHT): 🌐 EN ▾ | BOOK NOW */}
          <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            {/* PART 3: SIX-LANGUAGE DROPDOWN */}
            <div ref={langRef} style={{ position: 'relative' }} className="lang-selector-wrapper">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-label="Select language"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E6D8C3',
                  borderRadius: '20px',
                  color: '#17191C',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.42rem 0.85rem',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C69C50';
                  e.currentTarget.style.color = '#C69C50';
                }}
                onMouseLeave={(e) => {
                  if (!langDropdownOpen) {
                    e.currentTarget.style.borderColor = '#E6D8C3';
                    e.currentTarget.style.color = '#17191C';
                  }
                }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentLangObj.flag}</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {currentLangObj.code.split('-')[0].toUpperCase()}
                </span>
                <ChevronDown
                  size={12}
                  style={{
                    transform: langDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    opacity: 0.65
                  }}
                />
              </button>

              {/* Dropdown Menu matching screenshot reference */}
              {langDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E6D8C3',
                    borderRadius: '12px',
                    padding: '0.4rem 0',
                    boxShadow: '0 16px 40px rgba(23, 25, 28, 0.12), 0 0 16px rgba(198, 156, 80, 0.08)',
                    zIndex: 1100
                  }}
                >
                  {LANGUAGES.map((item, idx) => {
                    const isSelected = item.code === language;
                    return (
                      <React.Fragment key={item.code}>
                        <button
                          type="button"
                          onClick={() => {
                            setLanguage(item.code);
                            setLangDropdownOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 1rem',
                            backgroundColor: isSelected ? 'rgba(198, 156, 80, 0.08)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.86rem',
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? '#C69C50' : '#17191C',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected ? 'rgba(198, 156, 80, 0.12)' : '#FAF8F4';
                            e.currentTarget.style.color = '#C69C50';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected ? 'rgba(198, 156, 80, 0.08)' : 'transparent';
                            e.currentTarget.style.color = isSelected ? '#C69C50' : '#17191C';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.flag}</span>
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check size={14} style={{ color: '#C69C50' }} />}
                        </button>
                        {idx < LANGUAGES.length - 1 && (
                          <div style={{ height: '1px', backgroundColor: '#F0ECE4', margin: '0 0.75rem' }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Champagne Gold Book Now Button (Navigates directly to /booking) */}
            <Link
              to="/booking"
              className="btn header-book-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#C69C50',
                color: '#FFFFFF',
                borderRadius: '30px',
                padding: '0.62rem 1.45rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                border: 'none',
                boxShadow: '0 4px 14px rgba(198, 156, 80, 0.28)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textDecoration: 'none',
                flexShrink: 0
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
              <span>{t('nav_book_now')}</span>
            </Link>

            {/* Mobile Hamburger Button (44x44px recommended touch target) */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              className="btn-icon mobile-menu-toggle"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E6D8C3',
                color: '#17191C',
                cursor: 'pointer',
                display: 'flex',
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                flexShrink: 0
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
            top: '74px',
            backgroundColor: '#FAF8F4',
            zIndex: 999,
            overflowY: 'auto',
            padding: '2rem 1.5rem 4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            borderTop: '1px solid #E6D8C3'
          }}
        >
          {/* Mobile Language Selector */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6D8C3',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
            }}
          >
            <button
              type="button"
              onClick={() => setMobileLangOpen(!mobileLangOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#17191C'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Globe size={16} style={{ color: '#C69C50' }} />
                <span>
                  {currentLangObj.flag} {currentLangObj.label} ({currentLangObj.code})
                </span>
              </div>
              <ChevronDown
                size={14}
                style={{
                  transform: mobileLangOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  color: '#C69C50'
                }}
              />
            </button>

            {mobileLangOpen && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F0ECE4', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setMobileLangOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: l.code === language ? 'rgba(198, 156, 80, 0.1)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: l.code === language ? '#C69C50' : '#17191C',
                      fontWeight: l.code === language ? 700 : 500,
                      fontSize: '0.88rem'
                    }}
                  >
                    <span>{l.flag} {l.label}</span>
                    {l.code === language && <Check size={14} style={{ color: '#C69C50' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {navLinks.map((item) => (
            <div key={item.label} style={{ borderBottom: '1px solid #E6D8C3', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: isActive(item.href) ? '#C69C50' : '#17191C',
                    textDecoration: 'none',
                    flexGrow: 1,
                    padding: '0.35rem 0'
                  }}
                >
                  {t(item.tKey) || item.label}
                </Link>
                {item.dropdown ? (
                  <button
                    type="button"
                    aria-label={`Toggle ${item.label} submenu`}
                    aria-haspopup="true"
                    aria-expanded={openDropdown === item.label}
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      color: '#C69C50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronDown
                      size={20}
                      style={{
                        transform: openDropdown === item.label ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>
                ) : (
                  <ArrowUpRight size={18} style={{ color: '#C69C50', opacity: 0.7 }} />
                )}
              </div>

              {item.dropdown && openDropdown === item.label && (
                <div role="menu" style={{ marginTop: '0.75rem', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      role="menuitem"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        color: isActive(sub.href) ? '#C69C50' : '#62666D',
                        textDecoration: 'none',
                        fontSize: '0.92rem',
                        fontFamily: 'var(--font-body)',
                        padding: '0.25rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span style={{ color: '#C69C50' }}>✦</span>
                      <span>{t(sub.tKey) || sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Additional pages in mobile menu so visitors can still reach them */}
          <div style={{ borderBottom: '1px solid #E6D8C3', paddingBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', color: '#8E929B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              More Links
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/tour-pricing/" onClick={() => setMobileOpen(false)} style={{ color: '#17191C', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('footer_private_day_trips') || 'Private Day Trips'}
              </Link>
              <Link to="/blog" onClick={() => setMobileOpen(false)} style={{ color: '#17191C', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('nav_blog')}
              </Link>
              <Link to="/contact-us-i/" onClick={() => setMobileOpen(false)} style={{ color: '#17191C', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t('nav_contact')}
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link
              to="/booking"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Calendar size={16} />
              <span>{t('nav_book_now')}</span>
            </Link>

            <a
              href={`tel:${siteConfig.phone}`}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            >
              <Phone size={16} style={{ color: '#C69C50' }} />
              CALL {siteConfig.phoneDisplay}
            </a>
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                borderRadius: '30px',
                border: 'none',
                fontWeight: 700
              }}
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
        .lang-selector-wrapper {
          display: none;
        }
        .mobile-menu-toggle {
          display: flex;
        }
        @media (min-width: 1060px) {
          .desktop-nav {
            display: flex !important;
            align-items: center;
            justify-content: center;
            flex: 1 1 auto;
            gap: 20px;
          }
          .lang-selector-wrapper {
            display: inline-block !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
        @media (min-width: 1180px) {
          .desktop-nav {
            gap: 28px;
          }
        }
        @media (min-width: 1360px) {
          .desktop-nav {
            gap: 34px;
          }
        }
        .dropdown-trigger-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* Mobile Header Responsive Tuning */
        @media (max-width: 600px) {
          .header-book-btn {
            padding: 0.5rem 1rem !important;
            font-size: 0.78rem !important;
          }
        }
        @media (max-width: 440px) {
          .header-controls {
            gap: 0.5rem !important;
          }
          .brand-logo-text-sub {
            display: none !important;
          }
          .brand-logo-text-main {
            font-size: 1.05rem !important;
          }
          .header-book-btn {
            padding: 0.45rem 0.65rem !important;
            font-size: 0.72rem !important;
          }
        }
        @media (max-width: 360px) {
          .header-book-btn {
            display: none !important;
          }
          .brand-logo-text-main {
            font-size: 0.96rem !important;
          }
        }
      `}</style>
    </>
  );
}
