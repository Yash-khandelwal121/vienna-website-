import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

export const signatureDestinations = [
  {
    number: "01",
    title: "Hallstatt",
    country: "Austria",
    tagline: "UNESCO World Heritage Alpine Postcard",
    driveTime: "3.0 Hours",
    slug: "/hallstatt-day-trip-from-vienna/",
    image: "https://viennadaytrip.com/wp-content/uploads/2026/03/Fairytale-Village-of-Hallstatt.jpg",
    desc: "A sheer lakeside fairytale surrounded by Dachstein peaks, 16th-century wooden houses, and the breathtaking Hallstatt Skywalk."
  },
  {
    number: "02",
    title: "Salzburg",
    country: "Austria",
    tagline: "Mozart's Birthplace & Alpine Splendor",
    driveTime: "3.0 Hours",
    slug: "/salzburg-day-trip/",
    image: "https://viennadaytrip.com/wp-content/uploads/2026/03/St.-Gilgen-–-Coffee-Stop-by-the-Lake.jpg",
    desc: "Mirabell Gardens, the towering medieval Hohensalzburg Fortress, and legendary 'Sound of Music' film locations."
  },
  {
    number: "03",
    title: "Budapest",
    country: "Hungary",
    tagline: "Queen of the Danube",
    driveTime: "2.5 Hours",
    slug: "/budapest-day-trip/",
    image: "https://viennadaytrip.com/wp-content/uploads/2026/03/Hungarian-Parliament-scaled.jpg",
    desc: "Cross-border imperial grandeur: the gothic Hungarian Parliament, Buda Castle, Chain Bridge, and Fisherman's Bastion."
  },
  {
    number: "04",
    title: "Prague",
    country: "Czechia",
    tagline: "City of a Hundred Spires",
    driveTime: "3.5 Hours",
    slug: "/prague-day-trip/",
    image: "https://viennadaytrip.com/wp-content/uploads/2026/03/extra.webp",
    desc: "Bohemia's medieval wonder with Charles Bridge, Prague Castle complex, and the 600-year-old Astronomical Clock."
  },
  {
    number: "05",
    title: "Bratislava",
    country: "Slovakia",
    tagline: "Two Capitals in Under One Hour",
    driveTime: "55 Minutes",
    slug: "/bratislava-day-trip/",
    image: "https://viennadaytrip.com/wp-content/uploads/2026/03/Bratislava-Castle.jpg",
    desc: "Europe's shortest capital-to-capital transfer: hilltop castle panoramas, quaint cobblestone Old Town, and Danube promenade."
  },
  {
    number: "06",
    title: "Wachau Valley",
    country: "Austria",
    tagline: "Danube Wine Country & Baroque Castles",
    driveTime: "1.0 Hour",
    slug: "/wachau-valley-trip/",
    image: "https://viennadaytrip.com/wp-content/uploads/2026/03/pexels-jana-259137194-22601739-scaled.jpg",
    desc: "Terraced vineyards along the Danube, the golden Melk Abbey, and medieval Dürnstein where Richard the Lionheart was held."
  },
  {
    number: "07",
    title: "Vienna Sightseeing",
    country: "Austria",
    tagline: "The Imperial Heart of Europe",
    driveTime: "Half / Full Day",
    slug: "/vienna-sightseeing-tour/",
    image: "https://viennadaytrip.com/wp-content/uploads/2026/03/vienna-day-teip.jpeg",
    desc: "Schönbrunn Palace, Ringstrasse palaces, Hofburg, and St. Stephen's Cathedral explored in private Mercedes-Benz luxury."
  }
];

export default function DestinationCarousel() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Top Header Controls */}
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
        <div>
          <div className="eyebrow">SIGNATURE CHAUFFEUR TOURS</div>
          <h2 className="heading-xl">EXPLORE BEYOND THE ORDINARY.</h2>
        </div>

        {/* Carousel Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous destination"
            className="btn-icon"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next destination"
            className="btn-icon"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1.75rem',
          overflowX: 'auto',
          paddingBottom: '2rem',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        {signatureDestinations.map((dest) => (
          <div
            key={dest.number}
            style={{
              flex: '0 0 clamp(310px, 32vw, 420px)',
              scrollSnapAlign: 'start',
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="destination-card"
          >
            {/* Top Dedicated Image Section - High Brightness, Vibrant alpine colors */}
            <div
              style={{
                position: 'relative',
                height: '240px',
                width: '100%',
                overflow: 'hidden'
              }}
            >
              <img
                src={dest.image}
                alt={dest.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'contrast(1.05) saturate(1.05)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="dest-image"
                loading="lazy"
              />

              {/* Floating Badges */}
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  right: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 2
                }}
              >
                <span
                  style={{
                    padding: '0.35rem 0.8rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(197, 160, 89, 0.4)',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--text-gold)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {dest.number}
                </span>

                <span
                  style={{
                    padding: '0.35rem 0.85rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {dest.driveTime}
                </span>
              </div>
            </div>

            {/* Bottom Card Content - Pure Crisp White Body */}
            <div
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div>
                <div
                  style={{
                    color: 'var(--text-gold)',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem',
                    fontWeight: 700
                  }}
                >
                  {dest.country} • {dest.tagline}
                </div>

                <h3
                  className="heading-md"
                  style={{
                    marginBottom: '0.65rem',
                    color: 'var(--text-primary)',
                    fontSize: '1.65rem',
                    fontWeight: 800
                  }}
                >
                  {dest.title}
                </h3>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    minHeight: '4.2rem'
                  }}
                >
                  {dest.desc}
                </p>
              </div>

              <Link
                to={dest.slug}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  borderColor: 'rgba(197, 160, 89, 0.35)',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--text-gold)'
                }}
              >
                <span style={{ fontWeight: 700 }}>EXPLORE JOURNEY</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .destination-card:hover .dest-image {
          transform: scale(1.06);
        }
        .destination-card:hover {
          border-color: rgba(197, 160, 89, 0.5);
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08), 0 0 25px rgba(197, 160, 89, 0.12);
        }
      `}</style>
    </div>
  );
}
