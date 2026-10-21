import React from 'react';
import { Link } from 'react-router-dom';

export default function ServicesCinematicHero() {
  const services = [
    {
      id: 'airport-transfer',
      title: 'AIRPORT TRANSFERS',
      subtitle: 'Punctual, comfortable and stress-free.',
      icon: '✈',
      link: '/airport-transfer/',
      img: '/images/airport-transfer.webp',
      alt: 'Vienna Airport Transfers'
    },
    {
      id: 'hourly-chauffeur',
      title: 'HOURLY CHAUFFEUR',
      subtitle: 'Flexible, professional and always ready.',
      icon: '◷',
      link: '/hourly-chauffeur/',
      img: '/images/hourly-chauffeur.webp',
      alt: 'Hourly Chauffeur'
    },
    {
      id: 'day-trips',
      title: 'PRIVATE DAY TRIPS',
      subtitle: 'Explore Europe in total comfort.',
      icon: '△',
      link: '/day-trips/',
      img: '/images/private-day-trips.webp',
      alt: 'Private European Day Trips'
    },
    {
      id: 'secure-transportation',
      title: 'SECURE TRANSPORTATION',
      subtitle: 'Discreet, safe and reliable.',
      icon: '◇',
      link: '/secure-transportation/',
      img: '/images/secure-transportation.webp',
      alt: 'Secure Transportation'
    }
  ];

  return (
    <section className="vdt-services-hero" aria-label="Our Services">
      <div className="vdt-services-hero-grid">
        {services.map((svc) => (
          <Link key={svc.id} to={svc.link} className="vdt-services-panel">
            <img src={svc.img} alt={svc.alt} loading="lazy" />
            <div className="vdt-panel-info">
              <span className="vdt-panel-icon">{svc.icon}</span>
              <div>
                <h3>{svc.title}</h3>
                <p>{svc.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CENTER TITLE */}
      <div className="vdt-services-center">
        <span>VIENNA DAY TRIP</span>
        <h1>Our Services</h1>
      </div>
    </section>
  );
}
