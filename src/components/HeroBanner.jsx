import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Car,
  Plane,
  ArrowRight,
  ShieldCheck,
  Gem,
  Compass,
  Lock
} from 'lucide-react';
import { siteConfig } from '../data/site';

export default function HeroBanner() {
  const [activeTab, setActiveTab] = useState('airport'); // 'airport' | 'daytrip' | 'hourly'
  const [formData, setFormData] = useState({
    pickup: 'Vienna International Airport (VIE)',
    dropoff: 'Hotel name or destination',
    date: '2026-10-22',
    time: '02:00',
    passengers: '1 Passenger',
    vehicle: 'Mercedes S-Class'
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'airport') {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Vienna International Airport (VIE)',
        dropoff: 'Hotel Sacher (Vienna City Center)'
      }));
    } else if (tab === 'daytrip') {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Vienna City Center / Hotel',
        dropoff: 'Hallstatt (Salzkammergut)'
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        pickup: 'Vienna City Center',
        dropoff: 'Hourly Chauffeur (Vienna & Surrounds)'
      }));
    }
  };

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errorMsg) setErrorMsg('');
  };

  const handleGetQuote = (e) => {
    e.preventDefault();
    if (!formData.pickup || !formData.dropoff || !formData.date || !formData.time) {
      setErrorMsg('Please complete all journey fields before requesting your quote.');
      return;
    }

    const tabName =
      activeTab === 'airport'
        ? 'Airport Transfer'
        : activeTab === 'daytrip'
        ? 'Private Day Trip'
        : 'Hourly Chauffeur';

    const message = `Hello Vienna Day Trip! I would like to request a private chauffeur quote:\n\n• Service: ${tabName}\n• Pickup Location: ${formData.pickup}\n• Drop-off Location: ${formData.dropoff}\n• Pickup Date: ${formData.date}\n• Pickup Time: ${formData.time}\n• Passengers: ${formData.passengers}\n• Preferred Vehicle: ${formData.vehicle}\n\nPlease let me know availability and private quote details. Thank you!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/436642035445?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="hero-master-wrapper">
      {/* 
        =======================================================================
        ROUNDED LUXURY HERO BANNER CONTAINER
        - Desktop: 620px | Laptop: 580px | Tablet: auto (min 520px) | Mobile: auto
        - Margin: 15px top, 35px sides, 25px bottom (mobile: 15px top, 12px sides, 25px bottom)
        - Radius: 22px (mobile: 14px)
        - Border: 1px solid #E8E1D5
        - Shadow: 0 12px 35px rgba(0,0,0,0.06)
        =======================================================================
      */}
      <div className="hero-rounded-banner vdt-hero">
        {/* Two-Column Layout Grid: 55% Left Content, 45% Right Booking Form */}
        <div className="hero-grid-layout vdt-inner">
          {/* =============================================================
              LEFT SIDE CONTENT (55%)
              ============================================================= */}
          <div className="hero-left-content">
            {/* Eyebrow Label */}
            <div className="hero-eyebrow-container">
              <div className="hero-eyebrow-brand">
                <span className="hero-eyebrow-text">VIENNA DAY TRIP</span>
                <span className="hero-eyebrow-line" />
              </div>
              <div className="hero-eyebrow-sub">
                PRIVATE CHAUFFEUR EXPERIENCES
              </div>
            </div>

            {/* Reduced & Responsive Heading */}
            <h1 className="hero-heading">
              Every Journey.<br />
              <span className="hero-heading-italic">Exceptionally</span> Yours.
            </h1>

            {/* Description */}
            <p className="hero-description">
              Luxury private transfers, VIP airport concierge and unforgettable day trips across Vienna and Central Europe with professional chauffeurs and premium Mercedes-Benz vehicles.
            </p>

            {/* 4 Feature Checklist Items in compact 2x2 grid to prevent overlapping the Mercedes bumper */}
            <div className="hero-features-grid">
              {[
                { title: 'Professional Chauffeurs', icon: ShieldCheck },
                { title: 'Premium Mercedes Fleet', icon: Car },
                { title: 'Private European Day Trips', icon: Compass },
                { title: '24/7 Availability', icon: Clock }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="hero-feature-item">
                    <div className="hero-feature-icon-box">
                      <Icon size={12} strokeWidth={2.2} />
                    </div>
                    <span className="hero-feature-text">{item.title}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="hero-cta-wrapper">
              <Link to="/our-services/" className="hero-cta-btn">
                <span>EXPLORE OUR SERVICES</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* =============================================================
              RIGHT SIDE: COMPACT LUXURY BOOKING FORM (45%)
              - Width: 460px
              - Padding: 24px
              - Border radius: 16px
              - Input height: 45px
              - Gap: 14px
              - Button height: 52px
              ============================================================= */}
          <div className="hero-right-content">
            <div id="hero-booking-card" className="hero-compact-card vdt-form">
              {/* 3 Booking Tabs */}
              <div className="hero-tabs-row">
                {[
                  { id: 'airport', label: 'Airport Transfer', icon: Plane },
                  { id: 'daytrip', label: 'Private Day Trip', icon: Car },
                  { id: 'hourly', label: 'Hourly Chauffeur', icon: Clock }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`hero-tab-btn ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={13} style={{ flexShrink: 0 }} />
                      <span className="hero-tab-label">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Booking Form Fields: 2 Columns */}
              <form onSubmit={handleGetQuote}>
                <div className="hero-form-fields-grid">
                  {/* Field 1: Pickup Location */}
                  <div>
                    <label className="hero-field-label">PICKUP LOCATION</label>
                    <div className="hero-input-wrapper">
                      <MapPin size={13} className="hero-field-icon" />
                      <select
                        value={formData.pickup}
                        onChange={(e) => handleInputChange('pickup', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="Vienna International Airport (VIE)">Vienna Airport (VIE)</option>
                        <option value="Vienna City Center (Innere Stadt)">Vienna City Center</option>
                        <option value="Hotel Sacher / Bristol / Imperial">Hotel Sacher / Imperial</option>
                        <option value="Vienna Central Station (Hauptbahnhof)">Vienna Central Station</option>
                        <option value="Private Address / Residence">Private Address</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 2: Drop-Off Location */}
                  <div>
                    <label className="hero-field-label">DROP-OFF LOCATION</label>
                    <div className="hero-input-wrapper">
                      <MapPin size={13} className="hero-field-icon" />
                      <select
                        value={formData.dropoff}
                        onChange={(e) => handleInputChange('dropoff', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="Hotel name or destination">Hotel or destination</option>
                        <option value="Vienna City Center (Innere Stadt)">Vienna City Center</option>
                        <option value="Vienna International Airport (VIE)">Vienna Airport (VIE)</option>
                        <option value="Hallstatt (Salzkammergut)">Hallstatt Day Trip</option>
                        <option value="Salzburg (Historic Center)">Salzburg Day Trip</option>
                        <option value="Budapest (Hungary)">Budapest Day Trip</option>
                        <option value="Prague (Czech Republic)">Prague Day Trip</option>
                        <option value="Bratislava (Slovakia)">Bratislava Day Trip</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 3: Pickup Date */}
                  <div>
                    <label className="hero-field-label">PICKUP DATE</label>
                    <div className="hero-input-wrapper">
                      <CalendarIcon size={13} className="hero-field-icon" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="hero-custom-input"
                      />
                    </div>
                  </div>

                  {/* Field 4: Pickup Time */}
                  <div>
                    <label className="hero-field-label">PICKUP TIME</label>
                    <div className="hero-input-wrapper">
                      <Clock size={13} className="hero-field-icon" />
                      <select
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="02:00">02:00</option>
                        <option value="06:00">06:00</option>
                        <option value="08:00">08:00</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="12:00">12:00</option>
                        <option value="14:00">14:00</option>
                        <option value="16:00">16:00</option>
                        <option value="18:00">18:00</option>
                        <option value="20:00">20:00</option>
                        <option value="22:00">22:00</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 5: Passengers */}
                  <div>
                    <label className="hero-field-label">PASSENGERS</label>
                    <div className="hero-input-wrapper">
                      <Users size={13} className="hero-field-icon" />
                      <select
                        value={formData.passengers}
                        onChange={(e) => handleInputChange('passengers', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="1 Passenger">1 Passenger</option>
                        <option value="2 Passengers">2 Passengers</option>
                        <option value="3 Passengers">3 Passengers</option>
                        <option value="4-7 Passengers (Van)">4-7 Passengers</option>
                        <option value="8+ Passengers (Sprinter)">8+ Passengers</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 6: Preferred Vehicle */}
                  <div>
                    <label className="hero-field-label">PREFERRED VEHICLE</label>
                    <div className="hero-input-wrapper">
                      <Car size={13} className="hero-field-icon" />
                      <select
                        value={formData.vehicle}
                        onChange={(e) => handleInputChange('vehicle', e.target.value)}
                        className="hero-custom-select"
                      >
                        <option value="Mercedes S-Class">Mercedes S-Class</option>
                        <option value="Mercedes E-Class">Mercedes E-Class</option>
                        <option value="Mercedes V-Class">Mercedes V-Class</option>
                        <option value="Mercedes Sprinter VIP">Mercedes Sprinter</option>
                      </select>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="hero-form-error">
                    {errorMsg}
                  </div>
                )}

                {/* Booking Button: Height 52px */}
                <button type="submit" className="hero-quote-btn">
                  <span>GET YOUR PRIVATE QUOTE</span>
                  <ArrowRight size={15} />
                </button>

                {/* Subtext Reassurance */}
                <div className="hero-reassurance-row">
                  <Lock size={12} style={{ opacity: 0.6 }} />
                  <span>No payment required. Get a personalized quote via WhatsApp.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================
          BOTTOM TRUST BAR (Preserved cleanly below the hero banner)
          ============================================================= */}
      <div className="hero-trust-container">
        <div className="hero-trust-inner-card">
          <div className="hero-trust-grid">
            {/* Column 1 */}
            <div className="hero-trust-item">
              <div className="hero-trust-icon-box">
                <ShieldCheck size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">Professional Chauffeurs</h4>
                <p className="hero-trust-sub">Experienced & Licensed</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Gem size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">Premium Mercedes-Benz Fleet</h4>
                <p className="hero-trust-sub">Luxury & Comfort</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Compass size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">Flexible Private Journeys</h4>
                <p className="hero-trust-sub">Vienna & Beyond</p>
              </div>
            </div>

            {/* Column 4 */}
            <div className="hero-trust-item hero-trust-bordered">
              <div className="hero-trust-icon-box">
                <Clock size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="hero-trust-title">24/7 Availability</h4>
                <p className="hero-trust-sub">Always at Your Service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped CSS Styles for Pixel-Perfect Accuracy Across All Breakpoints */}
      <style>{`
        /* Master Hero Wrapper: Ensures hero starts directly below fixed 74px navbar */
        .hero-master-wrapper {
          padding-top: 74px;
          position: relative;
          width: 100%;
          background-color: var(--bg-main, #FFFFFF);
        }

        /* 
          1 & 2. Rounded Luxury Hero Banner Container
          - Desktop height: 620px
          - Laptop height: 580px
          - Tablet height: auto, min 520px
          - Mobile height: auto
          - Margins: top 15px, sides 35px, bottom 25px
          - Radius: 24px
          - Border: 1px solid #E6D8C3
          - Shadow: 0 12px 35px rgba(0,0,0,0.06)
        */
        .hero-rounded-banner {
          height: 620px;
          margin: 15px 35px 25px 35px;
          border-radius: 24px;
          border: 1px solid #E6D8C3;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          isolation: isolate;
          display: flex;
          align-items: center;
        }

        /* HERO CONTAINER & BACKGROUND IMAGE */
        .vdt-hero {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border-radius: 24px;
          border: 1px solid #E6D8C3;
        }

        .vdt-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url('/images/vienna-hero-clean.jpg');
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 1;
          z-index: -2;
        }

        /* REDUCE WHITE OVERLAY */
        .vdt-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(250, 248, 244, 0.88) 0%,
            rgba(250, 248, 244, 0.65) 25%,
            rgba(250, 248, 244, 0.18) 48%,
            rgba(250, 248, 244, 0.00) 70%
          );
          z-index: -1;
          pointer-events: none;
        }

        /* CONTENT */
        .vdt-inner {
          position: relative;
          z-index: 1;
        }

        /* BOOKING FORM */
        .vdt-form {
          position: relative;
          z-index: 2;
          background: #FFFFFF;
          box-shadow: 0 12px 35px rgba(0,0,0,0.10);
        }

        /* 6. Clean Two-Column Layout Grid (55% Left, 45% Right) */
        .hero-grid-layout {
          display: grid;
          grid-template-columns: 55% 45%;
          align-items: center;
          width: 100%;
          height: 100%;
          padding: 0 clamp(24px, 3.8vw, 48px);
          position: relative;
          z-index: 10;
        }

        /* Left Side Content Area (55%) */
        .hero-left-content {
          max-width: 490px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-eyebrow-container {
          margin-bottom: 0.35rem;
        }

        .hero-eyebrow-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.15rem;
        }

        .hero-eyebrow-text {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #62666D;
        }

        .hero-eyebrow-line {
          width: 50px;
          height: 1px;
          background-color: #C69C50;
          opacity: 0.75;
        }

        .hero-eyebrow-sub {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #C69C50;
        }

        /* 5. Heading Typography: Desktop 58px, Laptop 52px, Tablet 44px, Mobile 36px */
        .hero-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 58px;
          line-height: 1.08;
          font-weight: 600;
          color: #17191C;
          letter-spacing: -0.015em;
          margin: 0 0 0.55rem 0;
        }

        .hero-heading-italic {
          color: #C69C50;
          font-style: italic;
          font-weight: 500;
          margin-right: 0.18em;
        }

        .hero-description {
          font-family: var(--font-body);
          font-size: 0.90rem;
          line-height: 1.5;
          color: #555962;
          max-width: 460px;
          margin: 0 0 0.75rem 0;
        }

        /* Features List: 2x2 Grid avoids overlap with the car's front bumper */
        .hero-features-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.35rem 0.85rem;
          margin-bottom: 0.85rem;
          max-width: 450px;
        }

        .hero-feature-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .hero-feature-icon-box {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid #C69C50;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C69C50;
          flex-shrink: 0;
        }

        .hero-feature-text {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 600;
          color: #17191C;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        /* CTA & Indicator */
        .hero-cta-wrapper {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #C69C50;
          color: #FFFFFF;
          border-radius: 28px;
          padding: 0.68rem 1.65rem;
          font-family: var(--font-heading);
          font-size: 0.80rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 5px 16px rgba(198, 156, 80, 0.32);
          transition: all 0.25s ease;
        }

        .hero-cta-btn:hover {
          background-color: #B58B3F;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(198, 156, 80, 0.45);
        }

        .hero-slider-counter {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.78rem;
          font-family: var(--font-heading);
        }

        .counter-active {
          font-weight: 800;
          color: #17191C;
        }

        .counter-bar {
          width: 32px;
          height: 2px;
          background-color: #C69C50;
          border-radius: 2px;
        }

        .counter-muted {
          color: #8E929B;
          font-weight: 500;
        }

        /* 
          4. Compact Booking Form
          - Desktop width: 460px
          - Padding: 24px
          - Border radius: 16px
          - Input height: 45px
          - Gap between fields: 14px
          - Booking button height: 52px
        */
        .hero-right-content {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .hero-compact-card {
          width: 100%;
          max-width: 460px;
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(232, 225, 213, 0.9);
          position: relative;
        }

        .hero-tabs-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.45rem;
          margin-bottom: 0.9rem;
        }

        .hero-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.55rem 0.25rem;
          border-radius: 8px;
          border: 1px solid #E8E4DC;
          background-color: #FFFFFF;
          color: #17191C;
          font-family: var(--font-heading);
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hero-tab-btn.active {
          border-color: #C69C50;
          background-color: #C69C50;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(198, 156, 80, 0.25);
        }

        .hero-tab-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-form-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .hero-field-label {
          display: block;
          font-family: var(--font-heading);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #62666D;
          margin-bottom: 0.3rem;
        }

        .hero-input-wrapper {
          position: relative;
        }

        .hero-field-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #C69C50;
          pointer-events: none;
        }

        .hero-custom-select,
        .hero-custom-input {
          width: 100%;
          height: 45px;
          background-color: #FFFFFF;
          border: 1px solid #E8E4DC;
          border-radius: 8px;
          padding: 0 0.65rem 0 1.95rem;
          font-family: var(--font-body);
          font-size: 0.81rem;
          color: #17191C;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .hero-custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2362666D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 11px;
        }

        .hero-custom-select:focus,
        .hero-custom-input:focus {
          border-color: #C69C50;
          box-shadow: 0 0 0 2px rgba(198, 156, 80, 0.15);
        }

        .hero-form-error {
          color: #DC2626;
          font-size: 0.78rem;
          font-family: var(--font-body);
          margin-bottom: 0.65rem;
          text-align: center;
        }

        .hero-quote-btn {
          width: 100%;
          height: 52px;
          background-color: #C69C50;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-family: var(--font-heading);
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(198, 156, 80, 0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          transition: all 0.25s ease;
        }

        .hero-quote-btn:hover {
          background-color: #B58B3F;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(198, 156, 80, 0.42);
        }

        .hero-reassurance-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 0.65rem;
          color: #62666D;
          font-size: 0.74rem;
          font-family: var(--font-body);
        }

        /* Bottom Floating Trust Bar (Preserved) */
        .hero-trust-container {
          width: 100%;
          max-width: 100%;
          padding: 0 35px;
          margin-bottom: 2rem;
        }

        .hero-trust-inner-card {
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 1rem 1.6rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #E8E1D5;
        }

        .hero-trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0 0.85rem;
        }

        .hero-trust-bordered {
          border-left: 1px solid #E8E4DC;
        }

        .hero-trust-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1.5px solid #C69C50;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C69C50;
          flex-shrink: 0;
        }

        .hero-trust-title {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          font-weight: 700;
          color: #17191C;
          margin: 0 0 0.1rem 0;
        }

        .hero-trust-sub {
          font-size: 0.75rem;
          color: #62666D;
          margin: 0;
        }

        /* 
          =============================================================
          RESPONSIVE BREAKPOINTS (Laptop, Tablet, Mobile)
          =============================================================
        */

        /* Laptop (1024px - 1280px) */
        @media (max-width: 1280px) and (min-width: 1024px) {
          .hero-rounded-banner {
            height: 580px;
          }
          .hero-heading {
            font-size: 52px;
          }
          .hero-mercedes-img {
            object-position: 40% 82%;
          }
          .hero-compact-card {
            max-width: 420px;
            padding: 20px;
          }
        }

        /* Tablet (769px - 1023px): Adjust spacing and form width per requirement 9 */
        @media (max-width: 1023px) and (min-width: 769px) {
          .hero-rounded-banner {
            height: auto;
            min-height: 520px;
            padding: 30px 0;
          }
          .hero-grid-layout {
            grid-template-columns: 1.05fr 0.95fr;
            gap: 20px;
            height: auto;
            padding: 0 24px;
          }
          .hero-left-content {
            max-width: 100%;
          }
          .hero-heading {
            font-size: 44px;
          }
          .hero-compact-card {
            max-width: 100%;
            padding: 20px 18px;
          }
          .hero-mercedes-img {
            object-position: 45% 80%;
          }
          .hero-trust-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
          .hero-trust-bordered {
            border-left: none;
          }
        }

        /* Mobile (<= 768px): Stack text and booking form vertically per requirement 9 */
        @media (max-width: 768px) {
          .hero-rounded-banner {
            height: auto;
            min-height: unset;
            margin: 15px 12px 25px 12px;
            border-radius: 14px;
            padding: 24px 0;
          }
          .hero-grid-layout {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 0 16px;
            height: auto;
          }
          .hero-left-content {
            max-width: 100%;
          }
          .hero-heading {
            font-size: 36px;
            line-height: 1.15;
          }
          .hero-description {
            font-size: 0.88rem;
          }
          .hero-features-grid {
            grid-template-columns: 1fr;
            gap: 0.4rem;
          }
          .hero-cta-wrapper {
            flex-wrap: wrap;
            gap: 1rem;
          }
          .hero-right-content {
            justify-content: stretch;
          }
          .hero-compact-card {
            max-width: 100%;
            padding: 18px 14px;
            border-radius: 14px;
          }
          .hero-form-fields-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .hero-tabs-row {
            gap: 0.3rem;
          }
          .hero-tab-btn {
            font-size: 0.7rem;
            padding: 0.5rem 0.2rem;
          }
          .vdt-hero::before {
            background-position: 58% center;
          }
          .vdt-hero::after {
            background: linear-gradient(
              180deg,
              rgba(250, 248, 244, 0.88) 0%,
              rgba(250, 248, 244, 0.55) 48%,
              rgba(250, 248, 244, 0.15) 100%
            );
          }
          .hero-trust-container {
            padding: 0 12px;
          }
          .hero-trust-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .hero-trust-bordered {
            border-left: none;
          }
        }
      `}</style>
    </div>
  );
}
