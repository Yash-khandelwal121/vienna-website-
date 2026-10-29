import React from 'react';
import { Link } from 'react-router-dom';

export default function DestinationGallery() {
  return (
    <section className="vdt-gallery" id="destinations-gallery">
      <div className="vdt-gallery-container">
        <div className="vdt-gallery-grid">
          {/* CARD 1 */}
          <article className="vdt-gallery-card">
            <Link
              to="/hallstatt-day-trip-from-vienna/"
              style={{ position: 'absolute', inset: 0, zIndex: 3 }}
              aria-label="Hallstatt Lakeside Panorama"
            />
            <img
              src="/images/gallery-hallstatt.webp"
              alt="Hallstatt"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/images/Hallstatt.jpg';
              }}
            />
            <div className="vdt-gallery-card-content">
              <span>UNESCO SALZKAMMERGUT</span>
              <h3>Hallstatt Lakeside Panorama</h3>
            </div>
          </article>

          {/* CARD 2 */}
          <article className="vdt-gallery-card">
            <Link
              to="/budapest-day-trip/"
              style={{ position: 'absolute', inset: 0, zIndex: 3 }}
              aria-label="Budapest Danube Riverfront"
            />
            <img
              src="/images/gallery-budapest.webp"
              alt="Budapest"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  'https://viennadaytrip.com/wp-content/uploads/2026/03/Hungarian-Parliament-scaled.jpg';
              }}
            />
            <div className="vdt-gallery-card-content">
              <span>BUDAPEST, HUNGARY</span>
              <h3>Danube Riverfront</h3>
            </div>
          </article>

          {/* CARD 3 */}
          <article className="vdt-gallery-card">
            <Link
              to="/bratislava-day-trip/"
              style={{ position: 'absolute', inset: 0, zIndex: 3 }}
              aria-label="Bratislava Hilltop Fortress"
            />
            <img
              src="/images/gallery-bratislava.webp"
              alt="Bratislava"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  'https://viennadaytrip.com/wp-content/uploads/2026/03/Bratislava-Castle.jpg';
              }}
            />
            <div className="vdt-gallery-card-content">
              <span>BRATISLAVA, SLOVAKIA</span>
              <h3>Hilltop Fortress</h3>
            </div>
          </article>

          {/* CARD 4 */}
          <article className="vdt-gallery-card">
            <Link
              to="/wachau-valley-trip/"
              style={{ position: 'absolute', inset: 0, zIndex: 3 }}
              aria-label="Wachau Vineyards"
            />
            <img
              src="/images/gallery-wachau.webp"
              alt="Wachau Valley"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  'https://viennadaytrip.com/wp-content/uploads/2026/03/pexels-jana-259137194-22601739-scaled.jpg';
              }}
            />
            <div className="vdt-gallery-card-content">
              <span>LOWER AUSTRIA</span>
              <h3>Wachau Vineyards</h3>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
