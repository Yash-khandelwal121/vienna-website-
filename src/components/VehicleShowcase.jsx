import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicVehicles } from '../services/api';

const defaultVehicles = [
  {
    vehicleId: 's-class',
    name: 'Mercedes-Benz S-Class',
    category: 'FLAGSHIP LUXURY',
    mainImage: '/images/mercedes-s-class.webp',
    shortDescription: 'An exceptional luxury sedan offering elegance, comfort and a refined chauffeur experience.'
  },
  {
    vehicleId: 'e-class',
    name: 'Mercedes-Benz E-Class',
    category: 'EXECUTIVE COMFORT',
    mainImage: '/images/mercedes-e-class.webp',
    shortDescription: 'Sophisticated executive transportation for airport transfers and business journeys.'
  },
  {
    vehicleId: 'v-class',
    name: 'Mercedes-Benz V-Class',
    category: 'GROUP LUXURY',
    mainImage: '/images/mercedes-v-class.webp',
    shortDescription: 'Spacious premium transportation for families, small groups and private journeys.'
  },
  {
    vehicleId: 'sprinter',
    name: 'Mercedes-Benz Sprinter',
    category: 'PREMIUM GROUP TRAVEL',
    mainImage: '/images/mercedes-sprinter-transparent.webp',
    shortDescription: 'Comfortable premium group transportation for corporate travel and private tours.'
  }
];

export default function VehicleShowcase() {
  const [vehicles, setVehicles] = useState(defaultVehicles);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const live = await fetchPublicVehicles();
        if (isMounted && Array.isArray(live) && live.length > 0) {
          const formatted = live.map((v) => ({
            vehicleId: v.vehicleId || v.id,
            name: v.name,
            category: (v.badge || v.category || 'LUXURY CHAUFFEUR').toUpperCase(),
            mainImage: v.transparentImage || v.mainImage || '/images/mercedes-s-class.webp',
            shortDescription: v.shortDescription || v.tagline || 'Experience first-class private transportation in Vienna.'
          }));
          setVehicles(formatted);
        }
      } catch (e) {}
    }
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="vdt-section" id="luxury-fleet">
      <div className="vdt-container">
        <div className="vdt-section-heading">
          <span className="vdt-eyebrow">THE VIENNA COLLECTION</span>
          <h2>Travel in Unmatched Comfort</h2>
          <p>Discover our premium Mercedes-Benz fleet.</p>
        </div>

        <div className="vdt-grid">
          {vehicles.map((v) => (
            <article key={v.vehicleId} className="vdt-card">
              <div className="vdt-fleet-image">
                <img src={v.mainImage} alt={v.name} loading="lazy" />
              </div>
              <div className="vdt-card-content">
                <span className="vdt-category">{v.category}</span>
                <h3>{v.name}</h3>
                <p className="vdt-description">
                  {v.shortDescription}
                </p>
                <Link to="/luxury-fleet/" className="vdt-outline-btn">
                  EXPLORE VEHICLE →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
