import React from 'react';
import { Link } from 'react-router-dom';

export default function VehicleShowcase() {
  return (
    <section className="vdt-section" id="luxury-fleet">
      <div className="vdt-container">
        <div className="vdt-section-heading">
          <span className="vdt-eyebrow">THE VIENNA COLLECTION</span>
          <h2>Travel in Unmatched Comfort</h2>
          <p>Discover our premium Mercedes-Benz fleet.</p>
        </div>

        <div className="vdt-grid">
          {/* S CLASS */}
          <article className="vdt-card">
            <div className="vdt-fleet-image">
              <img src="/images/mercedes-s-class.webp" alt="Mercedes-Benz S-Class" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">FLAGSHIP LUXURY</span>
              <h3>Mercedes-Benz S-Class</h3>
              <p className="vdt-description">
                An exceptional luxury sedan offering elegance,
                comfort and a refined chauffeur experience.
              </p>
              <Link to="/luxury-fleet/" className="vdt-outline-btn">
                EXPLORE VEHICLE →
              </Link>
            </div>
          </article>

          {/* E CLASS */}
          <article className="vdt-card">
            <div className="vdt-fleet-image">
              <img src="/images/mercedes-e-class.webp" alt="Mercedes-Benz E-Class" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">EXECUTIVE COMFORT</span>
              <h3>Mercedes-Benz E-Class</h3>
              <p className="vdt-description">
                Sophisticated executive transportation for
                airport transfers and business journeys.
              </p>
              <Link to="/luxury-fleet/" className="vdt-outline-btn">
                EXPLORE VEHICLE →
              </Link>
            </div>
          </article>

          {/* V CLASS */}
          <article className="vdt-card">
            <div className="vdt-fleet-image">
              <img src="/images/mercedes-v-class.webp" alt="Mercedes-Benz V-Class" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">GROUP LUXURY</span>
              <h3>Mercedes-Benz V-Class</h3>
              <p className="vdt-description">
                Spacious premium transportation for families,
                small groups and private journeys.
              </p>
              <Link to="/luxury-fleet/" className="vdt-outline-btn">
                EXPLORE VEHICLE →
              </Link>
            </div>
          </article>

          {/* SPRINTER */}
          <article className="vdt-card">
            <div className="vdt-fleet-image">
              <img src="/images/mercedes-sprinter-transparent.webp" alt="Mercedes-Benz Sprinter" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">PREMIUM GROUP TRAVEL</span>
              <h3>Mercedes-Benz Sprinter</h3>
              <p className="vdt-description">
                Comfortable premium group transportation
                for corporate travel and private tours.
              </p>
              <Link to="/luxury-fleet/" className="vdt-outline-btn">
                EXPLORE VEHICLE →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
