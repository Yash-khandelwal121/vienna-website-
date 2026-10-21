import React from 'react';
import { Link } from 'react-router-dom';

export default function BentoServices() {
  return (
    <section className="vdt-section" id="our-services">
      <div className="vdt-container">
        <div className="vdt-section-heading">
          <span className="vdt-eyebrow">OUR EXPERTISE</span>
          <h2>Our Premium Services</h2>
          <p>Exceptional chauffeur experiences tailored to every journey.</p>
        </div>

        <div className="vdt-grid">
          {/* CARD 1 */}
          <article className="vdt-card">
            <div className="vdt-service-image">
              <img src="/images/airport-transfer.webp" alt="Vienna Airport Transfers" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">FLIGHT TRACKING & MEET AND GREET</span>
              <h3>Airport Transfers</h3>
              <p className="vdt-description">
                Stress-free Vienna airport transfers with professional
                chauffeurs, flight tracking and luggage assistance.
              </p>
              <Link to="/airport-transfer/" className="vdt-outline-btn">
                EXPLORE SERVICE →
              </Link>
            </div>
          </article>

          {/* CARD 2 */}
          <article className="vdt-card">
            <div className="vdt-service-image">
              <img src="/images/hourly-chauffeur.webp" alt="Hourly Chauffeur" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">FLEXIBLE CITY-WIDE STANDBY</span>
              <h3>Hourly Chauffeur</h3>
              <p className="vdt-description">
                Enjoy a professional chauffeur and luxury Mercedes
                for business meetings, shopping and special occasions.
              </p>
              <Link to="/hourly-chauffeur/" className="vdt-outline-btn">
                EXPLORE SERVICE →
              </Link>
            </div>
          </article>

          {/* CARD 3 */}
          <article className="vdt-card">
            <div className="vdt-service-image">
              <img src="/images/private-day-trips.webp" alt="Private Day Trips" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">EXPLORE CENTRAL EUROPE</span>
              <h3>Private Day Trips</h3>
              <p className="vdt-description">
                Discover beautiful European destinations with personalized
                private tours and comfortable luxury transportation.
              </p>
              <Link to="/day-trips/" className="vdt-outline-btn">
                EXPLORE SERVICE →
              </Link>
            </div>
          </article>

          {/* CARD 4 */}
          <article className="vdt-card">
            <div className="vdt-service-image">
              <img src="/images/secure-transportation.webp" alt="Secure Transportation" loading="lazy" />
            </div>
            <div className="vdt-card-content">
              <span className="vdt-category">PRIVATE & PROFESSIONAL</span>
              <h3>Secure Transportation</h3>
              <p className="vdt-description">
                Discreet, comfortable and professionally managed
                transportation for executives and private clients.
              </p>
              <Link to="/secure-transportation/" className="vdt-outline-btn">
                EXPLORE SERVICE →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
