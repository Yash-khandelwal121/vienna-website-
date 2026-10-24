import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Car, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { siteConfig } from '../data/site';

export default function BookingWidget({ floating = false }) {
  const [activeTab, setActiveTab] = useState('daytrip'); // 'transfer' | 'daytrip' | 'hourly'
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('Hallstatt From Vienna');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [passengers, setPassengers] = useState('2');
  const [vehicle, setVehicle] = useState('Mercedes-Benz V-Class');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
    if (tab === 'transfer') {
      setPickup('Vienna International Airport (VIE)');
      setDestination('Vienna City Center / Hotel');
    } else if (tab === 'daytrip') {
      setPickup('Vienna Hotel / Residence');
      setDestination('Hallstatt From Vienna');
    } else if (tab === 'hourly') {
      setPickup('Vienna Hotel / Address');
      setDestination('Vienna City (Hourly Standby)');
    }
  };

  const validate = () => {
    const errs = {};
    if (!pickup.trim()) errs.pickup = 'Please provide a pickup location';
    if (!destination.trim()) errs.destination = 'Please provide a destination';
    if (!date) errs.date = 'Select date';
    if (!time) errs.time = 'Select time';
    return errs;
  };

  const handleBooking = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);

    const tabName =
      activeTab === 'transfer'
        ? 'Airport Transfer'
        : activeTab === 'daytrip'
        ? 'Private Day Trip'
        : 'Hourly Chauffeur';

    const message = `Hello Vienna Day Trip! I would like to request a booking inquiry:
• Service: ${tabName}
• Pickup Location: ${pickup}
• Destination / Route: ${destination}
• Date: ${date}
• Pickup Time: ${time}
• Passengers: ${passengers}
• Preferred Vehicle: ${vehicle}

Please confirm availability and provide a tailored quote. Thank you!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=436642035445&text=${encoded}&type=phone_number&app_absent=0`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setSubmitted(false);
    }, 900);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 25px 65px rgba(0, 0, 0, 0.07), 0 2px 10px rgba(0, 0, 0, 0.02)',
        padding: 'clamp(1.25rem, 3vw, 2.25rem)',
        position: 'relative',
        zIndex: 50
      }}
    >
      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        {[
          { id: 'transfer', label: 'Airport Transfer' },
          { id: 'daytrip', label: 'Private Day Trip' },
          { id: 'hourly', label: 'Hourly Chauffeur' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1px solid rgba(197, 160, 89, 0.45)' : '1px solid rgba(0, 0, 0, 0.06)',
                background: isActive ? 'linear-gradient(135deg, #DFC187 0%, #C5A059 50%, #967425 100%)' : '#F3F4F7',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? '0 4px 18px rgba(197, 160, 89, 0.35)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Booking Form Inputs */}
      <form onSubmit={handleBooking}>
        <div className="booking-widget-grid">
          {/* Pickup Location */}
          <div>
            <label className="label-strada">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} style={{ color: 'var(--accent)' }} /> Pickup Location
              </span>
            </label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="e.g. Vienna Airport VIE or Hotel"
              className="input-strada"
              style={{ borderColor: errors.pickup ? '#ff4d4f' : undefined }}
            />
          </div>

          {/* Destination */}
          <div>
            <label className="label-strada">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} style={{ color: 'var(--accent)' }} /> Destination
              </span>
            </label>
            {activeTab === 'daytrip' ? (
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input-strada"
                style={{ borderColor: errors.destination ? '#ff4d4f' : undefined }}
              >
                <option value="Hallstatt From Vienna">Hallstatt From Vienna</option>
                <option value="Salzburg From Vienna">Salzburg From Vienna</option>
                <option value="Budapest From Vienna">Budapest From Vienna</option>
                <option value="Prague From Vienna">Prague From Vienna</option>
                <option value="Bratislava From Vienna">Bratislava From Vienna</option>
                <option value="Wachau valley From Vienna">Wachau valley From Vienna</option>
                <option value="Vienna Sightseeing Tour">Vienna Sightseeing Tour</option>
                <option value="Custom Itinerary">Custom Itinerary (Describe in chat)</option>
              </select>
            ) : (
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Hotel / City / Address"
                className="input-strada"
                style={{ borderColor: errors.destination ? '#ff4d4f' : undefined }}
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label className="label-strada">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} style={{ color: 'var(--accent)' }} /> Travel Date
              </span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-strada"
              style={{ borderColor: errors.date ? '#ff4d4f' : undefined, colorScheme: 'light' }}
            />
          </div>

          {/* Time */}
          <div>
            <label className="label-strada">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} style={{ color: 'var(--accent)' }} /> Pickup Time
              </span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-strada"
              style={{ borderColor: errors.time ? '#ff4d4f' : undefined, colorScheme: 'light' }}
            />
          </div>

          {/* Passengers */}
          <div>
            <label className="label-strada">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={13} style={{ color: 'var(--accent)' }} /> Guests
              </span>
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="input-strada"
            >
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4 Passengers</option>
              <option value="5-7">5 to 7 Passengers (V-Class)</option>
              <option value="8-16">8 to 16 Passengers (Sprinter)</option>
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="label-strada">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Car size={13} style={{ color: 'var(--accent)' }} /> Fleet Class
              </span>
            </label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="input-strada"
            >
              <option value="Mercedes-Benz E-Class">Mercedes E-Class (Executive)</option>
              <option value="Mercedes-Benz S-Class">Mercedes S-Class (First Class VIP)</option>
              <option value="Mercedes-Benz V-Class">Mercedes V-Class (VIP Van)</option>
              <option value="Mercedes-Benz Sprinter VIP">Mercedes Sprinter (Group)</option>
              <option value="Armored Luxury Vehicle">Armored Vehicle (Security)</option>
            </select>
          </div>

          {/* Submit CTA */}
          <div className="booking-widget-submit-col" style={{ minWidth: '180px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', padding: '0 1.25rem' }}
              disabled={submitted}
            >
              {submitted ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>CONNECTING...</span>
                </>
              ) : (
                <>
                  <span>REQUEST BOOKING</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Errors Notice */}
        {Object.keys(errors).length > 0 && (
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ff6b6b',
              fontSize: '0.85rem'
            }}
          >
            <AlertCircle size={15} />
            <span>Please complete all highlighted fields before submitting.</span>
          </div>
        )}

        {/* Status Confirmation Bar */}
        {submitted && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1.35rem',
              backgroundColor: 'var(--accent-light)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-gold)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <CheckCircle2 size={18} />
            <span>Connecting directly with our 24/7 Vienna Day Trip dispatch on WhatsApp...</span>
          </div>
        )}
      </form>

      <style>{`
        .booking-widget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
          gap: 1rem;
          align-items: flex-end;
        }

        @media (max-width: 680px) {
          .booking-widget-grid {
            grid-template-columns: 1fr;
            gap: 1.15rem;
          }
          .booking-widget-submit-col {
            min-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
